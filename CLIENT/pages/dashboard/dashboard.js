import {populateDashboardContentPosts} from "./dashboardPostRender.js";
import {
    addComment,
    fetchPostsWithUserFollowedTags,
    fetchRandomPostsForUser,
    fetchUserPosts,
    followTag, getAmountOfUserFollowedTags, getUserFollowedTags, getUserNotFollowedTags
} from "./dashboardApiFunctions.js";
import {autoResize, getSignedInUserData, showToast} from "../../../index.js";
import {
    addPostCommentEventListener, expandPostStatisticsSection, fillStatisticsWithCommentsOrLikesEventListener,
    followTagEventListener, likeOrUnlikePostEventListener,
    unfollowTagEventListener
} from "./dashboardEventListeners.js";

const createPostButton = document.getElementById("createPostButton");

const postTextAreas = document.querySelectorAll(".post-text");
const myPostsSelector = document.getElementById("myPostsTopicItem");
const dashboardSelector = document.getElementById("dashboardItem");
const discoverSelector = document.getElementById("discoverItem");
const topicsSelector = document.getElementById("topicsItem");
const accountSelector = document.getElementById("accountItem");
const dashboardHeader = document.getElementById("dashboardHeader");



const postCommentInput = document.getElementById("postCommentInput");
const addCommentButton = document.getElementById("addCommentButton");

let currentActiveSection = 'dashboard';
let currentActiveHeaderButton = 'forYou';


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


const sectionSelectors = {
    dashboard: dashboardSelector,
    account: accountSelector,
    discover: discoverSelector,
    myPosts: myPostsSelector,
    topics: topicsSelector,
};

const dashboardHeaderMainButtons = [{name: 'For You', id: 'dashboardForYou'}, {name: 'Your Tags', id: 'yourTags'}];
const dashboardHeaderDiscoverButtons =  [{name: 'Recent', id: 'recent'}, {name: 'The best', id: 'theBest'}];

async function handleSectionChange(chosenSection) {
    sectionSelectors[currentActiveSection].style.color = "#ACACAC"
    sectionSelectors[chosenSection].style.color = "#FFFFFF"
    currentActiveSection = chosenSection;

    if (currentActiveSection === 'myPosts') {
        dashboardHeader.style.display = 'none'
    } else {
        dashboardHeader.style.display = 'block'
    }

    if (currentActiveSection === 'discover') {
        dashboardHeader.innerHTML = ''
        dashboardHeaderDiscoverButtons.forEach(button => {
            createHeaderButtons(button, dashboardHeaderDiscoverButtons);
        })
    }

    if (currentActiveSection === 'dashboard') {
        dashboardHeader.innerHTML = ''
        dashboardHeaderMainButtons.forEach(button => {
            createHeaderButtons(button, dashboardHeaderMainButtons);
        })

        await fetchRandomPostsForUser();
    }

    console.log(chosenSection);
}

function createHeaderButtons(button, buttonsCollection) {
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

        if (button.id === 'dashboardForYou') {
            await fetchRandomPostsForUser();
        } else if (button.id === 'yourTags') {
            await fetchPostsWithUserFollowedTags();
        } else if (button.id === 'recent') {

        } else if (button.id === 'theBest') {

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

Object.entries(sectionSelectors).forEach(([section, selector]) => {
    selector.onclick = () => handleSectionChange(section)
})

let chosenTags = [];

createPostButton.onclick = () => {
    postOptionsModal.style.display = "block";
}

if (myPostsSelector) {
    myPostsSelector.addEventListener('click', async () => {
        await fetchUserPosts();
    })
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




dashboardContentContainer.addEventListener("change", addPostCommentEventListener);
dashboardContentContainer.addEventListener('click', likeOrUnlikePostEventListener);
dashboardContentContainer.addEventListener('click', expandPostStatisticsSection);
dashboardContentContainer.addEventListener('click', fillStatisticsWithCommentsOrLikesEventListener);
window.addEventListener('DOMContentLoaded', async () => {
    await handleSectionChange('dashboard');
})


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
