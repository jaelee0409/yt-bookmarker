(() => {
    let ytLeftControls, ytPlayer;
    let currentVideoBookmarks = [];
    let tooltipVisible = false;

    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        const { type, value, videoId } = obj;

        if (type === "PLAY") {
        }
        else if (type === "DELETE") {
        }
        else if (type === "LOAD") {
            newVideoLoaded();
        }
    });

    const addBookmarkEventHandler = () => {
        console.log("Adding a new bookmark...");

        const metaElement = document.querySelector('meta[property="og:url"]');
        const currentUrl = metaElement ? metaElement.getAttribute('content') : null;
        const currentVideoId = extractVideoId(currentUrl);
        const currentTime = Math.floor(ytPlayer.currentTime);

        const newBookmark = {
            time: currentTime,
            videoId: currentVideoId,
            desc: document.title.slice(0, -10) + "\nbookmarked at " + getTime(currentTime),
            key: currentVideoId + currentTime
        };

        chrome.storage.sync.get("bookmarks", (data) => {
            let bookmarks = data.bookmarks || [];
            bookmarks.push(newBookmark);
            bookmarks.sort((a, b) => {
                if(a.key < b.key) return -1;
                else if(a.key > b.key) return 1;
                else return b.time - a.time;
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
        console.log("[script.js] newVideoLoaded")

        const bookmarkButtonExists = document.getElementsByClassName('bookmark-button')[0];

        if (!bookmarkButtonExists) {
            const bookmarkButton = document.createElement('img');
            bookmarkButton.src = chrome.runtime.getURL('assets/add.png');
            bookmarkButton.className = 'ytp-button bookmark-button';
            bookmarkButton.style.cssText = 'margin-left: auto;';

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
