(() => {
    let ytLeftControls, ytPlayer;
    let currentVideoBookmarks = [];
    let tooltipVisible = false;

    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        const { type, value, videoId } = obj;

        if (type === "LOAD") {
            newVideoLoaded();
        }
    });

    const addBookmarkEventHandler = () => {
        const metaElement = document.querySelector('meta[property="og:url"]');
        // Get the current URL of the YouTube video
        const currentUrl = metaElement ? metaElement.getAttribute('content') : null;
        // Extract the current YouTube video's ID from the current URL
        const currentVideoId = extractVideoId(currentUrl);
        // Get the current timestamp of the YouTube video (rounded down)
        const currentTime = Math.floor(ytPlayer.currentTime);

        // New bookmark object
        const newBookmark = {
            formattedTime: getTime(currentTime),
            time: currentTime,
            videoId: currentVideoId,
            title: document.title.slice(0, -10),
            key: currentVideoId + currentTime
        };

        chrome.storage.sync.get("bookmarks", (data) => {
            let bookmarks = data.bookmarks || [];
            bookmarks.push(newBookmark);
            bookmarks.sort((a, b) => {
                if(a.videoId < b.videoId) {
                    return -1;

                }
                else if(a.videoId > b.videoId) {
                    return 1;
                }
                else {
                    return a.time - b.time;
                }
            });

            chrome.storage.sync.set({ "bookmarks": bookmarks });
        });
    };

    const showTooltip = () => {
        const ytTooltip = document.getElementsByClassName('ytp-tooltip-text-wrapper')[0].parentElement;
        const ytTooltipText = document.getElementsByClassName('ytp-tooltip-text')[0];
        const ytBookmarkButton = document.getElementsByClassName("bookmark-button")[0];

        const rect = ytBookmarkButton.getBoundingClientRect();

        // Ensure tooltip is visible
        if (ytTooltip.getAttribute('aria-hidden') === 'true') {
            ytTooltip.removeAttribute('aria-hidden');
        }

        ytTooltip.className = "ytp-tooltip ytp-rounded-tooltip ytp-bottom";
        ytTooltip.style.cssText = `max-width: 300px; top: ${rect.top * 0.85}px; left: ${rect.x - 180}px; display: block;`;
        ytTooltipText.textContent = 'Click to bookmark current timestamp';

        tooltipVisible = true;
    };

    const hideTooltip = () => {
        const ytTooltip = document.getElementsByClassName('ytp-tooltip-text-wrapper')[0].parentElement;
        ytTooltip.style.display = 'none';
        tooltipVisible = false;
    }

    const mouseEnterEventHandler = () => {
        const ytBookmarkButton = document.getElementsByClassName('bookmark-button')[0];

        setTimeout(() => {

            if (!tooltipVisible)
                showTooltip();


            const mouseLeaveEventHandler = () => {
                hideTooltip();
                ytBookmarkButton.removeEventListener('mouseleave', mouseLeaveEventHandler);
            };
            ytBookmarkButton.addEventListener('mouseleave', mouseLeaveEventHandler);
        }, 100);

    }

    const newVideoLoaded = () => {
        const bookmarkButtonExists = document.getElementsByClassName('bookmark-button')[0];

        if (!bookmarkButtonExists) {
            const bookmarkButton = document.createElement('img');
            bookmarkButton.src = chrome.runtime.getURL('assets/add.png');
            bookmarkButton.className = 'ytp-button bookmark-button';
            bookmarkButton.style.cssText = 'margin-left: auto; min-width: 48px; min-height: 48px;';

            ytLeftControls = document.getElementsByClassName('ytp-left-controls')[0];
            ytPlayer = document.getElementsByClassName('video-stream')[0];

            ytLeftControls.appendChild(bookmarkButton);
            bookmarkButton.addEventListener('mouseover', mouseEnterEventHandler);
            bookmarkButton.addEventListener('click', addBookmarkEventHandler);
        }
    };

})();

const getTime = t => {
    var date = new Date(0);
    date.setSeconds(t);

    return date.toISOString().substr(11, 8);
};

const extractVideoId = (url) => {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|watch)\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}
