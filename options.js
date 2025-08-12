document.addEventListener("DOMContentLoaded", () => {
    const apiKeyInput = document.getElementById('apiKey');
    const statusDiv = document.getElementById('status');
    const saveBtn = document.getElementById('saveBtn');

    // Load existing API key
    chrome.storage.sync.get(['geminiApiKey'], ({ geminiApiKey }) => {
        if (geminiApiKey) {
            apiKeyInput.value = geminiApiKey;
        }
    });

    // Save API key
    saveBtn.addEventListener('click', () => {
        const apiKey = apiKeyInput.value.trim();
        if (!apiKey) {
            statusDiv.textContent = "Please enter a valid API key.";
            statusDiv.style.color = "red";
            return;
        }
        chrome.storage.sync.set({ geminiApiKey: apiKey }, () => {
            statusDiv.textContent = "API key saved!";
            statusDiv.style.color = "green";
            setTimeout(() => {
                statusDiv.textContent = "";
            }, 2000);
        });
    });
});
