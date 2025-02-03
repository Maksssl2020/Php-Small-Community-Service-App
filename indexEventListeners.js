import {fetchPostAmountOfLikes, fetchUserData, getSignedInUserData} from "./indexApiFunctions.js";
import {countPostComments, getPostComments, getPostLikesData} from "./CLIENT/pages/dashboard/dashboardApiFunctions.js";
import {getUserAvatar} from "./indexUtils.js";
import {fillCommentsSection, fillLikesSection} from "./CLIENT/pages/dashboard/dashboardPostRender.js";

export async function showDiscoverPostAndLikesStatisticsContainer(event) {
    const target = event.target;
    const isLoggedIn = await getSignedInUserData() !== null;

    if (target.id === "showDiscoverPostStatisticsSection") {
        const postId = target.getAttribute("postId");
        const statisticsModal = document.getElementById("discoverPostStatisticsModal");

        const postLikes = await fetchPostAmountOfLikes(postId);
        const postAmountOfComments = await countPostComments(postId);
        const commentInputUserAvatarImg = document.getElementById("discoverPostCommentInputUserAvatar");
        const commentInput = document.getElementById("discoverPostCommentInput");

        if (isLoggedIn) {
            const {userId, userNickname} = await getSignedInUserData();
            const {avatarUrl, avatarImage} = await fetchUserData(userId)
            commentInputUserAvatarImg.src = getUserAvatar(avatarUrl, avatarImage);
            commentInput.placeholder = `Respond as @${userNickname}`;
        } else {
            commentInputUserAvatarImg.src = getUserAvatar(null, null);
        }

        const amountOfHeartsSpan = document.getElementById("discoverPostAmountOfHearts");
        const heartsVarietySpan = document.getElementById("discoverPostHeartsVariety");
        amountOfHeartsSpan.textContent = `${postLikes}`;
        heartsVarietySpan.textContent = postLikes === 1 ? "Heart" : "Hearts";

        const amountOfCommentsSpan = document.getElementById("discoverPostAmountOfComments");
        const amountOfLikesSpan = document.getElementById("discoverPostAmountOfLikes");
        amountOfCommentsSpan.textContent = `${postAmountOfComments}`;
        amountOfLikesSpan.textContent = `${postLikes}`;

        const discoverPostShowComments = document.getElementById("discoverPostShowComments");
        const discoverPostShowLikes = document.getElementById("discoverPostShowLikes");
        discoverPostShowComments.setAttribute('postId', postId);
        discoverPostShowLikes.setAttribute('postId', postId);

        const discoverPostCommentInput = document.getElementById("discoverPostCommentInput");
        discoverPostCommentInput.setAttribute("postId", postId);

        if (!isLoggedIn) {
            discoverPostCommentInput.disabled = true;
        }

        await getCommentsAndFillSection(postId, true)

        statisticsModal.style.display = "block";
    }
}

export async function getCommentsAndFillSection(postId, isDiscoverPost = false) {
    const postComments = await getPostComments(postId);
    await fillCommentsSection(postId, postComments, isDiscoverPost);
}

export async function getLikesAndFillSection(postId, isDiscoverPost = false) {
    const likesData = await getPostLikesData(postId);
    await fillLikesSection(postId, likesData, isDiscoverPost);
}