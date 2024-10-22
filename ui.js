import { getCurrentTabURL } from "./utils.js"

const addNewBookmark = (bookmarksElement, bookmark) => {
    const bookmarkTitleElement = document.createElement("div");
    const newBookmarkElement = document.createElement("div");
    const controlsElement = document.createElement("div");

    bookmarkTitleElement.textContent = bookmark.desc;
    bookmarkTitleElement.className = "bookmark-title";

    newBookmarkElement.id = "bookmark-" + bookmark.time;
    newBookmarkElement.className = "bookmark";
    newBookmarkElement.setAttribute("timestamp", bookmark.time);

    controlsElement.className = "bookmark-controls";

    setBookmarkAttributes("play", onPlay, controlsElement);
    setBookmarkAttributes("delete", onDelete, controlsElement);

    newBookmarkElement.appendChild(bookmarkTitleElement);
    newBookmarkElement.appendChild(controlsElement);
    bookmarksElement.appendChild(newBookmarkElement);

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

    return;
}

const onPlay = async (e) => {
    const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
    const currentTab = await getCurrentTabURL();

    chrome.tabs.sendMessage(currentTab.id, {
        type: "PLAY",
        value: bookmarkTime
    });
};

const onDelete = async (e) => {
    const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
    const currentTab = await getCurrentTabURL();
    const bookmarkElementToDelete = document.getElementById("bookmark-" + bookmarkTime);

    bookmarkElementToDelete.parentNode.removeChild(bookmarkElementToDelete);

    chrome.tabs.sendMessage(currentTab.id, {
        type: "DELETE",
        value: bookmarkTime
    }, viewBookmarks);

};

const setBookmarkAttributes = (src, eventListener, controlParentElement) => {
    const controlElement = document.createElement("img");
    controlElement.src = "assets/" + src + "_32.png";
    controlElement.title = src;
    controlElement.addEventListener("click", eventListener);
    controlParentElement.appendChild(controlElement);
};

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
