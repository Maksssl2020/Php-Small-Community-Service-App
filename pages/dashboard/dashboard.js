const createPostButton = document.getElementById("createPostButton");
const postOptionsModal = document.getElementById("postOptionsContainer");


const dashboardContentContainer = document.getElementById("dashboardContentContainer");
const myPostsSelector = document.getElementById("myPostsTopicItem");

const postTextAreas = document.querySelectorAll(".post-text");

let chosenTags = [];

createPostButton.onclick = () => {
    postOptionsModal.style.display = "block";
}


tagInput.addEventListener('keypress', (e) => {
    if (e.key === "Enter" && tagInput.value.trim() !== "") {
        addNewUserTag(tagInput.value.trim());
        tagInput.value = "";
    }
})

if (myPostsSelector) {
    myPostsSelector.onclick = async () => {
        console.log('CLICKED!')
        await fetchUserPosts();
    }
}


postTextAreas.forEach((textArea) => {
    textArea.addEventListener("input", autoResize);
    autoResize.call(textArea);
})

function autoResize() {
    this.style.height = "auto";
    this.style.height = `${this.scrollHeight}px`;
}

async function fetchUserPosts() {
    fetch("../../utils/posts/get_user_all_posts.php")
        .then( res => res.json())
        .then(async data => {
            if (data.success) {
                dashboardContentContainer.innerHTML = "";
                await populateDashboardContentWithUserPosts(data.data);
                console.log(data.data);
            } else {
                console.log(data.errors);
            }
        })
        .catch(err => console.log(err));
}

async function populateDashboardContentWithUserPosts(userPosts) {
    for (const post of userPosts) {
        console.log(post);

        const {id, images, postContent, postTitle, postLinkUrl, postType, tags, userId, createdAt} = post;
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
                <textarea class="post-text" spellcheck="false" readonly>${postContent}</textarea>
                <div class="post-tags">${postTags}</div>
            </div>`;
        } else if (postType === 'image') {
            const postImages = images.map(image => `<img src=${image.url} alt=${image.id}/>`).join('')

            postContentDiv = `
            <div class="post-content">
                <div class="post-images-container">${postImages}</div>
                <textarea class="post-text" spellcheck="false" readonly>${postContent ?? ''}</textarea>
                <div class="post-tags">${postTags}</div>
            </div>`;
        }

        const postLikes = await fetchPostAmountOfLikes(id);

        const postFooter = `
            <footer class="post-footer">
                <div class="post-likes-container">
                    <span>${postLikes}</span>
                    <span>${postLikes === 1 ? 'heart' : 'hearts'}</span>
                </div>
                <div class="user-options">
                    <i class="bi bi-chat"></i>
                    <i class="bi bi-heart"></i>
                </div>
            </footer>
        `;

        postDiv.innerHTML = postHeader + postContentDiv + postFooter;
        dashboardContentContainer.appendChild(postDiv);
    }
}

async function fetchPostAmountOfLikes(postId) {
    const formData = new FormData();
    formData.append("postId", postId);

    fetch('../../utils/likes/get_post_likes.php', {
        method: 'POST',
        body: formData,
    })
        .then( res => res.json())
        .then(data => {
            if (data.success) {
                return data.data;
            } else {
                return 0;
            }
        })
        .catch(err => console.log(err));

    return 0;
}