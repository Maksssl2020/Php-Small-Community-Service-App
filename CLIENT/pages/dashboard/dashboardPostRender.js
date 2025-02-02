import {getUserAvatar} from "./dashboardUtils.js";
import { dashboardContentContainer} from "./dashboard.js";
import {calcPeriodFromDate, fetchSiteData, fetchUserData, formatDate, getSignedInUserData} from "../../../index.js";
import {countPostComments, fetchPostAmountOfLikes, isPostLikedByUser} from "./dashboardApiFunctions.js";

export async function populateDashboardContentPosts(posts) {
    for (const post of posts) {
        const createdPost = await createDashboardPost(post);
        dashboardContentContainer.append(createdPost);
    }
}

export async function populateDiscoverContentPosts(posts) {
    dashboardContentContainer.innerHTML = '';

    const container1 = document.createElement("div");
    container1.setAttribute("id", "container1");
    container1.classList.add("discover-posts-container-column");
    const container2 = document.createElement("div");
    container2.setAttribute("id", "container2");
    container2.classList.add("discover-posts-container-column");

    dashboardContentContainer.append(container1 , container2 )

    let counter = 1;

    for (let i = 0; i < posts.length; i++) {
        const post = await createDiscoverPost(posts[i]);

        if (!post) continue;

        if (counter === 1) {
            container1.append(post);
        } else {
            container2.append(post);
        }

        if (counter !== 2) {
            counter++;
        } else {
            counter = 1;
        }
    }
}

async function createDiscoverPost(postData) {
    const {id, images, postContent, postTitle, postSitesLinks, postType, tags, userId, createdAt} = postData;
    const {userNickname, avatarUrl, avatarImage} = await fetchUserData(userId);
    let avatarSrc = getUserAvatar(avatarUrl, avatarImage);

    const postDiv = document.createElement('div');
    postDiv.classList.add("discover-post-card");
    postDiv.setAttribute('id', `post-${id}`);

    const postHeader = await createDashboardPostHeader(id, userId, avatarSrc, userNickname, createdAt);
    const postContentDiv = await createDashboardPostContentContainer(postType, postTitle, postContent, tags, images, postSitesLinks);
    const postFooter = await createDashboardPostFooter(id);


    postDiv.innerHTML = postHeader + postContentDiv + postFooter;
    return postDiv;
}

async function createDashboardPost(postData) {
    const {id, images, postContent, postTitle, postSitesLinks, postType, tags, userId, createdAt} = postData;
    const {userNickname, avatarUrl, avatarImage} = await fetchUserData(userId);
    let avatarSrc = getUserAvatar(avatarUrl, avatarImage);

    const postDiv = document.createElement('div');
    postDiv.classList.add("dashboard-post-card");
    postDiv.setAttribute('id', `post-${id}`);

    const postHeader = await createDashboardPostHeader(id, userId, avatarSrc, userNickname, createdAt);
    const postContentDiv = await createDashboardPostContentContainer(postType, postTitle, postContent, tags, images, postSitesLinks);
    const postFooter = await createDashboardPostFooter(id);
    const postStatisticsContainer = await createDashboardPostStatisticsContainer(id);

    postDiv.innerHTML = postHeader + postContentDiv + postFooter + postStatisticsContainer;
    return postDiv;
}

async function createDashboardPostHeader(postId, userId, userAvatar, userNickname, createdAt) {
    const { userId: signedInUserId } = await getSignedInUserData();

    const isUserPostAuthor = userId === signedInUserId;
    const settingsContainerClass = isUserPostAuthor ? "visible" : "hidden";

    return `
        <header class="post-header">
            <img src=${userAvatar} alt="user_icon" class="post-author-image"/>
            <div class="post-data-container">
                <p style="color:  var(--custom-white-color-100);">${userNickname}</p>
                <p>${formatDate(createdAt.date)}</p>
            </div>
            <div class="post-settings-container ${settingsContainerClass}">
                <button postId="${postId}" class="post-settings-button">
                    <i class="bi bi-three-dots"></i>
                </button>
                <div postId="${postId}" id="userPostSettingsDropdown-${postId}" class="post-settings-dropdown hidden">
                    <p>${formatDate(createdAt.date, true)}</p>
                    <button id="editPost-${postId}">Edit</button>
                    <button postId="${postId}" id="deletePost" class="warning">Delete</button>
                </div>
            </div>
        </header>
    `;
}

async function createDashboardPostContentContainer(postType, postTitle, postContent, postTags, images, postSitesLinks) {
    let postContentDiv = '';

    if (postType === 'text') {
        postContentDiv = `
            <div class="post-content">
                <h3 class="post-title">${postTitle}</h3>
                <p id="autoresize" class="post-text" spellcheck="false">${postContent}</p>
                <div class="post-tags">${createPostTags(postTags)}</div>
            </div>`;
    } else if (postType === 'image') {
        postContentDiv = `
            <div class="post-content">
                <div class="post-images-container">${createPostImages(images)}</div>
                <p id="autoresize" class="post-text" spellcheck="false">${postContent ?? ''}</p>
                <div class="post-tags">${createPostTags(postTags)}</div>
            </div>`;
    } else if (postType === 'quote') {
        postContentDiv = `
            <div class="post-content">
                <p id="autoresize" class="post-text" spellcheck="false" >${postContent}</p>
                <div class="post-tags">${createPostTags(postTags)}</div>
            </div>
            `
    } else if (postType === 'link') {
        postContentDiv = `
            <div class="post-content">
                ${createPostSiteLinks(postSitesLinks).outerHTML}
                <p id="autoresize" class="post-text" spellcheck="false" >${postContent ?? ''}</p>
                <div class="post-tags">${createPostTags(postTags)}</div>
            </div>
            `
    }

    return postContentDiv;
}

function createPostTags(postTags) {
    return postTags.map(tag => `<a href="../dashboard/dashboard.php?section=discover&tag=${tag.name}">#${tag.name}</a>`).join('');
}

function createPostImages(images) {
    return images.map(image => `<img src=${image.url} alt=${image.id}/>`).join('');
}

async function createPostSiteLinks(postSiteLinks) {
    const linksContainer = document.createElement('ul');
    linksContainer.classList.add('post-links-container');

    for (const link of postSiteLinks) {
        let siteData = await fetchSiteData(link);
        const card = await createSiteCard(link, siteData, linksContainer)
        linksContainer.append(card);
    }

    return linksContainer;
}

async function createDashboardPostFooter(postId) {
    const postLikes = await fetchPostAmountOfLikes(postId);
    const isLikedByUser = await isPostLikedByUser(postId);

    return `
        <footer class="post-footer">
            <div class="post-likes-container">
                <span>${postLikes}</span>
                <span>${postLikes === 1 ? 'heart' : 'hearts'}</span>
            </div>
            <div class="user-options">
                <i postId="${postId}" id="showStatisticsSection" class="bi bi-chat"></i>
                <i postId="${postId}" id="likeOrUnlikePost" class="${isLikedByUser ? 'bi bi-heart-fill liked' : 'bi bi-heart'}"></i>
            </div>
        </footer>
    `;
}

async function createDashboardPostStatisticsContainer(postId) {
    const {userId, userNickname} = await getSignedInUserData();
    const {avatarUrl, avatarImage} = await fetchUserData(userId)
    const postLikes = await fetchPostAmountOfLikes(postId);
    const postAmountOfComments = await countPostComments(postId);
    const avatarSrc = getUserAvatar(avatarUrl, avatarImage);

    return `
        <div postId="${postId}" class="post-comments-likes-container hidden">
            <div class="statistics-info-container">
                <div id="commentsStatistic-${postId}" class="statistic-container active">
                    <i id="showPostComments" class="bi bi-chat"></i>
                    <span>${postAmountOfComments}</span>
                </div>
                <div id="likesStatistic-${postId}" class="statistic-container">
                    <i id="showPostLikes" class="bi bi-heart"></i>
                    <span>${postLikes}</span>
                </div>
            </div>
            <div id="addCommentContainer-${postId}" class="add-comment-container">
                <img src="${avatarSrc}" alt="user"/>
                <div class="comment-input">
                    <input postId="${postId}" id="postCommentInput" placeholder="Respond as @${userNickname}"/>
                    <button disabled id="addCommentButton" class="add-comment-button">
                        <i class="bi bi-send"></i>
                    </button>
                </div>
            </div>
            <div id="commentsLikesContainer-${postId}" class="all-comments-likes-container "></div>
        </div>
        `
}

export async function fillCommentsSection(postId, comments) {
    const commentsContainer = document.getElementById(`commentsLikesContainer-${postId}`);
    const commentInput = document.getElementById(`addCommentContainer-${postId}`);

    if (commentInput && commentInput.classList.contains('hidden')) {
        commentInput.classList.remove('hidden');
        commentInput.classList.add('visible');
    } else if (commentInput && !commentInput.classList.contains('visible')) {
        commentInput.classList.add('visible');
    }

    if (commentsContainer && commentsContainer.classList.contains('likes')) {
        commentsContainer.classList.remove('likes');
        commentsContainer.classList.add('comments');
    } else if (commentsContainer && !commentsContainer.classList.contains("comments")) {
        commentsContainer.classList.add('comments');
    }

    if (commentsContainer) {
        commentsContainer.innerHTML = "";

        for (const comment of comments) {
            const commentCard = await createPostCommentCard(comment);
            commentsContainer.innerHTML += commentCard;
        }
    }
}

export async function fillLikesSection(postId, likes) {
    const likesContainer = document.getElementById(`commentsLikesContainer-${postId}`);
    const commentInput = document.getElementById(`addCommentContainer-${postId}`);

    if (commentInput && commentInput.classList.contains('visible')) {
        commentInput.classList.remove('visible');
        commentInput.classList.add('hidden');
    }

    if (likesContainer && likesContainer.classList.contains('comments')) {
        likesContainer.classList.remove('comments');
        likesContainer.classList.add('likes');
    }

    if (likesContainer) {
        likesContainer.innerHTML = "";

        for (const like of likes) {
            const likeCard = await createLikeCard(like);
            likesContainer.innerHTML += likeCard;
        }
    }
}

async function createPostCommentCard(commentData) {
    const {id, postId, userId, content, createdAt} = commentData;
    const {userNickname, avatarUrl, avatarImage} = await fetchUserData(userId);
    let avatarSrc = getUserAvatar(avatarUrl, avatarImage);

    return `
    <div commentId="comment-${id}" class="comment-card">
        <div class="comment-user-image">
            <img src="${avatarSrc}" alt="${userNickname}"/>
        </div>
        <div class="comment-data">
            <div class="comment-user-nickname-and-date">
                <p class="comment-nickname">${userNickname}</p>
                <p class="comment-date">${calcPeriodFromDate(createdAt.date)}</p>
            </div>
            <p class="comment-content">
                ${content}
            </p>
        </div>
        <div class="comment-settings">
            <i class="bi bi-three-dots"></i>
        </div>
    </div>
    `;
}

async function createLikeCard(likeData) {
    const {id, userId} = likeData;
    const {userNickname, avatarUrl, avatarImage} = await fetchUserData(userId);
    const avatarSrc = getUserAvatar(avatarUrl, avatarImage);

    return `
        <div likeId="like-${id}" class="like-card">
            <img src="${avatarSrc}" alt="${userNickname}"/>
            <p>${userNickname}</p>
        </div>
`
}

export async function updatePostAfterLikeOrUnlike(postId) {
    const updatedLikes = await fetchPostAmountOfLikes(postId);
    const isLikedByUser = await isPostLikedByUser(postId);
    const postElement = document.getElementById(`post-${postId}`);
    const statisticsSection = postElement.querySelector(".post-comments-likes-container");


    if (postElement) {
        const likesContainer = postElement.querySelector('.post-likes-container span:first-child');
        if (likesContainer) likesContainer.textContent = updatedLikes;

        const likeIcon = postElement.querySelector('i.bi-heart, i.bi-heart-fill');
        if (likeIcon) {
            likeIcon.className = isLikedByUser ? 'bi bi-heart-fill liked' : 'bi bi-heart';
        }
    }

    if (statisticsSection) {
        const likesStatisticInfo = document.getElementById(`likesStatistic-${postId}`)

        if (likesStatisticInfo) {
            likesStatisticInfo.querySelector("span").textContent = updatedLikes;
        }
    }
}

export async function updatePostAfterAddCommentOrRemoveComment(postId) {
    const updatedCommentsCount  = await countPostComments(postId);
    const commentsStatisticInfo = document.getElementById(`commentsStatistic-${postId}`);

    if (commentsStatisticInfo) {
        const commentsCountInfo = commentsStatisticInfo.querySelector('span');

        if (commentsCountInfo) commentsCountInfo.textContent = updatedCommentsCount;
    }
}

export async function addCommentCardToPost(commentId, postId, userId, content, addedAt) {
    const {userNickname, avatarUrl, avatarImage} = await fetchUserData(userId);
    const avatarSrc = getUserAvatar(avatarUrl, avatarImage);

    const commentCard = `
        <div id="${commentId}" class="comment-card">
            <div class="comment-user-image">
                <img src="${avatarSrc}" alt="${userNickname}"/>
            </div>
            <div class="comment-data">
                <div class="comment-user-nickname-and-date">
                    <p class="comment-nickname">${userNickname}</p>
                    <p class="comment-date">${addedAt}</p>
                </div>
                <p class="comment-content">${content}</p>
            </div>
            <div class="comment-settings">
                <i class="bi bi-three-dots"></i>
            </div>
        </div>
    `;

    const postContainer = document.querySelector(`#post-${postId} .all-comments-likes-container.comments`);
    if (postContainer) {
        postContainer.innerHTML += commentCard;
    }

}