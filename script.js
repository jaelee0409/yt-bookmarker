(() => {
    let ytLeftControls, ytPlayer;
    let currentVideo = '';
    let currentVideoBookmarks = [];
    let tooltipVisible = false;

    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        const { type, value, videoId } = obj;

        if (type === "NEW") {
            currentVideo = videoId;
            newVideoLoaded();
        }
        else if (type === "PLAY") {
            ytPlayer.currentTime = value;
        }
        else if (type === "DELETE") {
            currentVideoBookmarks = currentVideoBookmarks.filter((t) => t.time != value);
            chrome.storage.sync.set({
                [currentVideo]: JSON.stringify(currentVideoBookmarks)
            });

            response(currentVideoBookmarks);
        }
    });

    const fetchBookmarks = () => {
        return new Promise((resolve) => {
            chrome.storage.sync.get([currentVideo], (obj) => {
                resolve(obj[currentVideo] ? JSON.parse(obj[currentVideo]) : []);
            });
        });
    };

    const addNewBookmarkEventHandler = async () => {
        const currentTime = ytPlayer.currentTime;
        const newBookmark = {
            time: currentTime,
            // videoId: id,
            desc: document.title.slice(0, -10) + " bookmarked at " + getTime(currentTime)
        };

        const metaElement = document.querySelector('meta[property="og:url"]');
        const currentUrl = metaElement ? metaElement.getAttribute('content') : null;

        playVideo(currentUrl);

        currentVideoBookmarks = await fetchBookmarks();

        chrome.storage.sync.set({
            [currentVideo]: JSON.stringify(
                [...currentVideoBookmarks, newBookmark].sort((a, b) => a.time - b.time)
            ),
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

    const newVideoLoaded = async () => {

        currentVideoBookmarks = await fetchBookmarks();

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
            bookmarkButton.addEventListener('click', addNewBookmarkEventHandler);
        }
    };

    const playVideo = (videoUrl) => {
        const videoId = extractVideoId(videoUrl);
        console.log(videoId);
        if(videoId) {
            // ytPlayer.loadVideoById(videoId);
        }
        else {
            console.error("[YouTube Bookmarker] Invalid YouTube URL");
        }
    }


    newVideoLoaded();
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
