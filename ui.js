import { getCurrentTabURL } from "./utils.js"

const addBookmark = (bookmarkListElement, bookmark) => {
    const bookmarkTitleElement = document.createElement("span");
    const bookmarkElement = document.createElement("li");
    const actionButtonsElement = document.createElement("div");

    bookmarkTitleElement.textContent = bookmark.desc;
    bookmarkTitleElement.className = "bookmark-title";

    bookmarkElement.id = "bookmark-" + bookmark.videoId + bookmark.time;
    bookmarkElement.className = "bookmark-item";
    bookmarkElement.setAttribute("timestamp", bookmark.time);
    bookmarkElement.setAttribute("videoId", bookmark.videoId);
    bookmarkElement.setAttribute("id", bookmark.id);

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

const onPlay = async (e) => {
    const currentTabURL = await getCurrentTabURL();
    console.log(currentTabURL);

    const elem = e.target.parentNode.parentNode;
    const bookmarkTime = elem.getAttribute("timestamp");
    const videoId = elem.getAttribute("videoId");

    chrome.tabs.create({ url: `https://www.youtube.com/watch?v=${videoId}&t=${bookmarkTime}` })
};

const onDelete = async (e) => {
    // TODO
    const currentTabURL = await getCurrentTabURL();

    const elem = e.target.parentNode.parentNode;
    const bookmarkTime = elem.getAttribute("timestamp");
    const videoId = elem.getAttribute("videoId");
    const id = elem.getAttribute("id");
    const bookmarkElementToDelete = document.getElementById("bookmark-" + videoId + bookmarkTime);

    bookmarkElementToDelete.parentNode.removeChild(bookmarkElementToDelete);

    chrome.storage.sync.get("bookmarks", (data) => {
        let bookmarks = data.bookmarks || [];
        bookmarks = bookmarks.filter(bookmark => bookmark.id !== id);

        chrome.storage.sync.set({ "bookmarks": bookmarks });
    });

    viewBookmarks();

    // chrome.tabs.sendMessage(currentTabURL.id, {
    //     type: "DELETE",
        // videoId: videoId,
        // value: bookmarkTime
    // }, viewBookmarks);

};

const setBookmarkAttributes = (src, eventListener, controlParentElement) => {
    const controlElement = document.createElement("img");
    controlElement.src = "assets/" + src + "_32.png";
    controlElement.title = src;
    controlElement.addEventListener("click", eventListener);
    controlParentElement.appendChild(controlElement);
};

document.addEventListener("DOMContentLoaded", () => {
    // const currentTab = await getCurrentTabURL();
    // const queryParameters = currentTab.url.split("?")[1];
    // const urlParameters = new URLSearchParams(queryParameters);
    // const currentVideo = urlParameters.get("v");

    // if (currentTab.url.includes("youtube.com/watch") && currentVideo) {
    // YouTube video url
    chrome.storage.sync.get("bookmarks", (data) => {
        let bookmarks = data.bookmarks || [];

        // Show bookmarks
        viewBookmarks(bookmarks);
    });
    // }
    // else {
    // Not a YouTube video url
    // const container = document.getElementsByClassName("youtube-bookmark-extension")[0];
    // container.innerHTML = '<div class="title">This is not a YouTube video page.</div>';
    // }
});
