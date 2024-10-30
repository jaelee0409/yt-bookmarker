import { getCurrentTabURL } from "./utils.js"

const addBookmark = (bookmarkListElement, bookmark) => {
    const bookmarkTitleElement = document.createElement("span");
    const bookmarkTimeElement = document.createElement("span");
    const bookmarkElement = document.createElement("li");
    const actionButtonsElement = document.createElement("div");

    bookmarkTitleElement.textContent = bookmark.title;
    bookmarkTitleElement.className = "bookmark-title";

    bookmarkTimeElement.textContent = bookmark.formattedTime;
    bookmarkTimeElement.className = "bookmark-time";

    bookmarkElement.id = "bookmark-" + bookmark.key;
    bookmarkElement.className = "bookmark-item";
    bookmarkElement.setAttribute("timestamp", bookmark.formattedTime);
    bookmarkElement.setAttribute("videoId", bookmark.videoId);
    bookmarkElement.setAttribute("key", bookmark.key);

    actionButtonsElement.className = "action-buttons";

    setBookmarkAttributes("play", onPlay, actionButtonsElement);
    setBookmarkAttributes("delete", onDelete, actionButtonsElement);

    bookmarkElement.appendChild(bookmarkTitleElement);
    bookmarkElement.appendChild(bookmarkTimeElement);
    bookmarkElement.appendChild(actionButtonsElement);
    bookmarkListElement.appendChild(bookmarkElement);
}

const viewBookmarks = (currentBookmarks=[]) => {
    const bookmarkListElement = document.getElementById("bookmark-list");
    bookmarkListElement.innerHTML = "";

    if (currentBookmarks.length > 0) {
        for (let i = 0; i < currentBookmarks.length; ++i) {
            const bookmark = currentBookmarks[i];
            addBookmark(bookmarkListElement, bookmark);
        }
    }

    return;
}

const onPlay = (e) => {
    const elem = e.target.parentNode.parentNode;
    const bookmarkTime = elem.getAttribute("timestamp");
    const videoId = elem.getAttribute("videoId");

    chrome.tabs.create({ url: `https://www.youtube.com/watch?v=${videoId}&t=${bookmarkTime}` })
};

const onDelete = (e) => {
    // TODO
    const elem = e.target.parentNode.parentNode;
    const bookmarkTime = elem.getAttribute("timestamp");
    const videoId = elem.getAttribute("videoId");
    const key = elem.getAttribute("key");
    const bookmarkElementToDelete = document.getElementById("bookmark-" + key);

    bookmarkElementToDelete.parentNode.removeChild(bookmarkElementToDelete);

    chrome.storage.sync.get("bookmarks", (data) => {
        let bookmarks = data.bookmarks || [];
        bookmarks = bookmarks.filter(bookmark => bookmark.key !== key);

        chrome.storage.sync.set({ "bookmarks": bookmarks });
        viewBookmarks(bookmarks);
    });
};

const setBookmarkAttributes = (src, eventListener, controlParentElement) => {
    const controlElement = document.createElement("img");
    controlElement.className = "action-buttons-" + src;
    controlElement.src = "assets/" + src + "_32.png";
    controlElement.title = src;
    controlElement.addEventListener("click", eventListener);
    controlParentElement.appendChild(controlElement);
};

const searchInputElement = document.getElementById("searchInput");
const bookmarkList = document.getElementById("bookmark-list");
searchInputElement.addEventListener("input", () => {
    const searchTerm = searchInputElement.value.toLowerCase();

    chrome.storage.sync.get("bookmarks", (data) => {
        let bookmarks = data.bookmarks || [];

        bookmarks = bookmarks.filter(bookmark => bookmark.title.toLowerCase().includes(searchTerm));
        viewBookmarks(bookmarks);
    });
});

document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.sync.get("bookmarks", (data) => {
        let bookmarks = data.bookmarks || [];
        viewBookmarks(bookmarks);
    });
});
