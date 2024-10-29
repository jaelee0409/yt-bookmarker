import { getCurrentTabURL } from "./utils.js"

const addBookmark = (bookmarkListElement, bookmark) => {
    const bookmarkTitleElement = document.createElement("span");
    const bookmarkElement = document.createElement("li");
    const actionButtonsElement = document.createElement("div");

    bookmarkTitleElement.textContent = bookmark.desc;
    bookmarkTitleElement.className = "bookmark-title";

    bookmarkElement.id = "bookmark-" + bookmark.key;
    bookmarkElement.className = "bookmark-item";
    bookmarkElement.setAttribute("timestamp", bookmark.time);
    bookmarkElement.setAttribute("videoId", bookmark.videoId);
    bookmarkElement.setAttribute("key", bookmark.key);

    actionButtonsElement.className = "action-buttons";

    setBookmarkAttributes("play", onPlay, actionButtonsElement);
    setBookmarkAttributes("delete", onDelete, actionButtonsElement);

    bookmarkElement.appendChild(bookmarkTitleElement);
    bookmarkElement.appendChild(actionButtonsElement);
    bookmarkListElement.appendChild(bookmarkElement);

}

const viewBookmarks = (currentBookmarks=[]) => {
    const bookmarkList = document.getElementById("bookmark-list");
    // bookmarkList.innerHTML = "";

    if (currentBookmarks.length > 0) {
        for (let i = 0; i < currentBookmarks.length; ++i) {
            const bookmark = currentBookmarks[i];
            addBookmark(bookmarkList, bookmark);
        }
    }
    else {
        // bookmarkList.innerHTML = '<i class="row">No bookmarks</i>';
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
        console.log(bookmarks);

        chrome.storage.sync.set({ "bookmarks": bookmarks });
    });

    viewBookmarks();
};

const setBookmarkAttributes = (src, eventListener, controlParentElement) => {
    const controlElement = document.createElement("img");
    controlElement.className = "action-buttons-" + src;
    controlElement.src = "assets/" + src + "_32.png";
    controlElement.title = src;
    controlElement.addEventListener("click", eventListener);
    controlParentElement.appendChild(controlElement);
};

document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.sync.get("bookmarks", (data) => {
        let bookmarks = data.bookmarks || [];
        viewBookmarks(bookmarks);
    });
});
