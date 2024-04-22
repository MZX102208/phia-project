const IDLE_DURATION = 500; // 1.5 seconds

/**
 * Utility function to wait for the network to be idle for a specified duration.
 * @param tabId The tab ID to monitor network activity for.
 */

export default async function awaitNetworkIdle(tabId: number): Promise<void> {
    return new Promise(resolve => {
        let activeRequests = 0;
        let idleTimer: ReturnType<typeof setTimeout>;
        let autoResolveTimer: ReturnType<typeof setTimeout>;
        const requestTimeouts = new Map<string, ReturnType<typeof setTimeout>>(); // Track timeouts for individual requests

        const cleanup = () => {
            clearTimeout(idleTimer);
            clearTimeout(autoResolveTimer);
            requestTimeouts.forEach(timeout => clearTimeout(timeout));
            chrome.webRequest.onBeforeRequest.removeListener(onBeforeRequest);
            chrome.webRequest.onCompleted.removeListener(onRequestCompletedOrError);
            chrome.webRequest.onErrorOccurred.removeListener(onRequestCompletedOrError);
        };

        const resetIdleTimer = () => {
            clearTimeout(idleTimer);
            if (activeRequests === 0) {
                idleTimer = setTimeout(() => {
                    resolve(); // Resolve the promise when the network is idle
                    cleanup(); // Clean up listeners automatically after idle is detected
                }, IDLE_DURATION);
            }
        };

        const onRequestTimeout = (requestId: string) => {
            activeRequests = Math.max(0, activeRequests - 1);
            requestTimeouts.delete(requestId);
            resetIdleTimer();
        };

        const onBeforeRequest = (details: chrome.webRequest.WebRequestBodyDetails) => {
            if (details.tabId === tabId) {
                activeRequests += 1;
                resetIdleTimer();
                // Set a timeout for each request
                const requestTimeoutId = setTimeout(() => onRequestTimeout(details.requestId), 10 * 1000);
                requestTimeouts.set(details.requestId, requestTimeoutId);
            }
        };

        const onRequestCompletedOrError = (details: chrome.webRequest.WebResponseDetails) => {
            if (details.tabId === tabId) {
                activeRequests = Math.max(0, activeRequests - 1);
                // Clear the request's timeout upon completion or error
                const requestTimeoutId = requestTimeouts.get(details.requestId);
                if (requestTimeoutId) {
                    clearTimeout(requestTimeoutId);
                    requestTimeouts.delete(details.requestId);
                }
                resetIdleTimer();
            }
        };

        // Set up listeners for network request events
        chrome.webRequest.onBeforeRequest.addListener(onBeforeRequest, { urls: ['<all_urls>'], tabId });

        chrome.webRequest.onCompleted.addListener(onRequestCompletedOrError, { urls: ['<all_urls>'], tabId });

        chrome.webRequest.onErrorOccurred.addListener(onRequestCompletedOrError, {
            urls: ['<all_urls>'],
            tabId,
        });

        // Set up an auto-resolve timer to conclude idle detection after a fixed time (e.g., 1 minute)
        autoResolveTimer = setTimeout(() => {
            resolve(); // Resolve the promise indicating the end of monitoring
            cleanup(); // Ensure cleanup is done to prevent memory leaks
        }, 1 * 60 * 1000);
    });
}
