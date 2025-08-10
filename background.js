chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension installed successfully.");
    chrome.storage.sync.get(['geminiApiKey'],(result)=>{
        if(!result.geminiApiKey) {
            chrome.tabs.create({
                url: chrome.runtime.getURL('options.html')})
        }
    })
});