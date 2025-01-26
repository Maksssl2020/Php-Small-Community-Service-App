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

let currentActiveSection = 'dashboard';

const sectionSelectors = {
    dashboard: dashboardSelector,
    account: accountSelector,
    discover: discoverSelector,
    myPosts: myPostsSelector,
    topics: topicsSelector,
};

const dashboardHeaderMainButtons = ['For You', 'Your Tags'];
const dashboardHeaderDiscoverButtons =  ['Popular', 'For You'];

function handleSectionChange(chosenSection) {
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
    }
}

function createHeaderButtons(button, buttonsCollection) {
    const headerButton = document.createElement('button');
    headerButton.setAttribute('id', button);
    headerButton.setAttribute('type', 'button');
    headerButton.textContent = button;
    headerButton.classList.add('header-button');

    if (button === buttonsCollection[0]) {
        headerButton.style.color = "#FFFFFF"
        headerButton.style.borderBottomColor = "#FF8A80"
    }

    dashboardHeader.appendChild(headerButton);
}

Object.entries(sectionSelectors).forEach(([section, selector]) => {
    selector.onclick = () => handleSectionChange(section)
})

let chosenTags = [];

createPostButton.onclick = () => {
    postOptionsModal.style.display = "block";
}

if (dashboardSelector) {
    dashboardSelector.onclick = async () => {
        await fetchRandomPostsForUser();
    }
}

if (myPostsSelector) {
    myPostsSelector.onclick = async () => {
        await fetchUserPosts();
    }
}

postTextAreas.forEach((textArea) => {
    textArea.addEventListener("input", autoResize);
    autoResize.call(textArea);
})

async function populateDashboardContentWithUserPosts(userPosts) {
    for (const post of userPosts) {
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
    console.log(likeIcon);

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

window.addEventListener('DOMContentLoaded', () => {
    handleSectionChange('dashboard');
})