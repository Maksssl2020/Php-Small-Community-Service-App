import {dashboardContentContainer, followedTagsModal, postOptionsModal} from "./dashboard.js";
import {
    addComment, deletePostById, fetchUserPosts,
    followTag,
    getAmountOfUserFollowedTags, getPostComments, getPostLikesData,
    likeOrUnlikePost,
    unfollowTag
} from "./dashboardApiFunctions.js";
import {getSignedInUserData, showToast} from "../../../index.js";
import {
    addCommentCardToPost,
    fillCommentsSection,
    fillLikesSection,
    updatePostAfterAddCommentOrRemoveComment
} from "./dashboardPostRender.js";
import {getPostIdFromIdAttribute} from "./dashboardUtils.js";

export async function showPostAndLikesStatisticsContainer(event) {
    const target = event.target;

    if (target.id !== "showPostComments" && target.classList.contains("bi-chat")) {
        const postCommentsLikesContainer = target.closest(".post-comments-likes-container");

        if (!postCommentsLikesContainer) {
            return;
        }

        if (target.id === "commentsStatistic") {
            postCommentsLikesContainer.classList.add("comments");
            postCommentsLikesContainer.classList.remove("likes");
        } else if (target.id === "likesStatistic") {
            postCommentsLikesContainer.classList.add("likes");
            postCommentsLikesContainer.classList.remove("comments");
        }
    }
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
        const postId = likeIcon.getAttribute("postId");
        await likeOrUnlikePost(postId);
    }
}

export async function showPostOptionsToManageIt(event) {
    const userPostSettingsButton = event.target;


    if (userPostSettingsButton.classList.contains('post-settings-button') ) {
        const postId = userPostSettingsButton.getAttribute("postId");
        const userSettingsDropdown = document.getElementById(`userPostSettingsDropdown-${postId}`);

        userSettingsDropdown.classList.toggle('hidden');
    }
}

export function showDeletePostWarningModal(event) {
    const deletePostButton = event.target;

    if (deletePostButton.id === "deletePost") {
        const postId = deletePostButton.getAttribute("postId");
        const deleteWarningModal = document.getElementById("deletePostWarningContainer");
        deleteWarningModal.style.display = "block";
        deleteWarningModal.setAttribute("postId", postId);
    }
}

export async function confirmPostDeleteEventListener() {
    const deleteWarningModal = document.getElementById("deletePostWarningContainer");
    const postId = deleteWarningModal.getAttribute("postId");
    await deletePostById(postId);

    const postToDelete = document.getElementById(`post-${postId}`);
    dashboardContentContainer.removeChild(postToDelete)

    cancelPostDeleteEventListener();
}

export function cancelPostDeleteEventListener() {
    const deleteWarningModal = document.getElementById("deletePostWarningContainer");
    deleteWarningModal.removeAttribute("postId");
    deleteWarningModal.style.display = "none";
}

export async function expandPostStatisticsSection(event) {
    const commentIcon = event.target;

    if (commentIcon.id === 'showStatisticsSection') {
        const postDiv = commentIcon.closest('.dashboard-post-card');
        const commentsContainer = postDiv.querySelector('.post-comments-likes-container');
        const postId = getPostIdFromIdAttribute(postDiv.getAttribute('id'))

        if (commentsContainer.classList.contains('hidden')) {
            commentsContainer.classList.remove('hidden');
            commentsContainer.classList.add('visible');

            await getCommentsAndFillSection(postId);
        } else {
            commentsContainer.classList.remove('visible');
            commentsContainer.classList.add('hidden');
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

async function getCommentsAndFillSection(postId) {
    const postComments = await getPostComments(postId);
    await fillCommentsSection(postId, postComments);
}

async function getLikesAndFillSection(postId) {
    const likesData = await getPostLikesData(postId);
    await fillLikesSection(postId, likesData);
}

export async function addPostCommentEventListener(event) {
    const {userId} = await getSignedInUserData();

    if (event.target && event.target.id === "postCommentInput") {
        const content = event.target.value;
        const postId = event.target.getAttribute("postID");
        const addCommentButton = event.target
            .closest(".add-comment-container")
            .querySelector("#addCommentButton");

        addCommentButton.addEventListener("click", async () => {
            const id = await addComment(postId, content)
            await updatePostAfterAddCommentOrRemoveComment(postId);

            if (id !== -1 && id > 0) {
                await addCommentCardToPost(id, postId, userId, content, new Date().toLocaleDateString())
            }

            event.target.value = "";
            addCommentButton.disabled = true;
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