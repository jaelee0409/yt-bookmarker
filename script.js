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

        const popupContainer = document.createElement("div");
        popupContainer.className = "popup-container";

        const popupStyle = `
            h2 {
                font-size: 2rem;
                text-align: center;
            }

            .form-group {
                margin-bottom: 15px;
            }

            input[type="text"] {
                width: 100%;
                padding: 10px;
                border: 1px solid #ccc;
                border-radius: 4px;
                box-sizing: border-box;
            }
        `;

        popupContainer.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            border: 1px solid black;
            z-index: 1000;
            background-color: white;
            width: 500px;
            padding: 16px;
        `;

        const popupHeader = document.createElement("h2");
        popupHeader.textContent = "ADD BOOKMARK";
        popupContainer.appendChild(popupHeader);

        const popupForm = document.createElement("form");
        popupForm.id = "bookmark-form";

        // BOOKMARK NAME INPUT
        const nameGroup = document.createElement('div');
        nameGroup.className = 'bookmark-form-group';
        const nameLabel = document.createElement('label');
        nameLabel.setAttribute('for', 'bookmark-name');
        nameLabel.textContent = 'Bookmark Name:';
        nameLabel.style.cssText= `
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        `;
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.id = 'bookmark-name';
        nameInput.required = true;
        nameGroup.appendChild(nameLabel);
        nameGroup.appendChild(nameInput);
        popupForm.appendChild(nameGroup);

        // BOOKMARK TIMESTAMP INPUT
        const timestampGroup = document.createElement('div');
        timestampGroup.className = 'bookmark-form-group';
        const timestampLabel = document.createElement('label');
        timestampLabel.setAttribute('for', 'bookmark-current-timestamp');
        timestampLabel.textContent = 'Current Timestamp:';
        const timestampInput = document.createElement('input');
        timestampInput.type = 'text';
        timestampInput.id = 'bookmark-current-timestamp';
        timestampInput.value = getFormattedTimestamp(ytPlayer.currentTime);
        timestampInput.placeholder = "HH:MM:SS"
        timestampGroup.appendChild(timestampLabel);
        timestampGroup.appendChild(timestampInput);
        popupForm.appendChild(timestampGroup);

        // BOOKMARK TAGS INPUT
        const tagsGroup = document.createElement('div');
        tagsGroup.className = 'bookmark-form-group';
        const tagsLabel = document.createElement('label');
        tagsLabel.setAttribute('for', 'bookmark-tags');
        tagsLabel.textContent = 'Tags:';
        const tagsInput = document.createElement('input');
        tagsInput.type = 'text';
        tagsInput.id = 'bookmark-tags';
        tagsInput.placeholder = 'Add tags separated by commas';
        tagsGroup.appendChild(tagsLabel);
        tagsGroup.appendChild(tagsInput);
        popupForm.appendChild(tagsGroup);

        popupContainer.appendChild(popupForm);

        // POPUP SAVE BUTTON
        const popupSubmitButton = document.createElement("button");
        popupSubmitButton.type = "submit";
        popupSubmitButton.textContent = "SAVE"; 
        popupSubmitButton.style.cssText = `
            width: 100%;
            padding: 8px;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 1rem;
            background-color: #28A745;
        `;
        popupSubmitButton.addEventListener("mouseover", () => {
            popupSubmitButton.style.backgroundColor = "#218838";

        })
        popupSubmitButton.addEventListener("mouseout", () => {
            popupSubmitButton.style.backgroundColor = "#28A745";
        })
        popupForm.appendChild(popupSubmitButton);

        // POPUP OVERLAY
        const overlayElement = document.createElement("div");
        overlayElement.className = "tag-popup-active";
        overlayElement.id = "tag-popup-overlay";

        // SHOW POPUP
        const contentElement = document.getElementById("content");
        contentElement.appendChild(popupContainer);
        contentElement.appendChild(overlayElement);

        // POPUP SAVE BUTTON CLICKED
        popupForm.addEventListener("submit", (e) => {
            e.preventDefault();

            // GET FORM DATA
            const bookmarkName = document.getElementById('bookmark-name').value;
            const bookmarkCurrentTimestamp = document.getElementById('bookmark-current-timestamp').value;
            const bookmarkTags = document.getElementById('bookmark-tags').value;

            console.log('[FORM] Tags:', bookmarkTags);

            const metaElement = document.querySelector('meta[property="og:url"]');
            // Get the current URL of the YouTube video
            const currentUrl = metaElement ? metaElement.getAttribute('content') : null;
            // Extract the current YouTube video's ID from the current URL
            const currentVideoId = extractVideoId(currentUrl);
            // Get the current timestamp of the YouTube video (rounded down)
            const bookmarkTime = timestampToSeconds(bookmarkCurrentTimestamp);

            // New bookmark object
            const newBookmark = {
                time: bookmarkTime,
                videoId: currentVideoId,
                title: bookmarkName,
                key: bookmarkName + bookmarkTime,
                tags: bookmarkTags
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


            contentElement.removeChild(popupContainer);
            contentElement.removeChild(overlayElement);
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

const extractVideoId = (url) => {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|watch)\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

const getFormattedTimestamp = (t) => {
    var date = new Date(0);
    date.setSeconds(t);

    return date.toISOString().substr(11, 8);
};

const timestampToSeconds = (t) => {
    const [hours, minutes, seconds] = t.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds;
}

