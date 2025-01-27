const createPostButton = document.getElementById("createPostButton");
const postOptionsModal = document.getElementById("postOptionsContainer");
const dashboardContentContainer = document.getElementById("dashboardContentContainer");
const postTextAreas = document.querySelectorAll(".post-text");
const myPostsSelector = document.getElementById("myPostsTopicItem");
const dashboardSelector = document.getElementById("dashboardItem");
const discoverSelector = document.getElementById("discoverItem");
const topicsSelector = document.getElementById("topicsItem");
const accountSelector = document.getElementById("accountItem");
const dashboardHeader = document.getElementById("dashboardHeader");

const followedTagsModal = document.getElementById("manageFollowedTagsModal");
const followedTagsModalList = document.getElementById("followedTagsModalList");
const searchNewTagsToFollowInput = document.getElementById("searchNewTagsToFollow");
const resetTagsSearchbarIcon = document.getElementById("resetTagsSearchbar");
const closeManageFollowedTagsModalIcon = document.getElementById("closeManageFollowedTagsModal");

const testItemA = document.getElementById("testItem");

// testItemA.addEventListener("click", (e) => {
//     e.preventDefault();
//     test("test");
// })

let currentActiveSection = 'dashboard';
let currentActiveHeaderButton = 'forYou';

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

async function populateDashboardContentWithPostsThatContainFollowedTags(posts) {
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
        button.removeEventListener('click', followTagEventListener); // Usunięcie istniejącego listenera
        button.addEventListener('click', followTagEventListener);
    });

    const unfollowButtons = document.querySelectorAll('.follow-option-button.unfollow');
    unfollowButtons.forEach(button => {
        button.removeEventListener('click', unfollowTagEventListener); // Usunięcie istniejącego listenera
        button.addEventListener('click', unfollowTagEventListener);
    });
}

async function followTagEventListener() {
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

async function unfollowTagEventListener() {
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

async function populateDashboardContentPosts(posts) {
    for (const post of posts) {
        const {id, images, postContent, postTitle, postSitesLinks, postType, tags, userId, createdAt} = post;
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
        postDiv.setAttribute('id', id);

        const postHeader = `
            <header class="post-header">
                <img src=${userAvatar} alt="user_icon" class="post-author-image"/>
                <div class="post-data-container">
                    <p style="color:  var(--custom-white-color-100);">${userNickname}</p>
                    <p>${new Date(createdAt.date).toLocaleDateString('pl-PL')}</p>
                </div>
            </header>
        `;

        const postTags = tags.map(tag => `<span>#${tag.name}</span>`).join('');

        let postContentDiv = ``

        if (postType === 'text') {
            postContentDiv = `
            <div class="post-content">
                <h3 class="post-title">${postTitle}</h3>
                <p id="autoresize" class="post-text" spellcheck="false">${postContent}</p>
                <div class="post-tags">${postTags}</div>
            </div>`;
        } else if (postType === 'image') {
            const postImages = images.map(image => `<img src=${image.url} alt=${image.id}/>`).join('')

            postContentDiv = `
            <div class="post-content">
                <div class="post-images-container">${postImages}</div>
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
            const linksContainer = document.createElement('ul');
            linksContainer.classList.add('post-links-container');

            for (const link of postSitesLinks) {
                let siteData = await fetchSiteData(link);
                const card = await createSiteCard(link, siteData, linksContainer)
                linksContainer.append(card);
            }

            postContentDiv = `
            <div class="post-content">
                ${linksContainer.outerHTML}
                <p id="autoresize" class="post-text" spellcheck="false" >${postContent ?? ''}</p>
                <div class="post-tags">${postTags}</div>
            </div>
            `
        }

        const postLikes = await fetchPostAmountOfLikes(id);
        const isLikedByUser = await isPostLikedByUser(id);

        const postFooter = `
            <footer class="post-footer">
                <div class="post-likes-container">
                    <span>${postLikes}</span>
                    <span>${postLikes === 1 ? 'heart' : 'hearts'}</span>
                </div>
                <div class="user-options">
                    <i class="bi bi-chat"></i>
                    <i id="${id}" class="${isLikedByUser ? 'bi bi-heart-fill liked' : 'bi bi-heart'}"></i>
                </div>
            </footer>
        `;

        postDiv.innerHTML = postHeader + postContentDiv + postFooter;
        dashboardContentContainer.appendChild(postDiv);
    }
}

dashboardContentContainer.addEventListener('click', async event => {
    const likeIcon = event.target;

    if (likeIcon.classList.contains('bi-heart') || likeIcon.classList.contains('liked')) {
        const postId = likeIcon.id;
        await likeOrUnlikePost(postId);
    }
});

async function updatePostAfterLikeOrUnlike(postId) {
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

window.addEventListener('DOMContentLoaded', async () => {
    await handleSectionChange('dashboard');
})
