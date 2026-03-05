let typingTimer;
const DONE_TYPING_INTERVAL = 1200; // Wait 1.2s after typing to trigger autocomplete
let currentSuggestion = "";

// --- 1. CORE UTILITIES ---
function getOverleafText() {
    return Array.from(document.querySelectorAll('.cm-line, .ace_line'))
                .map(line => line.innerText).join('\n');
}

function getSelectedText() {
    const selection = window.getSelection();
    return selection ? selection.toString() : "";
}

function insertTextSafely(text) {
    // Safest way to insert text in web editors without breaking internal history
    document.execCommand("insertText", false, text);
}

// --- 2. AUTOCOMPLETE ENGINE ---
function setupAutocomplete() {
    const suggestionBox = document.createElement('div');
    suggestionBox.id = 'gemini-autocomplete-box';
    document.body.appendChild(suggestionBox);

    // Listen to typing in Overleaf's editor area
    document.addEventListener('keyup', (e) => {
        clearTimeout(typingTimer);
        suggestionBox.style.display = 'none';
        currentSuggestion = "";

        // If user presses Tab while suggestion is active, insert it
        if (e.key === 'Tab' && currentSuggestion !== "") {
            e.preventDefault(); // Stop default tab behavior
            insertTextSafely(currentSuggestion + " ");
            currentSuggestion = "";
            return;
        }

        // Only trigger on actual text input (ignore arrows, modifiers, etc)
        if (e.key.length === 1 || e.key === 'Backspace') {
            typingTimer = setTimeout(fetchAutocomplete, DONE_TYPING_INTERVAL);
        }
    });

    // Also block default Tab behavior on keydown so it doesn't indent if a suggestion exists
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab' && currentSuggestion !== "") {
            e.preventDefault();
        }
    });
}

function fetchAutocomplete() {
    // Get the active line/paragraph to send to Gemini
    const selection = window.getSelection();
    if (!selection || !selection.focusNode) return;

    // Find the current CodeMirror line
    let activeNode = selection.focusNode;
    while (activeNode && !activeNode.classList?.contains('cm-line')) {
        activeNode = activeNode.parentNode;
    }

    if (!activeNode) return;
    const currentParagraph = activeNode.innerText;
    if (currentParagraph.trim().length < 10) return; // Too short to guess

    // Position the box near the cursor
    const cursor = document.querySelector('.cm-cursor');
    if (cursor) {
        const rect = cursor.getBoundingClientRect();
        const box = document.getElementById('gemini-autocomplete-box');
        box.style.left = `${rect.left + 5}px`;
        box.style.top = `${rect.bottom + 5}px`;
        box.style.display = 'block';
        box.innerText = "✨ Thinking...";

        chrome.runtime.sendMessage({
            action: "callGemini",
            actionType: "autocomplete",
            context: currentParagraph
        }, (res) => {
            if (res.success && res.answer.length > 5) {
                currentSuggestion = res.answer;
                box.innerHTML = `<span style="color:#888;">${currentSuggestion}</span> <span style="background:#444; color:white; font-size:10px; padding:2px 4px; border-radius:3px;">Press Tab</span>`;
            } else {
                box.style.display = 'none';
            }
        });
    }
}

// --- 3. UI INJECTION & SIDEBAR ---
function injectUI() {
    if (document.getElementById('gemini-sidebar')) return;

    const sidebar = document.createElement('div');
    sidebar.id = 'gemini-sidebar';
    sidebar.innerHTML = `
        <div id="gemini-tabs">
            <button class="g-tab active" data-tab="chat">Chat</button>
            <button class="g-tab" data-tab="edit">Edit</button>
            <button class="g-tab" data-tab="review">Review</button>
        </div>
        
        <div id="g-content-chat" class="g-panel active">
            <div class="g-messages" id="chat-msgs"></div>
            <div class="g-input-area">
                <input type="text" id="chat-input" placeholder="Ask a question..." />
                <button id="chat-send">Send</button>
            </div>
        </div>

        <div id="g-content-edit" class="g-panel">
            <div class="g-info">Highlight text in Overleaf, describe how to change it, and click Rewrite.</div>
            <textarea id="edit-instructions" placeholder="e.g., 'Make this sound more formal' or 'Summarize this section'"></textarea>
            <button id="edit-btn" class="g-btn">Rewrite Selection</button>
            <div id="edit-result" class="g-result-box hidden"></div>
        </div>

        <div id="g-content-review" class="g-panel">
            <button id="review-btn" class="g-btn">Run Full Document Review</button>
            <div id="review-result" class="g-result-box hidden"></div>
        </div>
        
        <button id="gemini-main-toggle">✨</button>
    `;
    document.body.appendChild(sidebar);

    bindEvents();
}

function bindEvents() {
    // Toggling Sidebar
    const sidebar = document.getElementById('gemini-sidebar');
    document.getElementById('gemini-main-toggle').onclick = () => sidebar.classList.toggle('open');

    // Toggling Tabs
    document.querySelectorAll('.g-tab').forEach(tab => {
        tab.onclick = (e) => {
            document.querySelectorAll('.g-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.g-panel').forEach(p => p.classList.remove('active'));
            e.target.classList.add('active');
            document.getElementById(`g-content-${e.target.dataset.tab}`).classList.add('active');
        };
    });

    // Chat Event
    document.getElementById('chat-send').onclick = () => {
        const input = document.getElementById('chat-input');
        const query = input.value.trim();
        if (!query) return;
        appendMsg('chat-msgs', query, 'user');
        input.value = '';

        chrome.runtime.sendMessage({ action: "callGemini", actionType: "chat", context: getOverleafText(), query: query },
        (res) => appendMsg('chat-msgs', res.answer, 'ai'));
    };

    // Edit Event
    document.getElementById('edit-btn').onclick = () => {
        const selected = getSelectedText();
        if (!selected) return alert("Please highlight text in Overleaf first!");
        const instructions = document.getElementById('edit-instructions').value;
        const resultBox = document.getElementById('edit-result');

        resultBox.classList.remove('hidden');
        resultBox.innerText = "Rewriting...";

        chrome.runtime.sendMessage({ action: "callGemini", actionType: "edit", context: selected, query: instructions },
        (res) => {
            resultBox.innerHTML = `<strong>Result:</strong><br/><br/>${res.answer.replace(/\n/g, '<br/>')}`;
        });
    };

    // Review Event
    document.getElementById('review-btn').onclick = () => {
        const resultBox = document.getElementById('review-result');
        resultBox.classList.remove('hidden');
        resultBox.innerText = "Reviewing document. This might take 10-20 seconds for deep analysis...";

        chrome.runtime.sendMessage({ action: "callGemini", actionType: "review", context: getOverleafText(), query: "" },
        (res) => {
            resultBox.innerHTML = res.answer.replace(/\n/g, '<br/>');
        });
    };
}

function appendMsg(containerId, text, type) {
    const div = document.createElement('div');
    div.className = `g-msg g-msg-${type}`;
    div.innerText = text;
    const container = document.getElementById(containerId);
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

// Initialize
setTimeout(() => {
    injectUI();
    setupAutocomplete();
}, 3000);