(() => {
  let ytLeftControls, ytPlayer;
  let currentVideo = "";
  let currentVideoBookmarks = [];

  chrome.runtime.onMessage.addListener((obj, sender, response) => {
    const { type, value, videoId } = obj;

    if(type === "NEW") {
        currentVideo = videoId;
        newVideoLoaded();
    }
  });

  const fetchBookmarks = () => {
    return new Promise((resolve) => {
        chrome.storage.sync.get([currentVideo], (obj) => {
            resolve(obj[currentVideo] ? JSON.parse(obj[currentVideo]) : []);
        })
    })
  }

  const addNewBookmarkEventHandler = () => {
    const currentTime = ytPlayer.currentTime;
    const newBookmark = {
        time: currentTime,
        desc: "Bookmark at " + getTime(currentTime),
    };

    console.log(newBookmark);

    chrome.storage.sync.set({
        [currentVideo]: JSON.stringify([...currentVideoBookmarks, newBookmark].sort((a, b) => a.time - b.time))
    })
  }

  const newVideoLoaded = async () => {
    const bookmarkButtonExists = document.getElementsByClassName("bookmarkButton")[0];

    if(!bookmarkButtonExists) {
        const bookmarkButton = document.createElement("img");
        bookmarkButton.src = chrome.runtime.getURL("assets/add.png");
        bookmarkButton.className = "yt-button-class " + "bookmark-button";
        bookmarkButton.title = "Click to bookmark current timestamp";
        bookmarkButton.style = "";

        ytLeftControls = document.getElementsByClassName("ytp-left-controls")[0];
        ytPlayer = document.getElementsByClassName("video-stream")[0];

        ytLeftControls.appendChild(bookmarkButton);
        bookmarkButton.addEventListener("click", addNewBookmarkEventHandler);
    }
  };

  newVideoLoaded();

  

})();

const getTime = t => {
    
    var date = new Date(0);
    date.setSeconds(t);

    console.log(t);
    console.log(date);

    return date.toISOString().substr(11, 8);
  };