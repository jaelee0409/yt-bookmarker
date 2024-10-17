import { getCurrentTabURL } from "./utils.js"

const addNewBookmark = () => {

}

const viewBookmarks = (currentBookmarks=[]) => {
    const bookmarks = document.getElementById("bookmarks");
    bookmarks.innerHTML = "";

    if (currentBookmarks.length > 0) {
        for (let i = 0; i < currentBookmarks.length; ++i) {
            const bookmark = currentBookmarks[i];
            addNewBookmark(bookmarks, bookmark);

        }
    }
    else {
        bookmarks.innerHTML = '<i class="row">No bookmarks</i>';
    }
}

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
            viewBookmarks(currentVideoBookmarks);
        })
    }
    else {
        // Not a YouTube video url
        const container = document.getElementsByClassName("youtube-bookmark-extension")[0];
        container.innerHTML = '<div class="title">This is not a YouTube video page.</div>';
    }
});
