import {getUserAvatar} from "./dashboardUtils.js";
import {dashboardContentContainer} from "./dashboard.js";
import {fetchSiteData, fetchUserData, getSignedInUserData} from "../../../index.js";
import {countPostComments, fetchPostAmountOfLikes, isPostLikedByUser} from "./dashboardApiFunctions.js";

export async function populateDashboardContentPosts(posts) {
    for (const post of posts) {
        const createdPost = await createDashboardPost(post);
        dashboardContentContainer.append(createdPost);
    }
}

async function createDashboardPost(postData) {
    const {id, images, postContent, postTitle, postSitesLinks, postType, tags, userId, createdAt} = postData;
    const {userNickname, avatarUrl, avatarImage} = await fetchUserData(userId);

    let userAvatar = '';

    if (avatarUrl != null) {
        userAvatar = avatarUrl;
    } else if (avatarImage != null) {
        userAvatar = `data:image/jpeg;base64,${avatarImage}`
    } else {
        userAvatar = '../../assets/ghost_icon.jpeg';
    }

    const postDiv = document.createElement('div');
    postDiv.classList.add("dashboard-post-card");
    postDiv.setAttribute('id', `post-${id}`);

    const postHeader = createDashboardPostHeader(userAvatar, userNickname, createdAt);
    const postContentDiv = await createDashboardPostContentContainer(postType, postTitle, postContent, tags, images, postSitesLinks);
    const postFooter = await createDashboardPostFooter(id);
    const postStatisticsContainer = await createDashboardPostStatisticsContainer(id);

    postDiv.innerHTML = postHeader + postContentDiv + postFooter + postStatisticsContainer;
    return postDiv;
}

function createDashboardPostHeader(userAvatar, userNickname, createdAt) {
    return `
        <header class="post-header">
            <img src=${userAvatar} alt="user_icon" class="post-author-image"/>
            <div class="post-data-container">
                <p style="color:  var(--custom-white-color-100);">${userNickname}</p>
                <p>${new Date(createdAt.date).toLocaleDateString('pl-PL')}</p>
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
                <div class="post-tags">${postTags}</div>
            </div>`;
    } else if (postType === 'image') {
        postContentDiv = `
            <div class="post-content">
                <div class="post-images-container">${createPostImages(images)}</div>
                <p id="autoresize" class="post-text" spellcheck="false">${postContent ?? ''}</p>
                <div class="post-tags">${postTags}</div>
            </div>`;
    } else if (postType === 'quote') {
        postContentDiv = `
            <div class="post-content">
                <p id="autoresize" class="post-text" spellcheck="false" >${postContent}</p>
                <div class="post-tags">${postTags}</div>
            </div>
            `
    } else if (postType === 'link') {
        postContentDiv = `
            <div class="post-content">
                ${createPostSiteLinks(postSitesLinks).outerHTML}
                <p id="autoresize" class="post-text" spellcheck="false" >${postContent ?? ''}</p>
                <div class="post-tags">${postTags}</div>
            </div>
            `
    }

    return postContentDiv;
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
    const {userNickname, avatarUrl, avatarImage} = getSignedInUserData();
    const postLikes = await fetchPostAmountOfLikes(postId);
    const postAmountOfComments = await countPostComments(postId);

    return `
        <div postId="${postId}" class="post-comments-likes-container hidden">
            <div class="statistics-info-container">
                <div id="commentsStatistic" class="statistic-container active">
                    <i id="showPostComments" class="bi bi-chat"></i>
                    <span>${postAmountOfComments}</span>
                </div>
                <div id="likesStatistic" class="statistic-container">
                    <i id="showPostLikes" class="bi bi-heart"></i>
                    <span>${postLikes}</span>
                </div>
            </div>
            <div id="addCommentContainer-${postId}" class="add-comment-container">
                <img src="../../assets/ghost_icon.jpeg" alt="user"/>
                <div class="comment-input">
                    <input postId="${postId}" id="postCommentInput" placeholder="Respond as @${userNickname}"/>
                    <button disabled id="addCommentButton" class="add-comment-button">
                        <i class="bi bi-send"></i>
                    </button>
                </div>
            </div>
            <div id="commentsLikesContainer-${postId}" class="all-comments-likes-container comments"></div>
        </div>
        `
}

export async function fillCommentsSection(postId, comments) {
    const commentsContainer = document.getElementById(`commentsLikesContainer-${postId}`);


    if (commentsContainer && commentsContainer.classList.contains('likes')) {
        commentsContainer.classList.remove('likes');
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
    const {id, postId, userId, content, addedAt} = commentData;
    const {userNickname, avatarUrl, avatarImage} = await fetchUserData(userId);
    let avatarSrc = '';

    if (avatarUrl != null) {
        avatarSrc = avatarUrl;
    } else if (avatarImage != null) {
        avatarSrc = `data:image/jpeg;base64,${avatarImage}`
    } else {
        avatarSrc = '../../assets/ghost_icon.jpeg';
    }

    return `
    <div commentId="comment-${id}" class="comment-card">
        <div class="comment-user-image">
            <img src="${avatarSrc}" alt="${userNickname}"/>
        </div>
        <div class="comment-data">
            <div class="comment-user-nickname-and-date">
                <p class="comment-nickname">${userNickname}</p>
                <p class="comment-date">${addedAt}</p>
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
    const postElement = document.getElementById(postId);

    if (postElement) {
        const likesContainer = postElement.querySelector('.post-likes-container span:first-child');
        if (likesContainer) likesContainer.textContent = updatedLikes;

        const likeIcon = postElement.querySelector('i.bi-heart, i.bi-heart-fill');
        if (likeIcon) {
            likeIcon.className = isLikedByUser ? 'bi bi-heart-fill liked' : 'bi bi-heart';
        }
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