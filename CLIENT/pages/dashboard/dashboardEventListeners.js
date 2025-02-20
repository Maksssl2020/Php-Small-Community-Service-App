import {followedTagsModal, populateFollowedTagsModalListWithTags, postOptionsModal} from "./dashboard.js";
import {
    addComment,
    deleteComment,
    deletePostById,
    followTag,
    getAmountOfUserFollowedTags,
    getPostCreatorId,
    getPostData,
    getUserFollowedTags,
    getUserNotFollowedTags,
    likeOrUnlikePost,
    unfollowTag
} from "./dashboardApiFunctions.js";
import {addCommentCardToPost, updatePostAfterAddCommentOrRemoveComment} from "./dashboardPostRender.js";
import {getPostIdFromIdAttribute} from "./dashboardUtils.js";
import {getCommentsAndFillSection, getLikesAndFillSection} from "../../../indexEventListeners.js";
import {showToast} from "../../../indexUtils.js";
import {getSignedInUserData} from "../../../indexApiFunctions.js";
import {addNewPostModal, addPostModalFormContainer, editPostData, resetFormData} from "./dashboardAddNewPosts.js";

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
        this.classList.replace('follow', 'unfollow');
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
            this.classList.replace('unfollow', 'follow');
            this.textContent = 'Follow';

            this.removeEventListener('click', unfollowTagEventListener);
            this.addEventListener('click', followTagEventListener);
        }
    } else {
        showToast("Cannot unfollow that tag! You have to follow at least 1 tag!", "error");
    }
}

export async function followOrUnfollowTagByUser() {
    const tagName = this.getAttribute('tagName');
    const tagFollowersSpan = document.getElementById("tagFollowers")
    const currentTagFollowers = parseInt(tagFollowersSpan.textContent);

    if (this.classList.contains("follow")) {
        const success = await followTag(tagName)

        if (success) {
            tagFollowersSpan.textContent = `${currentTagFollowers+1}`;
            this.classList.replace('follow', 'unfollow');
            this.textContent = 'Unfollow';
        }
    } else if (this.classList.contains("unfollow")) {
        const success = await unfollowTag(tagName)

        if (success) {
            tagFollowersSpan.textContent = `${currentTagFollowers-1}`;
            this.classList.replace('unfollow', 'follow');
            this.textContent = 'Follow';
        }
    }
}

export async function followUnfollowTagInSuggestion(event) {
    if (event.target.id === "followUnfollowTagFromSuggestionCard") {
        const followUnfollowButton = event.target;
        const tagName = followUnfollowButton.getAttribute('tagName');

        if (followUnfollowButton.classList.contains("follow")) {
            const success = await followTag(tagName)

            if (success) {
                followUnfollowButton.remove();
            }
        }
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

export async function openEditPostModalEventListener(event) {
    const editPostButton = event.target;

    if (editPostButton.id === "editPost") {
        const postId = editPostButton.getAttribute("postId");
        const postType = editPostButton.getAttribute("postType");
        const postData = await getPostData(postId);
        await editPostData(postData[0], postType, postId);
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
        if (postToDelete) {
            postToDelete.remove();
        }
        cancelDeleteEventListener();
    } else if (commentId !== undefined && commentId > 0) {
        await deleteComment(commentId);

        const commentToDelete = document.getElementById(`comment-${commentId}`);
        const postId = commentToDelete.getAttribute("postId");
        const isDiscoverPost = commentToDelete.getAttribute("postType") === "discover";

        setTimeout(async () => {
            await updatePostAfterAddCommentOrRemoveComment(postId, isDiscoverPost);
        }, 1000)

        if (commentToDelete) {
            commentToDelete.remove();
        }

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

export function turnOnPostAddCommentButton(event) {
    const postCommentInput = event.target;
    console.log(event.target.id);

    if (postCommentInput.id.includes("postCommentInput") || postCommentInput.id === "discoverPostCommentInput") {
        const content = postCommentInput.value;
        const isDiscoverPost = postCommentInput.id === "discoverPostCommentInput";
        let addCommentButton;

        if (isDiscoverPost) {
            addCommentButton = document.getElementById("discoverPostAddCommentButton");
        } else {
            const postId = postCommentInput.getAttribute("postId");
            addCommentButton = document.getElementById(`addCommentButton-${postId}`)
        }

        if (content.length > 0) {
            addCommentButton.classList.add("available");
            addCommentButton.disabled = false;
        } else {
            addCommentButton.classList.remove("available");
            addCommentButton.disabled = true;
        }
    }
}

export async function addPostCommentEventListener() {
    const {userId} = await getSignedInUserData();

    if (this.id === "discoverPostAddCommentButton" && this.disabled === false) {
        const commentInput = document.getElementById("discoverPostCommentInput");
        const content = commentInput.value;
        const postId = commentInput.getAttribute("postId");

        const id = await addComment(postId, content)
        await updatePostAfterAddCommentOrRemoveComment(postId, true);

        if (id !== -1 && id > 0) {
            await addCommentCardToPost(id, postId, userId, content, new Date().toLocaleDateString(), true)
        }

        commentInput.value = "";
        this.disabled = true;
        this.classList.remove("available");
    }


    if (this.id.includes("addCommentButton") && this.disabled === false) {
        const postId = this.getAttribute("postId");
        const commentInput = document.getElementById(`postCommentInput-${postId}`);
        const content = commentInput.value;

        const id = await addComment(postId, content)
        await updatePostAfterAddCommentOrRemoveComment(postId, false);

        if (id !== -1 && id > 0) {
            await addCommentCardToPost(id, postId, userId, content, new Date().toLocaleDateString(), false)
        }

        commentInput.value = "";
        this.disabled = true;
        this.classList.remove("available");
    }
}

export async function openFollowedTagsModalEventListener() {
    followedTagsModal.style.display = "block";

    const followedTags = await getUserFollowedTags();
    const notFollowedTags = await getUserNotFollowedTags();

    if (followedTags.length === 0) {
        populateFollowedTagsModalListWithTags(notFollowedTags, false);
    } else {
        populateFollowedTagsModalListWithTags(followedTags, true);
    }
}

window.onclick = async (event) => {
    if (postOptionsModal && event.target === postOptionsModal) {
        postOptionsModal.style.display = 'none';
    }

    if (event.target === addNewPostModal) {
        addNewPostModal.style.display = 'none';
        addPostModalFormContainer.innerHTML = '';
        await resetFormData();
    }

    if (event.target === followedTagsModal) {
        followedTagsModal.style.display = 'none';
    }
}