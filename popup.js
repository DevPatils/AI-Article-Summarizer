document.getElementById('summarize').addEventListener('click', async () => {
    const result = document.getElementById('result');
    result.textContent = "Summarizing...";

    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { type: "GET_ARTICLE_TEXT" }, async (response) => {
            // Handle the response here
            // For example:
            // result.textContent = response.summary || "No summary available.";
        });
    });
});
    