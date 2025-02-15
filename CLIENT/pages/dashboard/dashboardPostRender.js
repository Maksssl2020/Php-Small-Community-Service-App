import {
    chosenTagDataContainer,
    dashboardContentContainer,
    randomPostContainer,
    randomTagsContainer,
    userFollowedTagsList
} from "./dashboard.js";
import {
    countPostComments,
    getFewRandomTagsThatUserNotFollow,
    getPopularTags,
    getPostAuthorId,
    getRandomPostForUserRadar,
    getTagDataByTagName,
    getUserFollowedTags,
    isTagFollowedByUser
} from "./dashboardApiFunctions.js";
import {createDiscoverPost, createPostContentContainer, createPostFooter, createPostHeader} from "../../../index.js";
import {
    fetchPostAmountOfLikes,
    fetchUserData,
    getSignedInUserData,
    isPostLikedByUser
} from "../../../indexApiFunctions.js";
import {calcPeriodFromDate, getUserAvatar} from "../../../indexUtils.js";
import {
    followOrUnfollowTagByUser,
    followUnfollowTagInSuggestion,
    openFollowedTagsModalEventListener
} from "./dashboardEventListeners.js";

export async function fetchRandomPostForRadarInDashboard() {
    randomPostContainer.innerHTML = '';

    const postData = await getRandomPostForUserRadar();
    const discoverPost = await createDiscoverPost(postData, true, true);

    randomPostContainer.appendChild(discoverPost);
}

export async function fetchRandomTagsForUser() {
    randomTagsContainer.removeEventListener("click", followUnfollowTagInSuggestion);
    randomTagsContainer.innerHTML = '';

    const tagsData = await getFewRandomTagsThatUserNotFollow();

    for (const tag of tagsData) {
        const tagCard = createTagCard(tag.name);
        randomTagsContainer.innerHTML += tagCard;
    }

    randomTagsContainer.addEventListener("click", followUnfollowTagInSuggestion);
}

export async function fetchUserFollowedTagsData() {
    userFollowedTagsList.innerHTML = '';

    const tagsData = await getUserFollowedTags();
    console.log(tagsData);
    for (const tag of tagsData) {
        const createdTagCard = createUserFollowedTagCard(tag);
        userFollowedTagsList.innerHTML += createdTagCard;
    }

    const manageButton = document.getElementById("userFollowedTagsManageButton");
    manageButton.addEventListener("click", openFollowedTagsModalEventListener);
}

export async function fetchChosenTagData(specifiedTag) {
    chosenTagDataContainer.innerHTML = "";

    const tagData = await getTagDataByTagName(specifiedTag);
    const tagCard = await createChosenTagCard(tagData[0]);

    chosenTagDataContainer.innerHTML += tagCard;

    const followUnfollowButtonInChosenTagCard = document.getElementById("followUnfollowButtonInChosenTagCard");
    if (followUnfollowButtonInChosenTagCard) {
        followUnfollowButtonInChosenTagCard.addEventListener('click', followOrUnfollowTagByUser)
    }
}

async function createChosenTagCard(tagData) {
    const {name, latestCreatedPosts, tagFollowers} = tagData;
    const isFollowedByUser = await isTagFollowedByUser(name);
    let button;

    if (isFollowedByUser) {
        button = `<button tagName="${name}" id="followUnfollowButtonInChosenTagCard" class="unfollow">Unfollow</button>`
    } else {
        button = `<button tagName="${name}" id="followUnfollowButtonInChosenTagCard" class="follow">Follow</button>`
    }

    return `
    <div class="chosen-tag-card">
        <h2>#${name}</h2>
        <div>
            <span id="tagFollowers" style="font-weight: bold">${tagFollowers}</span> followers / <span style="font-weight: bold">${latestCreatedPosts}</span> latest posts
        </div>
        <div>
            ${button}
        </div>
    </div>
    `
}

export function createSearchbarTagCard(tagData) {
    const {name, tagFollowers} = tagData;

    return `
    <div class="searchbar-tag-card">
        <a href="../dashboard/dashboard.php?section=discover&tag=${name}">
            <span class="searchbar-tag-name">
                    #${name}
            </span>
            <span class="searchbar-tag-followers">${tagFollowers} followers</span>
        </a>
    </div>
    
    `
}

function createUserFollowedTagCard(tagData) {
    const {name, latestCreatedPosts} = tagData;

    return `
    <div class="user-followed-tag-with-additional-info">
        <div class="followed-tag-link">
            <a href="../dashboard/dashboard.php?section=discover&tag=${name}">
                <span class="tag-name">
                    #${name}
                </span>
                <span class="tag-latest-posts">${latestCreatedPosts} latest posts</span>
            </a>
        </div>
    </div>
    `
}

function createTagCard(tagName) {
    return `
    <div class="tag-suggestion-card">
        <div class="tag-link-container">
            <a href="../dashboard/dashboard.php?section=discover&tag=${tagName}">
                <span>
                    #${tagName}
                </span>
            </a>
        </div>
        <button tagName="${tagName}" id="followUnfollowTagFromSuggestionCard" class="follow">Follow</button>
    </div>
    `
}

export async function populateDashboardContentPosts(posts) {
    for (const post of posts) {
        const createdPost = await createDashboardPost(post);
        dashboardContentContainer.append(createdPost);
    }
}

export async function populateDiscoverContentPosts(posts) {
    dashboardContentContainer.innerHTML = '';

    const containerWithPopularTags = document.createElement('div');
    containerWithPopularTags.classList.add("popular-tags-container")
    const popularTagsData = await getPopularTags();

    for (let i = 0; i < popularTagsData.length; i++) {

        if (i % 2 !== 0 && i !== 0) {
            console.log(i)
            const firstTag = createPopularTagCard(popularTagsData[i-1], i);
            const secondTag = createPopularTagCard(popularTagsData[i], i+1);
            const twoTagsCard = createTwoPopularTagsContainer(firstTag, secondTag);

            containerWithPopularTags.appendChild(twoTagsCard);
        }
    }

    const dividedContainerForDiscoverPosts = document.createElement('div');
    dividedContainerForDiscoverPosts.classList.add("discover-container")

    const container1 = document.createElement("div");
    container1.setAttribute("id", "container1");
    container1.classList.add("discover-posts-container-column");
    const container2 = document.createElement("div");
    container2.setAttribute("id", "container2");
    container2.classList.add("discover-posts-container-column");

    dividedContainerForDiscoverPosts.append(container1, container2);

    dashboardContentContainer.append(containerWithPopularTags, dividedContainerForDiscoverPosts)

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

function createTwoPopularTagsContainer(firstTag, secondTag) {
    const container = document.createElement("div");
    container.classList.add("two-popular-tags-container");
    container.innerHTML += firstTag;
    container.innerHTML += secondTag;

    return container;
}

function createPopularTagCard(tagData, number) {
    const {name, totalUse} = tagData;

    const colors = [
        "#FF6B6B", "#FFA94D", "#FFD43B", "#74C0FC",
        "#63E6BE", "#845EF7", "#FF8787", "#4D908E"
    ];

    return `
     <div style="background: ${colors[number - 1]}" class="popular-tag-card">
           <div class="smoke-effect"></div>
           <a href="../dashboard/dashboard.php?section=discover&tag=${name}"></a> 
           <div class="number-with-name">
             <p style="background: ${colors[number - 1]}" class="number">${number}</p>
             <p>#${name}</p>
           </div>
           <p class="total-uses">${totalUse} posts</p>
     </div>
    `;
}

async function createDashboardPost(postData) {
    const {id, images, postContent, postTitle, postSitesLinks, postType, tags, userId, createdAt} = postData;
    const {userNickname, avatarUrl, avatarImage} = await fetchUserData(userId);
    let avatarSrc = getUserAvatar(avatarUrl, avatarImage);

    const postDiv = document.createElement('div');
    postDiv.classList.add("dashboard-post-card");
    postDiv.setAttribute('id', `post-${id}`);

    const postHeader = await createPostHeader(id, postType, userId, avatarSrc, userNickname, createdAt, true);
    const postContentDiv = await createPostContentContainer(postType, postTitle, postContent, tags, images, postSitesLinks, true);
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
    const postAuthorId = await getPostAuthorId(postId);
    const {userNickname, avatarUrl, avatarImage} = await fetchUserData(userId);
    let avatarSrc = getUserAvatar(avatarUrl, avatarImage);
    let isUserCommentAuthor = false;
    let isUserPostAuthor = false;

    if (await getSignedInUserData()) {
        const {userId: signedInUserId} =await getSignedInUserData()
        isUserCommentAuthor = userId === signedInUserId;
        isUserPostAuthor = postAuthorId === signedInUserId;
    }

    const settingsContainerClass = isUserCommentAuthor || isUserPostAuthor ? "visible" : "hidden";

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
    const postElementInMainContainer = document.getElementById(`post-${postId}`);
    const postElementInRadarContainer = document.getElementById(`radar-post-${postId}`);
    let statisticsSection;

    if (postElementInMainContainer) {
        updateLikesAmountInContainer(postElementInMainContainer, updatedLikes, isLikedByUser);
        statisticsSection = postElementInMainContainer.querySelector(".post-comments-likes-container");
    }

    if (postElementInRadarContainer) {
        updateLikesAmountInContainer(postElementInRadarContainer, updatedLikes, isLikedByUser);
    }

    if (statisticsSection) {
        const likesStatisticInfo = document.getElementById(`likesStatistic-${postId}`)

        if (likesStatisticInfo) {
            likesStatisticInfo.querySelector("span").textContent = `${updatedLikes}`;
        }
    }
}

function updateLikesAmountInContainer(container, updatedLikes, isLikedByUser) {
    const likesContainer = container.querySelector('.post-likes-container span:first-child');
    if (likesContainer) likesContainer.textContent = `${updatedLikes}`;

    const likeIcon = container.querySelector('i.bi-heart, i.bi-heart-fill');
    if (likeIcon) {
        likeIcon.className = isLikedByUser ? 'bi bi-heart-fill liked' : 'bi bi-heart';
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