export async function getCurrentTabURL() {
    const queryOptions = {active: true, currentWindow: true};
    const tabs = await chrome.tabs.query(queryOptions);
    return tabs[0];
}
