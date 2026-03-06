chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "callGemini") {
        fetch("http://localhost:8000/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                latex_code: request.context,
                query: request.query || "",
                action_type: request.actionType // Routes to autocomplete, review, edit, or chat
            })
        })
        .then(res => res.json())
        .then(data => sendResponse({ success: true, answer: data.response }))
        .catch(err => sendResponse({ success: false, answer: err.message }));

        return true;
    }
});