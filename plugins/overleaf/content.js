let typingTimer;
const DONE_TYPING_INTERVAL = 1200;
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
    document.execCommand("insertText", false, text);
}

// --- 2. AUTOCOMPLETE ENGINE ---
function setupAutocomplete() {
    const suggestionBox = document.createElement('div');
    suggestionBox.id = 'gemini-autocomplete-box';
    document.body.appendChild(suggestionBox);

    document.addEventListener('keyup', (e) => {
        clearTimeout(typingTimer);
        suggestionBox.style.display = 'none';
        currentSuggestion = "";

        if (e.key === 'Tab' && currentSuggestion !== "") {
            e.preventDefault();
            insertTextSafely(currentSuggestion + " ");
            currentSuggestion = "";
            return;
        }

        if (e.key.length === 1 || e.key === 'Backspace') {
            typingTimer = setTimeout(fetchAutocomplete, DONE_TYPING_INTERVAL);
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab' && currentSuggestion !== "") {
            e.preventDefault();
        }
    });
}

function fetchAutocomplete() {
    const selection = window.getSelection();
    if (!selection || !selection.focusNode) return;

    let activeNode = selection.focusNode;
    while (activeNode && !activeNode.classList?.contains('cm-line')) {
        activeNode = activeNode.parentNode;
    }

    if (!activeNode) return;
    const currentParagraph = activeNode.innerText;
    if (currentParagraph.trim().length < 10) return;

    const cursor = document.querySelector('.cm-cursor');
    if (cursor) {
        const rect = cursor.getBoundingClientRect();
        const box = document.getElementById('gemini-autocomplete-box');
        box.style.left = `${rect.left + 5}px`;
        box.style.top = `${rect.bottom + 5}px`;
        box.style.display = 'block';
        box.innerHTML = `<span style="opacity:0.6">✨ Thinking...</span>`;

        chrome.runtime.sendMessage({
            action: "callGemini",
            actionType: "autocomplete",
            context: currentParagraph
        }, (res) => {
            if (res.success && res.answer.length > 5) {
                currentSuggestion = res.answer;
                box.innerHTML = `
                    <span style="color:var(--g-text-dim);">${currentSuggestion}</span> 
                    <span style="background:var(--gemini-gradient); color:white; font-size:9px; padding:2px 5px; border-radius:4px; margin-left:8px; font-weight:bold;">TAB</span>
                `;
            } else {
                box.style.display = 'none';
            }
        });
    }
}

// --- 3. UI INJECTION ---
function injectUI() {
    if (document.getElementById('gemini-sidebar')) return;

    const logoUrl = chrome.runtime.getURL("logo.svg");
    const sidebar = document.createElement('div');
    sidebar.id = 'gemini-sidebar';

    sidebar.innerHTML = `
        <div class="g-header">
            <div class="g-brand">
                <img src="${logoUrl}" class="g-logo" alt="Logo">
                <span>Idea<span style="font-weight: 300; opacity: 0.8; font-family: FontAwesome,serif"> Overflow</span></span>
            </div>
            <button id="g-theme-btn" class="g-theme-toggle" title="Toggle Light/Dark">🌗</button>
        </div>

        <div id="gemini-tabs">
            <button class="g-tab active" data-tab="chat">Chat</button>
            <button class="g-tab" data-tab="edit">Edit</button>
            <button class="g-tab" data-tab="review">Review</button>
        </div>
        
        <div id="g-content-chat" class="g-panel active">
            <div class="g-messages" id="chat-msgs">
                <div class="g-msg g-msg-ai">Ready to enhance your research. How can I help?</div>
            </div>
            <div class="g-input-area">
                <input type="text" id="chat-input" placeholder="Ask a question..." />
                <button id="chat-send">Send</button>
            </div>
        </div>

        <div id="g-content-edit" class="g-panel">
            <div class="g-info">Highlight text in Overleaf to rewrite or summarize it.</div>
            <textarea id="edit-instructions" placeholder="e.g., 'Make this sound more academic'"></textarea>
            <button id="edit-btn" class="g-btn">✨ Rewrite Selection</button>
            <div id="edit-result" class="g-result-box hidden"></div>
        </div>

        <div id="g-content-review" class="g-panel">
            <div class="g-info">Analyze your entire LaTeX document for clarity, structure, and academic quality.</div>
            <button id="review-btn" class="g-btn">📋 Run Document Analysis</button>
            <div id="review-result" class="g-result-box hidden"></div>
        </div>
        
        <button id="gemini-main-toggle">✦</button>
    `;

    document.body.appendChild(sidebar);
    bindEvents();
}

function bindEvents() {
    const sidebar = document.getElementById('gemini-sidebar');

    // Sidebar Toggle
    document.getElementById('gemini-main-toggle').onclick = () => sidebar.classList.toggle('open');

    // Theme Toggle
    document.getElementById('g-theme-btn').onclick = () => {
        sidebar.classList.toggle('light-mode');
        const isLight = sidebar.classList.contains('light-mode');
        chrome.storage.local.set({ theme: isLight ? 'light' : 'dark' });
    };

    // Load Saved Theme
    chrome.storage.local.get(['theme'], (res) => {
        if (res.theme === 'light') sidebar.classList.add('light-mode');
    });

    // Tab Switching
    document.querySelectorAll('.g-tab').forEach(tab => {
        tab.onclick = (e) => {
            document.querySelectorAll('.g-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.g-panel').forEach(p => p.classList.remove('active'));
            e.target.classList.add('active');
            document.getElementById(`g-content-${e.target.dataset.tab}`).classList.add('active');
        };
    });

    // Chat Logic
    const chatInput = document.getElementById('chat-input');
    const sendChat = () => {
        const query = chatInput.value.trim();
        if (!query) return;
        appendMsg('chat-msgs', query, 'user');
        chatInput.value = '';

        chrome.runtime.sendMessage({
            action: "callGemini",
            actionType: "chat",
            context: getOverleafText(),
            query: query
        }, (res) => appendMsg('chat-msgs', res.answer, 'ai'));
    };

    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendChat();
    });

    document.getElementById('chat-send').onclick = sendChat;

    // Edit Logic
    document.getElementById('edit-btn').onclick = () => {
        const selected = getSelectedText();
        if (!selected) return alert("Please highlight text in Overleaf first!");
        const instructions = document.getElementById('edit-instructions').value;
        const resultBox = document.getElementById('edit-result');

        resultBox.classList.remove('hidden');
        resultBox.innerHTML = `<span style="opacity:0.6 italic">Rewriting...</span>`;

        chrome.runtime.sendMessage({
            action: "callGemini",
            actionType: "edit",
            context: selected,
            query: instructions
        }, (res) => {
            resultBox.innerHTML = `<strong>Suggested Revision:</strong><br/><br/>${res.answer.replace(/\n/g, '<br/>')}`;
        });
    };

    // Review Logic
    document.getElementById('review-btn').onclick = () => {
        const resultBox = document.getElementById('review-result');
        resultBox.classList.remove('hidden');
        resultBox.innerText = "Analyzing document structure and clarity...";

        chrome.runtime.sendMessage({
            action: "callGemini",
            actionType: "review",
            context: getOverleafText(),
            query: ""
        }, (res) => {
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

// Initialize after Overleaf loads
setTimeout(() => {
    injectUI();
    setupAutocomplete();
}, 3000);