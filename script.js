(() => {
  let ytLeftControls, ytPlayer;
  let currentVideo = '';
  let currentVideoBookmarks = [];

  chrome.runtime.onMessage.addListener((obj, sender, response) => {
    const { type, value, videoId } = obj;

    if (type === 'NEW') {
      currentVideo = videoId;
      newVideoLoaded();
    }
  });

  const fetchBookmarks = () => {
    return new Promise(resolve => {
      chrome.storage.sync.get([currentVideo], obj => {
        resolve(obj[currentVideo] ? JSON.parse(obj[currentVideo]) : []);
      });
    });
  };

  const addNewBookmarkEventHandler = () => {
    const currentTime = ytPlayer.currentTime;
    const newBookmark = {
      time: currentTime,
      desc: 'Bookmark at ' + getTime(currentTime),
    };

    console.log(newBookmark);

    chrome.storage.sync.set({
      [currentVideo]: JSON.stringify(
        [...currentVideoBookmarks, newBookmark].sort((a, b) => a.time - b.time)
      ),
    });
  };

  const mouseEnterEventHandler = () => {
    ytTooltip = document.getElementsByClassName('ytp-tooltip-text-wrapper')[0]
      .parentElement;
    ytTooltipText = document.getElementsByClassName('ytp-tooltip-text')[0];
    ytTooltipTextWrapper = document.getElementsByClassName(
      'ytp-tooltip-text-wrapper'
    )[0];
    ytBookmarkButton = document.getElementsByClassName("yt-button-class-bookmark-button")[0];

    ytTooltipTextWrapper.setAttribute('aria-hidden', 'true');
    ytTooltip.setAttribute('aria-hidden', 'false');
    ytTooltip.style.display = 'block';
    ytTooltip.style.left = ytBookmarkButton.style.left;

    console.log(window.getComputedStyle(ytTooltip));
    ytTooltipText.textContent = 'Click to bookmark current timestamp';
  };

  const mouseOutEventHandler = () => {
    ytTooltip = document.getElementsByClassName('ytp-tooltip-text-wrapper')[0]
      .parentElement;
    ytTooltip.style.display = 'none';
    ytTooltip.setAttribute('aria-hidden', 'true');
  };

  const newVideoLoaded = async () => {
    const bookmarkButtonExists =
      document.getElementsByClassName('bookmarkButton')[0];

    if (!bookmarkButtonExists) {
      const bookmarkButton = document.createElement('img');
      bookmarkButton.src = chrome.runtime.getURL('assets/add.png');
      bookmarkButton.className = 'yt-button-class-bookmark-button';

      ytLeftControls = document.getElementsByClassName('ytp-left-controls')[0];
      ytPlayer = document.getElementsByClassName('video-stream')[0];

      ytLeftControls.appendChild(bookmarkButton);
      bookmarkButton.addEventListener('mouseenter', mouseEnterEventHandler);
      bookmarkButton.addEventListener('mouseout', mouseOutEventHandler);
      bookmarkButton.addEventListener('click', addNewBookmarkEventHandler);
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
