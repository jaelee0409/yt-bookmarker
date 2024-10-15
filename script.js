(() => {
    let ytLeftControls, ytPlayer;
    let currentVideo = '';
    let currentVideoBookmarks = [];
    let tooltipVisible = false;
    let tooltipTimeout;

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

        // DEBUG
        console.log(newBookmark);

        chrome.storage.sync.set({
            [currentVideo]: JSON.stringify(
                [...currentVideoBookmarks, newBookmark].sort((a, b) => a.time - b.time)
            ),
        });
    };

    const mouseEnterEventHandler = () => {
        const ytTooltip = document.getElementsByClassName('ytp-tooltip-text-wrapper')[0]
            .parentElement;
        const ytTooltipText = document.getElementsByClassName('ytp-tooltip-text')[0];
        const ytTooltipTextWrapper = document.getElementsByClassName(
            'ytp-tooltip-text-wrapper'
        )[0];
        const ytBookmarkButton = document.getElementsByClassName("yt-button-class-bookmark-button")[0];

        const rect = ytBookmarkButton.getBoundingClientRect();

        // Ensure tooltip is visible
        if (ytTooltip.getAttribute('aria-hidden') === 'true') {
            ytTooltip.removeAttribute('aria-hidden');
        }

        ytTooltipTextWrapper.setAttribute('aria-hidden', 'true');
        ytTooltip.className = "ytp-tooltip ytp-rounded-tooltip ytp-bottom";
        ytTooltip.style.cssText = `max-width: 300px; top: ${rect.top - 100}px; left: ${rect.left - 90}px;`;

        // Show the tooltip
        ytTooltip.style.display = '';
        ytTooltipText.textContent = 'Click to bookmark current timestamp';

        tooltipVisible = true;

        clearTimeout(tooltipTimeout);
    };

    const mouseLeaveEventHandler = () => {
        tooltipVisible = false;

        const ytTooltip = document.getElementsByClassName('ytp-tooltip-text-wrapper')[0].parentElement;
        ytTooltip.style.display = 'none'; // Hide tooltip
    };



    const newVideoLoaded = async () => {
        const bookmarkButtonExists =
            document.getElementsByClassName('bookmarkButton')[0];

        if (!bookmarkButtonExists) {
            const bookmarkButton = document.createElement('img');
            bookmarkButton.src = chrome.runtime.getURL('assets/add.png');
            bookmarkButton.className = 'yt-button-class-bookmark-button';
            bookmarkButton.style.cssText = 'margin-left: auto; margin-right: 10px;';

            ytLeftControls = document.getElementsByClassName('ytp-left-controls')[0];
            ytPlayer = document.getElementsByClassName('video-stream')[0];

            ytLeftControls.appendChild(bookmarkButton);
            bookmarkButton.addEventListener('mouseover', mouseEnterEventHandler);
            bookmarkButton.addEventListener('mouseleave', mouseLeaveEventHandler);
            bookmarkButton.addEventListener('click', addNewBookmarkEventHandler);
        }
    };

    newVideoLoaded();
})();

const getTime = t => {
    var date = new Date(0);
    date.setSeconds(t);

    return date.toISOString().substr(11, 8);
};
