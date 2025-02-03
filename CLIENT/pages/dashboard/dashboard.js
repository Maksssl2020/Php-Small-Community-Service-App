import {populateDashboardContentPosts, populateDiscoverContentPosts} from "./dashboardPostRender.js";
import {
    fetchController,
    fetchPostsForUserDiscoverSection,
    fetchPostsWithUserFollowedTags,
    fetchRandomPostsForUser,
    fetchUserPosts,
    getAmountOfUserFollowedTags,
    getUserFollowedTags,
    getUserNotFollowedTags
} from "./dashboardApiFunctions.js";
import {
    addPostCommentEventListener,
    cancelDeleteEventListener,
    closeStatisticsModal,
    confirmPostDeleteEventListener,
    expandPostStatisticsSection,
    fetchCommentsOrLikesDataInDiscoverPostEventListener,
    fillStatisticsWithCommentsOrLikesEventListener,
    followTagEventListener,
    likeOrUnlikePostEventListener,
    showCommentManagementOptions,
    showDashboardPostAndLikesStatisticsContainer,
    showDeleteCommentWarningModal,
    showDeletePostWarningModal,
    showPostManagementOptions,
    unfollowTagEventListener
} from "./dashboardEventListeners.js";
import {autoResize} from "../../../indexApiFunctions.js";
import {showDiscoverPostAndLikesStatisticsContainer} from "../../../indexEventListeners.js";


const leftColumn = document.getElementById("leftColumn");
const dashboardMiddleContainer = document.getElementById("dashboardMiddleContainer");
const rightColumn = document.getElementById("rightColumn");

const createPostButton = document.getElementById("createPostButton");
const postTextAreas = document.querySelectorAll(".post-text");
const myPostsSelector = document.getElementById("myPostsTopicItem");
const dashboardSelector = document.getElementById("dashboardItem");
const discoverSelector = document.getElementById("discoverItem");
const topicsSelector = document.getElementById("topicsItem");
const accountSelector = document.getElementById("accountItem");
const dashboardHeader = document.getElementById("dashboardHeader");

const confirmDeleteButton = document.getElementById("confirmDelete");
const cancelDeleteButton = document.getElementById("cancelDelete");
const closeStatisticsModalIcon = document.getElementById("closeStatisticsModal");
const statisticsModal = document.getElementById("discoverPostStatisticsModal");

// dashboardContentContainer
export const dashboardContentContainer = document.getElementById("dashboardContentContainer");
// postOptionsModal
export const postOptionsModal = document.getElementById("postOptionsContainer");

// followedTagsModal
export const followedTagsModal = document.getElementById("manageFollowedTagsModal");
const followedTagsModalList = document.getElementById("followedTagsModalList");
const searchNewTagsToFollowInput = document.getElementById("searchNewTagsToFollow");
const resetTagsSearchbarIcon = document.getElementById("resetTagsSearchbar");
const closeManageFollowedTagsModalIcon = document.getElementById("closeManageFollowedTagsModal");

const dashboardHeaderMainButtons = [{name: 'For You', id: 'dashboardForYou'}, {name: 'Your Tags', id: 'yourTags'}];
const dashboardHeaderDiscoverButtonsWithSpecifiedTag =  [{name: 'Recent', id: 'recent'}, {name: 'The best', id: 'theBest'}];
const dashboardHeaderDiscoverButtonsWithoutSpecifiedTag =  [{name: 'Popular', id: 'popular'}, {name: 'Recent for you', id: 'recentForYou'}];

let currentActiveHeaderButton = 'forYou';
let currentActiveSection = 'dashboard';

const sectionSelectors = {
    dashboard: dashboardSelector,
    account: accountSelector,
    discover: discoverSelector,
    myPosts: myPostsSelector,
    topics: topicsSelector,
};

document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const section = urlParams.get("section");
    const tag = urlParams.get("tag");

    await handleSectionChange(section, fetchController, tag);
})

Object.entries(sectionSelectors).forEach(([section, selector]) => {
    if (selector) {
        selector.onclick = () => handleSectionChange(section, fetchController)
    }
})

async function handleSectionChange(chosenSection, fetchController, specifiedTag = "") {
    sectionSelectors[currentActiveSection].style.color = "#ACACAC"
    sectionSelectors[chosenSection].style.color = "#FFFFFF"
    currentActiveSection = chosenSection;

    fetchController.abort();
    fetchController = new AbortController();

    if (chosenSection === "dashboard" || chosenSection === "myPosts") {
        dashboardContentContainer.innerHTML = '';

        leftColumn.classList.remove("discover");
        dashboardMiddleContainer.classList.remove("discover");
        rightColumn.classList.remove("discover");

        leftColumn.classList.add("dashboard");
        dashboardMiddleContainer.classList.add("dashboard");
        rightColumn.classList.add("dashboard");

        dashboardContentContainer.classList.remove("discover");
        dashboardContentContainer.classList.add("dashboard");
    }

    if (chosenSection !== "dashboard" && chosenSection !== "myPosts") {
        leftColumn.classList.remove("dashboard");
        dashboardMiddleContainer.classList.remove("dashboard");
        rightColumn.classList.remove("dashboard");

        leftColumn.classList.add("discover");
        dashboardMiddleContainer.classList.add("discover");
        rightColumn.classList.add("discover");

        dashboardContentContainer.classList.remove("dashboard");
        dashboardContentContainer.classList.add("discover");
    }

    if (chosenSection === 'myPosts') {
        dashboardHeader.style.display = 'none';
        await fetchUserPosts(fetchController.signal);
    } else {
        dashboardHeader.style.display = 'block';
    }

    if (currentActiveSection === 'discover' && specifiedTag === "") {
        dashboardHeader.innerHTML = ''
        dashboardHeaderDiscoverButtonsWithoutSpecifiedTag.forEach(button => {
            createHeaderButtons(button, dashboardHeaderDiscoverButtonsWithoutSpecifiedTag, fetchController.signal);
        })

        const posts = await fetchPostsForUserDiscoverSection(fetchController.signal, "popular");
        await populateDiscoverContentPosts(posts);
    }
    if (currentActiveSection === 'discover' && specifiedTag !== "") {
        dashboardHeader.innerHTML = ''
        dashboardHeaderDiscoverButtonsWithSpecifiedTag.forEach(button => {
            createHeaderButtons(button, dashboardHeaderDiscoverButtonsWithSpecifiedTag, fetchController.signal, specifiedTag);
        })

        const posts = await fetchPostsForUserDiscoverSection(fetchController.signal, "recent", specifiedTag);
        await populateDiscoverContentPosts(posts);
    }

    if (currentActiveSection === 'dashboard') {
        dashboardHeader.innerHTML = ''
        dashboardHeaderMainButtons.forEach(button => {
            createHeaderButtons(button, dashboardHeaderMainButtons, fetchController.signal);
        })

        await fetchRandomPostsForUser(fetchController.signal);
    }

    console.log(chosenSection)
}

function createHeaderButtons(button, buttonsCollection, signal, specifiedTag = "") {
    const headerButton = document.createElement('button');
    headerButton.setAttribute('id', button.id);
    headerButton.setAttribute('type', 'button');
    headerButton.textContent = button.name;
    headerButton.classList.add('header-button');
    currentActiveHeaderButton = buttonsCollection[0].id;

    if (button.id === currentActiveHeaderButton) {
        headerButton.classList.add('active');
    }

    headerButton.onclick = async function () {
        handleHeaderButtonChange(this);

        dashboardContentContainer.innerHTML = '';

        if (button.id === 'dashboardForYou') {
            await fetchRandomPostsForUser(signal);
        } else if (button.id === 'yourTags') {
            await fetchPostsWithUserFollowedTags(signal);
        } else if (button.id === 'recent') {
            const posts = await fetchPostsForUserDiscoverSection(signal, "recent", specifiedTag);
            await populateDiscoverContentPosts(posts);
        } else if (button.id === 'theBest') {
            const posts = await fetchPostsForUserDiscoverSection(signal, "theBest", specifiedTag);
            await populateDiscoverContentPosts(posts);
        } else if (button.id === 'popular') {
            const posts = await fetchPostsForUserDiscoverSection(signal, "popular");
            await populateDiscoverContentPosts(posts);
        } else if (button.id === 'recentForYou') {
            const posts =await fetchPostsForUserDiscoverSection(signal, "recentForYou");
            await populateDiscoverContentPosts(posts)
        }
    }

    dashboardHeader.appendChild(headerButton);
}

const handleHeaderButtonChange = (button) => {
    const currentActiveButton = document.getElementById(currentActiveHeaderButton);
    currentActiveButton.classList.remove('active');

    currentActiveHeaderButton = button.id;
    button.classList.add('active');
}

if (createPostButton) {
    createPostButton.onclick = () => {
        postOptionsModal.style.display = "block";
    }
}

postTextAreas.forEach((textArea) => {
    textArea.addEventListener("input", autoResize);
    autoResize.call(textArea);
})

export async function populateDashboardContentWithPostsThatContainFollowedTags(posts) {
    const amountOfFollowedUserTags = await getAmountOfUserFollowedTags();

    if (amountOfFollowedUserTags === 0) {
        dashboardContentContainer.innerHTML += `
        <div class="no-posts-info">
            <h3>You didn't follow any tag!</h3>
        </div>
        `;
    }

    const followedTagsContainer = `
    <div class="followed-tags-container">
        <div class="followed-tags-title">
            <h2>Followed tags</h2>
            <button id="openFollowedTagsModal">Manage</button>
        </div>
    </div>
    `

    dashboardContentContainer.innerHTML += followedTagsContainer;

    const openFollowedTagsModalButton = document.getElementById('openFollowedTagsModal');
    openFollowedTagsModalButton.addEventListener('click', async function () {
        followedTagsModal.style.display = "block";

        const followedTags = await getUserFollowedTags();
        const notFollowedTags = await getUserNotFollowedTags();

        if (followedTags.length === 0) {
            populateFollowedTagsModalListWithTags(notFollowedTags, false);
        } else {
            populateFollowedTagsModalListWithTags(followedTags, true);
        }

    })

    await populateDashboardContentPosts(posts);
}

function populateFollowedTagsModalListWithTags(tags, areFollowed) {
    followedTagsModalList.innerHTML = "";

    if (areFollowed) {
        createFollowedTagsListElements(tags);
    } else {
        createUnfollowedTagsListElements(tags);
    }

    addFollowUnfollowListeners();
}
function createFollowedTagsListElements(tags) {
    tags.forEach(tag => {
        const listElement = `
            <div class="followed-tags-modal-list-element followed">
                <p>#${tag.name}</p>
                <div class="followed-tags-list-element-buttons-container">
                    <button id="${tag.name}" class="go-to-tag-button">Go to tag</button>
                    <button id="${tag.name}" class="follow-option-button unfollow">Unfollow</button>
                </div>
            </div>
            `

        followedTagsModalList.innerHTML += listElement;
    })
}

function createUnfollowedTagsListElements(tags) {
    tags.slice(0, 8).forEach(tag => {
        const listElement = `
            <div class="followed-tags-modal-list-element not-followed">
                <p>#${tag.name}</p>
                <button id="${tag.name}" class="follow-option-button follow">Follow</button>
            </div>
            `

        followedTagsModalList.innerHTML += listElement;
    })
}

if (searchNewTagsToFollowInput) {
    searchNewTagsToFollowInput.addEventListener('change', async (event) => {
        resetTagsSearchbarIcon.style.visibility = "visible";
        const inputValue = event.target.value.toLowerCase();
        followedTagsModalList.innerHTML = '';
        const notFollowedTags = await getUserNotFollowedTags();
        const filteredTags = notFollowedTags.filter(tag => tag.name.toLowerCase().includes(inputValue));
        createUnfollowedTagsListElements(filteredTags);
        addFollowUnfollowListeners();
    })
}

if (closeManageFollowedTagsModalIcon) {
    closeManageFollowedTagsModalIcon.addEventListener('click', function () {
        followedTagsModal.style.display = "none";
    })
}

if (resetTagsSearchbarIcon) {
    resetTagsSearchbarIcon.addEventListener('click', async () => {
        const followedTags = await getUserFollowedTags();
        searchNewTagsToFollowInput.value = "";
        populateFollowedTagsModalListWithTags(followedTags, true);
        resetTagsSearchbarIcon.style.visibility = "hidden";
    })
}

function addFollowUnfollowListeners() {
    const followButtons = document.querySelectorAll('.follow-option-button.follow');
    followButtons.forEach(button => {
        button.removeEventListener('click', followTagEventListener);
        button.addEventListener('click', followTagEventListener);
    });

    const unfollowButtons = document.querySelectorAll('.follow-option-button.unfollow');
    unfollowButtons.forEach(button => {
        button.removeEventListener('click', unfollowTagEventListener);
        button.addEventListener('click', unfollowTagEventListener);
    });
}


if (statisticsModal) {
    statisticsModal.addEventListener('click', fetchCommentsOrLikesDataInDiscoverPostEventListener);
    statisticsModal.addEventListener("change", addPostCommentEventListener);
    statisticsModal.addEventListener("click", showCommentManagementOptions);
    statisticsModal.addEventListener("click", showDeleteCommentWarningModal)
}

if (dashboardContentContainer) {
    dashboardContentContainer.addEventListener('click', showDashboardPostAndLikesStatisticsContainer)
    dashboardContentContainer.addEventListener("click", showDiscoverPostAndLikesStatisticsContainer);
    dashboardContentContainer.addEventListener("change", addPostCommentEventListener);
    dashboardContentContainer.addEventListener('click', likeOrUnlikePostEventListener);
    dashboardContentContainer.addEventListener('click', expandPostStatisticsSection);
    dashboardContentContainer.addEventListener('click', fillStatisticsWithCommentsOrLikesEventListener);
    dashboardContentContainer.addEventListener('click', showPostManagementOptions);
    dashboardContentContainer.addEventListener("click", showDeletePostWarningModal);
    dashboardContentContainer.addEventListener("click", showDeleteCommentWarningModal);
}

if (closeStatisticsModalIcon) {
    closeStatisticsModalIcon.addEventListener('click', closeStatisticsModal)
}

if (confirmDeleteButton) {
    confirmDeleteButton.addEventListener('click', confirmPostDeleteEventListener);
}

if (cancelDeleteButton) {
    cancelDeleteButton.addEventListener('click', cancelDeleteEventListener);
}

async function createSiteCard(url, siteData) {
    const listItem = document.createElement('li');
    listItem.classList.add('link-item-container');

    const itemDiv = document.createElement('div');
    itemDiv.className = 'site-preview';

    const itemLink = document.createElement('a');
    itemLink.href = url;
    itemLink.target = '_blank';

    itemDiv.appendChild(itemLink);

    if (siteData.image) {
        const img = document.createElement('img');
        img.src = siteData.image;
        img.alt = 'Preview Image';
        img.classList.add('site-preview-image');

        itemDiv.appendChild(img);
    }

    const siteInfoDiv = document.createElement('div');
    siteInfoDiv.classList.add('site-preview-info');

    if (siteData.title) {
        const titleH3 = document.createElement('h3');
        titleH3.textContent = siteData.title;
        siteInfoDiv.appendChild(titleH3);
    }

    if (siteData.description) {
        const descriptionP = document.createElement('P');
        descriptionP.textContent = siteData.description;
        siteInfoDiv.appendChild(descriptionP);
    }

    itemDiv.appendChild(siteInfoDiv);
    listItem.appendChild(itemDiv);
    listItem.id = url;

    return listItem;
}
