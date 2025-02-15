import {formatDate, getUserAvatar} from "./indexUtils.js";
import {
    fetchPostAmountOfLikes,
    fetchSiteData,
    fetchUserData,
    getSignedInUserData,
    isPostLikedByUser
} from "./indexApiFunctions.js";

export async function createDiscoverPost(postData, isLoggedIn = true, isRadarPost = false) {
    const {id, images, postContent, postTitle, postSitesLinks, postType, tags, userId, createdAt} = postData;
    const {userNickname, avatarUrl, avatarImage} = await fetchUserData(userId);
    let avatarSrc = getUserAvatar(avatarUrl, avatarImage);
    const postId = isRadarPost ? `radar-post-${id}` : `post-${id}`;

    const postDiv = document.createElement('div');
    postDiv.classList.add("discover-post-card");
    postDiv.setAttribute('id', postId);

    const postHeader = await createPostHeader(id, postType, userId, avatarSrc, userNickname, createdAt, isLoggedIn);
    const postContentDiv = await createPostContentContainer(postType, postTitle, postContent, tags, images, postSitesLinks, isLoggedIn);
    const postFooter = await createPostFooter(id, userId, true, isLoggedIn);


    postDiv.innerHTML = postHeader + postContentDiv + postFooter;
    return postDiv;
}

export async function createPostHeader(postId, postType, userId, userAvatar, userNickname, createdAt, isLoggedIn) {
    let signedInUserId;

    if (isLoggedIn) {
        const { userId } = await getSignedInUserData();
        signedInUserId = userId;
    }

    const isUserPostAuthor = userId === signedInUserId;
    const settingsContainerClass = isUserPostAuthor ? "visible" : "hidden";

    return `
        <header class="post-header">
            <img src=${userAvatar} alt="user_icon" class="post-author-image"/>
            <div class="post-data-container">
                <p style="color:  var(--custom-white-color-100);">${userNickname}</p>
                <p>${formatDate(createdAt.date)}</p>
            </div>
            <div class="settings-container ${settingsContainerClass}">
                <button id="postSettingsButton" postId="${postId}" class="show-settings-button">
                    <i class="bi bi-three-dots"></i>
                </button>
                <div postId="${postId}" id="userPostSettingsDropdown-${postId}" class="post-settings-dropdown hidden">
                    <p>${formatDate(createdAt.date, true)}</p>
                    <button postType="${postType}" postId="${postId}" class="dropdown-button" id="editPost">Edit</button>
                    <button postId="${postId}" id="deletePost" class="dropdown-button warning">Delete</button>
                </div>
            </div>
        </header>
    `;
}

export async function createPostContentContainer(postType, postTitle, postContent, postTags, images, postSitesLinks, isLoggedIn) {
    let postContentDiv = '';

    if (postType === 'text') {
        const postTitlePlaceholder = (postTitle !== undefined && postTitle !== null)
            ? `<h3 class="post-title">${postTitle}</h3>`
            : "";

        postContentDiv = `
            <div class="post-content">
                ${postTitlePlaceholder}
                <p id="autoresize" class="post-text" spellcheck="false">${postContent}</p>
                <div class="post-tags">${createPostTags(postTags, isLoggedIn)}</div>
            </div>`;
    } else if (postType === 'image') {
        console.log(images)

        postContentDiv = `
            <div class="post-content">
                <div class="post-images-container">${createPostImages(images)}</div>
                <p id="autoresize" class="post-text" spellcheck="false">${postContent ?? ''}</p>
                <div class="post-tags">${createPostTags(postTags, isLoggedIn)}</div>
            </div>`;
    } else if (postType === 'quote') {
        postContentDiv = `
            <div class="post-content">
                <p id="autoresize" class="post-text" spellcheck="false" >${postContent}</p>
                <div class="post-tags">${createPostTags(postTags, isLoggedIn)}</div>
            </div>
            `
    } else if (postType === 'link') {
        postContentDiv = `
            <div class="post-content">
                ${((await createPostSiteLinks(postSitesLinks)).outerHTML)}
                <p id="autoresize" class="post-text" spellcheck="false" >${postContent ?? ''}</p>
                <div class="post-tags">${createPostTags(postTags, isLoggedIn)}</div>
            </div>
            `
    }

    return postContentDiv;
}

export function createPostTags(postTags, isLoggedIn) {
    console.log(isLoggedIn)

    if (isLoggedIn) {
        return postTags.map(tag => `<a href="../dashboard/dashboard.php?section=discover&tag=${tag.name}">#${tag.name}</a>`).join('');
    } else {
        return postTags.map(tag => `<a>#${tag.name}</a>`).join('');
    }
}

export function createPostImages(images) {
    return images.map(image => `<img src=${image.url} alt=${image.id}/>`).join('');
}

export async function createPostSiteLinks(postSiteLinks) {
    const linksContainer = document.createElement('ul');
    linksContainer.classList.add('post-links-container');

    for (const link of postSiteLinks) {
        let siteData = await fetchSiteData(link);
        const card = await createSiteCard(link, siteData)
        linksContainer.append(card);
    }

    return linksContainer;
}

export async function createPostFooter(postId, userId, isDiscoverPost = false, isLoggedIn) {
    const postLikes = await fetchPostAmountOfLikes(postId);
    let isLikedByUser;
    let isUserCreatorOfThePost;

    if (isLoggedIn) {
        const {userId: signedInUserId} = await getSignedInUserData();
        isLikedByUser = await isPostLikedByUser(postId);
        isUserCreatorOfThePost = signedInUserId === userId;
    } else {
        isLikedByUser = false;
        isUserCreatorOfThePost = false;
    }

    const showStatisticsSectionId = isDiscoverPost ? "showDiscoverPostStatisticsSection" : "showDashboardPostStatisticsSection";

    return `
        <footer class="post-footer">
            <div class="post-likes-container">
                <span>${postLikes}</span>
                <span>${postLikes === 1 ? 'heart' : 'hearts'}</span>
            </div>
            <div class="user-options">
                <i postId="${postId}" id="${showStatisticsSectionId}" class="bi bi-chat"></i>
                <i postId="${postId}" id="likeOrUnlikePost" class="${isLikedByUser ? 'bi bi-heart-fill liked' : 'bi bi-heart'} ${!isLoggedIn || isUserCreatorOfThePost ? "disabled" : "" }"></i>
            </div>
        </footer>
    `;
}

export async function createSiteCard(url, siteData) {
    const {description, title, image} = siteData;
    console.log(description);
    console.log(title);
    console.log(url);

    const listItem = document.createElement('li');
    listItem.classList.add('link-item-container');

    const itemDiv = document.createElement('div');
    itemDiv.className = 'site-preview';

    const itemLink = document.createElement('a');
    itemLink.href = url;
    itemLink.target = '_blank';

    itemDiv.appendChild(itemLink);

    if (image) {
        const img = document.createElement('img');
        img.src = image;
        img.alt = 'Preview Image';
        img.classList.add('site-preview-image');

        itemDiv.appendChild(img);
    }

    const siteInfoDiv = document.createElement('div');
    siteInfoDiv.classList.add('site-preview-info');

    if (title) {
        const titleH3 = document.createElement('h3');
        titleH3.textContent = title;
        siteInfoDiv.appendChild(titleH3);
    }

    if (description) {
        const descriptionP = document.createElement('P');
        descriptionP.textContent = description;
        siteInfoDiv.appendChild(descriptionP);
    }

    itemDiv.appendChild(siteInfoDiv);
    listItem.appendChild(itemDiv);
    listItem.id = url;

    return listItem;
}