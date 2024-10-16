import { getCurrentTabURL } from "./utils.js"

document.addEventListener("DOMContentLoaded", async () => {
    const currentTab = await getCurrentTabURL();
    const queryParameters = currentTab.url.split("?")[1];
    const urlParameters = new URLSearchParams(queryParameters);
    const currentVideo = urlParameters.get("v");

    if (currentTab.url.includes("youtube.com/watch") && currentVideo) {
        // YouTube video url
        chrome.storage.sync.get([currentVideo], (data) => {
            const currentVideoBookmarks = data[currentVideo] ? JSON.parse(data[currentVideo]) : [];

            // Show bookmarks
        })
    }
    else {
        // Not a YouTube video url
        const container = document.getElementsByClassName("youtube-bookmark-extension")[0];
        container.innerHTML = "<div>This is not a YouTube video page.</div>";
    }
});
