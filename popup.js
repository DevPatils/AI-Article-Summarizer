document.getElementById('summarize').addEventListener('click', () => {
    const result = document.getElementById('result');
    const summaryType = document.getElementById("summary-type").value;
    result.innerHTML = '<div class="loader"></div>';

    chrome.storage.sync.get(['geminiApiKey'], ({ geminiApiKey }) => {
        if (!geminiApiKey) {
            result.textContent = "No API key found. Please set it in options.";
            return;
        }

        chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
            chrome.scripting.executeScript(
                {
                    target: { tabId: tab.id },
                    files: ['content.js']
                },
                () => {
                    chrome.tabs.sendMessage(tab.id, { type: "GET_ARTICLE_TEXT" }, async (response) => {
                        if (chrome.runtime.lastError) {
                            result.textContent = "Error: " + chrome.runtime.lastError.message;
                            return;
                        }

                        const articleText = response?.text;
                        if (!articleText) {
                            result.textContent = "No article text found.";
                            return;
                        }

                        try {
                            const summary = await getGeminiSummary(geminiApiKey, articleText, summaryType);
                            result.textContent = summary;
                        } catch (err) {
                            result.textContent = "Error fetching summary: " + err.message;
                            console.error("Gemini API Error Details:", err);
                        }
                    });
                }
            );
        });
    });
});

// Open Options Page button logic
document.getElementById('open-options').addEventListener('click', () => {
    if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
    } else {
        window.open(chrome.runtime.getURL('options.html'));
    }
});

/**
 * Sends text to Gemini API and returns the summary
 */
async function getGeminiSummary(apiKey, text, type) {
    let prompt;
    switch (type) {
        case "brief":
            prompt = `Summarize this text in a short and concise way:\n\n${text}`;
            break;
        case "detailed":
            prompt = `Write a detailed summary of the following text:\n\n${text}`;
            break;
        case "bullets":
            prompt = `Summarize the following text into bullet points:\n\n${text}`;
            break;
        default:
            prompt = `Summarize the following text:\n\n${text}`;
    }

    const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        }
    );

    let data;
    try {
        data = await res.json();
    } catch (e) {
        throw new Error(`Gemini API error: Invalid JSON response`);
    }

    if (!res.ok) {
        throw new Error(`Gemini API error: ${data.error?.message || res.statusText || "Unknown error"}`);
    }

    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "No summary generated.";
}
