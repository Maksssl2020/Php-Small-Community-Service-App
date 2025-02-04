import {dashboardContentContainer} from "./dashboard.js";
import {countPostComments} from "./dashboardApiFunctions.js";
import {createDiscoverPost, createPostContentContainer, createPostFooter, createPostHeader} from "../../../index.js";
import {
    fetchPostAmountOfLikes,
    fetchUserData,
    getSignedInUserData,
    isPostLikedByUser
} from "../../../indexApiFunctions.js";
import {calcPeriodFromDate, getUserAvatar} from "../../../indexUtils.js";

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

    dashboardContentContainer.append(container1 , container2)

    let counter = 1;

    for (let i = 0; i < posts.length; i++) {
        const post = await createDiscoverPost(posts[i], true);

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

async function createDashboardPost(postData) {
    const {id, images, postContent, postTitle, postSitesLinks, postType, tags, userId, createdAt} = postData;
    const {userNickname, avatarUrl, avatarImage} = await fetchUserData(userId);
    let avatarSrc = getUserAvatar(avatarUrl, avatarImage);

    const postDiv = document.createElement('div');
    postDiv.classList.add("dashboard-post-card");
    postDiv.setAttribute('id', `post-${id}`);

    const postHeader = await createPostHeader(id, userId, avatarSrc, userNickname, createdAt, true);
    const postContentDiv = await createPostContentContainer(postType, postTitle, postContent, tags, images, postSitesLinks);
    const postFooter = await createPostFooter(id, userId,false, true);
    const postStatisticsContainer = await createDashboardPostStatisticsContainer(id);

    postDiv.innerHTML = postHeader + postContentDiv + postFooter + postStatisticsContainer;
    return postDiv;
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
                    <input spellcheck="false" autocomplete="false" postId="${postId}" id="postCommentInput" placeholder="Respond as @${userNickname}"/>
                    <button disabled id="addCommentButton" class="add-comment-button">
                        <i class="bi bi-send"></i>
                    </button>
                </div>
            </div>
            <div id="commentsLikesContainer-${postId}" class="all-comments-likes-container "></div>
        </div>
        `
}

export async function fillCommentsSection(postId, comments, isDiscoverPost = false) {
    let commentsContainer;
    let commentInput;

    if (isDiscoverPost) {
        commentsContainer = document.getElementById("discoverPostStatisticsContent");
        commentInput = document.getElementById("discoverPostStatisticsFooter");
    } else {
        commentsContainer = document.getElementById(`commentsLikesContainer-${postId}`);
        commentInput = document.getElementById(`addCommentContainer-${postId}`);
    }

    if (commentInput && commentInput.classList.contains('hidden')) {
        commentInput.classList.replace('hidden','visible');
    } else if (commentInput && !commentInput.classList.contains('visible')) {
        commentInput.classList.add('visible');
    }

    if (commentsContainer && commentsContainer.classList.contains('likes')) {
        commentsContainer.classList.replace('likes', 'comments');
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

export async function fillLikesSection(postId, likes, isDiscoverPost = false) {
    let likesContainer;
    let commentInput;

    if (isDiscoverPost) {
        likesContainer = document.getElementById("discoverPostStatisticsContent");
        commentInput = document.getElementById("discoverPostStatisticsFooter");
    } else {
        likesContainer = document.getElementById(`commentsLikesContainer-${postId}`);
        commentInput = document.getElementById(`addCommentContainer-${postId}`);
    }

    if (commentInput && commentInput.classList.contains('visible')) {
        commentInput.classList.replace('visible', "hidden");
    }

    if (likesContainer && likesContainer.classList.contains('comments')) {
        likesContainer.classList.replace("comments", "likes");
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
    let isUserCommentAuthor = false;

    if (await getSignedInUserData()) {
        const {userId: signedInUserId} =await getSignedInUserData()
        isUserCommentAuthor = userId === signedInUserId;
    }

    const settingsContainerClass = isUserCommentAuthor ? "visible" : "hidden";

    return `
    <div id="comment-${id}" class="comment-card">
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
            <div class="settings-container ${settingsContainerClass}">
                <button id="commentSettingsButton" commentId="${id}" class="show-settings-button">
                    <i class="bi bi-three-dots"></i>
                </button>
                <div commentId="${id}" id="userCommentSettingsDropdown-${id}" class="comment-settings-dropdown hidden">
                    <button commentId="${id}" id="deleteComment" class="dropdown-button warning">Delete</button>
                </div>
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

export async function updatePostAfterAddCommentOrRemoveComment(postId, isDiscoverPost = false) {
    const updatedCommentsCount  = await countPostComments(postId);
    let commentsStatisticInfo;

    if (isDiscoverPost) {
        commentsStatisticInfo = document.getElementById(`discoverPostCommentsStatistic`);
    } else {
        commentsStatisticInfo = document.getElementById(`commentsStatistic-${postId}`)
    }

    if (commentsStatisticInfo) {
        const commentsCountInfo = commentsStatisticInfo.querySelector('span');

        if (commentsCountInfo) commentsCountInfo.textContent = `${updatedCommentsCount}`;
    }
}

export async function addCommentCardToPost(commentId, postId, userId, content, createdAt, isDiscoverPost = false) {
    let postContainer;
    const commentData = {commentId, postId, userId, content, createdAt}
    const commentCard = await createPostCommentCard(commentData);

    if (isDiscoverPost) {
        postContainer = document.getElementById("discoverPostStatisticsContent");
    } else {
        postContainer = document.querySelector(`#post-${postId} .all-comments-likes-container.comments`);
    }

    if (postContainer) {
        postContainer.innerHTML += commentCard;
    }
}