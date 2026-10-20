const data = {
    accounts: localStorage.getItem("accounts")
};
chrome.runtime.sendMessage(data);
chrome.storage.local.get("agarMode", ({ agarMode }) => {
    const injectScript = (src) => {
        const s = document.createElement('script');
        s.src = chrome.runtime.getURL(src);
        s.onload = () => s.remove();
        (document.head || document.documentElement).append(s);
    }
    document.open();
    document.write(`
        <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            margin: 0;
            height: 100vh;
            overflow: hidden;
            background: #1a1a1a;
            display: flex;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            justify-content: center;
            align-items: center;
            flex-direction: column;
        }
        .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(255, 255, 255, 0.1);
            border-top-color: #ffffff;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        .loading-text {
            margin-top: 20px;
            color: #ffffff;
            font-size: 14px;
            font-weight: 400;
            letter-spacing: 0.5px;
        }
        </style>
        <div class="spinner"></div>
        <div class="loading-text">Loading...</div>
    `);
    document.close();
    
    // ✅ TODO ESTO SIGUE IGUAL - NO LO TOQUÉ
    const version = agarMode || "delta";
    if (version == 'delta') {
        injectScript("js/inject-delta.js");
    } else if (version == 'doublesplit') {
        injectScript("js/inject-doublesplit.js");
    }
    injectScript("js/index.js");
});