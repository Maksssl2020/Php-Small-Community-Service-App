import {dashboardContentContainer, followedTagsModal, postOptionsModal} from "./dashboard.js";
import {
    addComment,
    deleteComment,
    deletePostById,
    followTag,
    getAmountOfUserFollowedTags, getPostCreatorId,
    likeOrUnlikePost,
    unfollowTag
} from "./dashboardApiFunctions.js";
import {addCommentCardToPost, updatePostAfterAddCommentOrRemoveComment} from "./dashboardPostRender.js";
import {getPostIdFromIdAttribute} from "./dashboardUtils.js";
import {getCommentsAndFillSection, getLikesAndFillSection} from "../../../indexEventListeners.js";
import {showToast} from "../../../indexUtils.js";
import {getSignedInUserData} from "../../../indexApiFunctions.js";
import {addNewPostModal, addPostModalFormContainer} from "./dashboardAddNewPosts.js";

export async function showDashboardPostAndLikesStatisticsContainer(event) {
    const target = event.target;

    if (target.id === "showDashboardPostStatisticsSection") {
        const postCommentsLikesContainer = target.closest(".post-comments-likes-container");

        if (!postCommentsLikesContainer) {
            return;
        }

        if (target.id === "commentsStatistic") {
            postCommentsLikesContainer.classList.replace("likes", "comments");
        } else if (target.id === "likesStatistic") {
            postCommentsLikesContainer.classList.replace("comments", "likes");
        }
    }
}

export function closeStatisticsModal() {
    const statisticsModal = document.getElementById("discoverPostStatisticsModal");
    statisticsModal.style.display = "none";
}

export async function followTagEventListener() {
    const tagName = this.getAttribute('id');
    const success = await followTag(tagName);

    if (success) {
        this.classList.remove('follow');
        this.classList.add('unfollow');
        this.textContent = 'Unfollow';

        this.removeEventListener('click', followTagEventListener);
        this.addEventListener('click', unfollowTagEventListener);
    } else {
        showToast("Could not follow the tag. Please try again.", "error");
    }
}

export async function unfollowTagEventListener() {
    const tagName = this.getAttribute('id');
    const followedTags = await getAmountOfUserFollowedTags();

    if (followedTags > 1) {
        const success = await unfollowTag(tagName);

        if (success) {
            this.classList.remove('unfollow');
            this.classList.add('follow');
            this.textContent = 'Follow';

            this.removeEventListener('click', unfollowTagEventListener);
            this.addEventListener('click', followTagEventListener);
        }
    } else {
        showToast("Cannot unfollow that tag! You have to follow at least 1 tag!", "error");
    }
}

export async function likeOrUnlikePostEventListener(event)  {
    const likeIcon = event.target;

    if (likeIcon.id === "likeOrUnlikePost" || likeIcon.classList.contains('liked')) {
        const {userId} = await getSignedInUserData();
        const postId = likeIcon.getAttribute("postId");
        const id = await getPostCreatorId(postId);

        if (id !== userId) {
            await likeOrUnlikePost(postId);
        }
    }
}

export async function showPostManagementOptions(event) {
    const userPostSettingsButton = event.target;

    if (userPostSettingsButton.id === "postSettingsButton" ) {
        const postId = userPostSettingsButton.getAttribute("postId");
        const userSettingsDropdown = document.getElementById(`userPostSettingsDropdown-${postId}`);

        userSettingsDropdown.classList.toggle('hidden');
    }
}

export async function showCommentManagementOptions(event) {
    const userCommentSettingsButton = event.target;

    if (userCommentSettingsButton.id === "commentSettingsButton") {
        console.log(event)

        const commentId = userCommentSettingsButton.getAttribute("commentId");
        const commentSettingsDropdown = document.getElementById(`userCommentSettingsDropdown-${commentId}`)

        commentSettingsDropdown.classList.toggle('hidden');
    }
}

export function showDeletePostWarningModal(event) {
    const deletePostButton = event.target;

    if (deletePostButton.id === "deletePost") {
        const postId = deletePostButton.getAttribute("postId");

        const deleteWarningModal = document.getElementById("deleteModalWarningContainer");
        const deleteMessageH2 = document.getElementById("deleteWarningMessage");
        deleteMessageH2.textContent = "Are you sure you want delete that post?";

        deleteWarningModal.style.display = "block";
        deleteWarningModal.setAttribute("postId", postId);
    }
}

export function showDeleteCommentWarningModal(event) {
    const deleteCommentButton = event.target;

    if (deleteCommentButton.id === "deleteComment") {
        const commentId = deleteCommentButton.getAttribute("commentId");

        const statisticsModal = document.getElementById(`discoverPostStatisticsModal`);

        if (statisticsModal.style.display === "block") {
            statisticsModal.style.display = "none";
        }

        const deleteWarningModal = document.getElementById("deleteModalWarningContainer");
        const deleteMessageH2 = document.getElementById("deleteWarningMessage");
        deleteMessageH2.textContent = "Are you sure you want delete that comment?";

        deleteWarningModal.style.display = "block";
        deleteWarningModal.setAttribute("commentId", commentId);
    }
}

export async function confirmPostDeleteEventListener() {
    const deleteWarningModal = document.getElementById("deleteModalWarningContainer");
    const postId = deleteWarningModal.getAttribute("postId");
    const commentId = deleteWarningModal.getAttribute("commentId");

    if (postId !== undefined && postId > 0) {
        await deletePostById(postId);

        const postToDelete = document.getElementById(`post-${postId}`);
        dashboardContentContainer.removeChild(postToDelete)
        cancelDeleteEventListener();
    } else if (commentId !== undefined && commentId > 0) {
        await deleteComment(commentId);

        const commentToDelete = document.getElementById(`comment-${commentId}`);
        dashboardContentContainer.removeChild(commentToDelete)
        cancelDeleteEventListener();
    }
}

export function cancelDeleteEventListener() {
    const deleteWarningModal = document.getElementById("deleteModalWarningContainer");
    deleteWarningModal.removeAttribute("postId");
    deleteWarningModal.removeAttribute("commentId");

    deleteWarningModal.style.display = "none";
}

export async function expandPostStatisticsSection(event) {
    const commentIcon = event.target;

    if (commentIcon.id === 'showDashboardPostStatisticsSection') {
        const postDiv = commentIcon.closest('.dashboard-post-card');
        const commentsContainer = postDiv.querySelector('.post-comments-likes-container');
        const postId = getPostIdFromIdAttribute(postDiv.getAttribute('id'))

        if (commentsContainer.classList.contains('hidden')) {
            commentsContainer.classList.replace('hidden', "visible");
            await getCommentsAndFillSection(postId);
        } else {
            commentsContainer.classList.replace('visible', "hidden");
        }
    }
}

export async function fetchCommentsOrLikesDataInDiscoverPostEventListener(event) {
    const clickedIcon = event.target;

    if (clickedIcon.id === "discoverPostShowComments" || clickedIcon.id === "discoverPostShowLikes") {
        const postId = clickedIcon.getAttribute("postId");
        const commentsStatisticContainer = document.getElementById("discoverPostCommentsStatistic")
        const likesStatisticContainer = document.getElementById("discoverPostLikesStatistic")

        if (clickedIcon.id === 'discoverPostShowComments') {

            if (!commentsStatisticContainer.classList.contains('active')) {
                commentsStatisticContainer.classList.add('active');
                likesStatisticContainer.classList.remove('active');
            }

            await getCommentsAndFillSection(postId, true);
        } else if (clickedIcon.id === 'discoverPostShowLikes') {

            if (!likesStatisticContainer.classList.contains('active')) {
                likesStatisticContainer.classList.add('active');
                commentsStatisticContainer.classList.remove('active');
            }

            await getLikesAndFillSection(postId, true);
        }
    }
}

export async function fillStatisticsWithCommentsOrLikesEventListener(event) {
    const clickedIcon = event.target;

    if (clickedIcon.id === 'showPostComments' || clickedIcon.id === 'showPostLikes') {
        const postDiv = clickedIcon.closest('.post-comments-likes-container');
        const statisticsInfoContainer = clickedIcon.closest('.statistics-info-container');
        const currentIconContainer = clickedIcon.closest('.statistic-container');
        const previousIconContainer = statisticsInfoContainer.querySelector('.statistic-container.active');
        const postId = postDiv.getAttribute('postId');

        if (!currentIconContainer.classList.contains('active')) {
            if (previousIconContainer) {
                previousIconContainer.classList.remove('active');
            }
            currentIconContainer.classList.add('active');
        }

        if (postDiv.classList.contains('visible')) {
            if (clickedIcon.id === 'showPostComments') {
                await getCommentsAndFillSection(postId);
            } else if (clickedIcon.id === 'showPostLikes') {
                await getLikesAndFillSection(postId);
            }
        }
    }
}

export async function addPostCommentEventListener(event) {
    const {userId} = await getSignedInUserData();

    if (event.target.id === "postCommentInput" || event.target.id === "discoverPostCommentInput") {
        const content = event.target.value;
        const postId = event.target.getAttribute("postId");
        const isDiscoverPost = event.target.id === "discoverPostCommentInput";
        let addCommentButton;

        if (isDiscoverPost) {
            addCommentButton = document.getElementById("discoverPostAddCommentButton");
        } else {
            addCommentButton = event.target
                .closest(".add-comment-container")
                .querySelector("#addCommentButton");
        }

        addCommentButton.addEventListener("click", async () => {
            const id = await addComment(postId, content)
            await updatePostAfterAddCommentOrRemoveComment(postId, isDiscoverPost);

            if (id !== -1 && id > 0) {
                await addCommentCardToPost(id, postId, userId, content, new Date().toLocaleDateString(), isDiscoverPost)
            }

            event.target.value = "";
            addCommentButton.disabled = true;
            addCommentButton.classList.remove("available");
        });

        if (content.length > 0) {
            addCommentButton.classList.add("available");
            addCommentButton.disabled = false;
        } else {
            addCommentButton.classList.remove("available");
            addCommentButton.disabled = true;
        }
    }
}

window.onclick = (event) => {
    if (postOptionsModal && event.target === postOptionsModal) {
        postOptionsModal.style.display = 'none';
    }

    if (event.target === addNewPostModal) {
        addNewPostModal.style.display = 'none';
        addPostModalFormContainer.innerHTML = '';
    }

    if (event.target === followedTagsModal) {
        followedTagsModal.style.display = 'none';
    }
}