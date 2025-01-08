const createPostButton = document.getElementById("createPostButton");
const postOptionsModal = document.getElementById("postOptionsContainer");
const addTextButton = document.getElementById("addTextButton");
const addTextModal = document.getElementById("addTextModal");
const addTextModalCloseButton  = document.getElementById("addTextModalCloseButton");

const addedTagsContainer = document.getElementById("addedTagsContainer");
const tagInput = document.getElementById("tagInput");
const tagSelect = document.getElementById("tagSelect");
let availableTags = [];

const textPostTitleInput = document.getElementById("textPostTitle");
const textPostContentInput = document.getElementById("textPostContent");
const addTextPostButton = document.getElementById("addTextPostButton");
const addTextPostForm = document.getElementById("addTextPostForm");

const dashboardContentContainer = document.getElementById("dashboardContentContainer");
const myPostsSelector = document.getElementById("myPostsTopicItem");

const postTextAreas = document.querySelectorAll(".post-text");

let chosenTags = [];

createPostButton.onclick = () => {
    postOptionsModal.style.display = "block";
}

addTextButton.onclick = () => {
    postOptionsModal.style.display = "none";
    addTextModal.style.display = "block";

    fetchUserPosts();
    fetchAllTags();
}

if (addTextModalCloseButton) {
    addTextModalCloseButton.onclick = () => {
        addTextModal.style.display = "none";
    }
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

        const postDiv = document.createElement('div');
        postDiv.classList.add("dashboard-post-card");

        const postHeader = document.createElement("header");
        postHeader.classList.add("post-header");

        const headerImage = document.createElement("img");
        headerImage.classList.add("post-author-image");
        headerImage.src = '../../assets/ghost_icon.jpeg';
        headerImage.alt = 'user_icon';

        const headerPostDataDiv = document.createElement("div");
        headerPostDataDiv.classList.add("post-data-container");

        const postAuthorNicknameP = document.createElement("p");
        postAuthorNicknameP.style.color = "var(--custom-white-color-100)";
        postAuthorNicknameP.textContent = userId;

        const postCreationDateP = document.createElement("p");
        postCreationDateP.textContent = new Date(createdAt.date).toLocaleDateString('pl-PL');

        headerPostDataDiv.append(postAuthorNicknameP);
        headerPostDataDiv.append(postCreationDateP);

        postHeader.appendChild(headerImage);
        postHeader.appendChild(headerPostDataDiv);

        const postContentDiv = document.createElement("div");
        postContentDiv.classList.add("post-content");

        const postTitleH3 = document.createElement("h3");
        postTitleH3.classList.add("post-title");
        postTitleH3.textContent = postTitle;

        const postTextArea = document.createElement("textarea");
        postTextArea.classList.add("post-text");
        postTextArea.spellcheck = false;
        postTextArea.isContentEditable = false;
        postTextArea.textContent = postContent;

        const postTagsDiv = document.createElement("div");
        postTagsDiv.classList.add("post-tags");

        if (tags) {
            tags.forEach(tag => {
                const tagSpan = document.createElement("span");
                tagSpan.textContent = `#${tag.name}`;
                postTagsDiv.appendChild(tagSpan);
            })
        }

        postContentDiv.appendChild(postTitleH3);
        postContentDiv.appendChild(postTextArea);
        postContentDiv.appendChild(postTagsDiv);

        const postFooter = document.createElement('footer');
        postFooter.classList.add("post-footer");

        const postLikesDiv = document.createElement("div");
        postLikesDiv.classList.add("post-likes-container");

        const postLikes = await fetchPostAmountOfLikes(id);

        const postLikesAmountSpan = document.createElement("span");
        postLikesAmountSpan.classList.add("post-likes-amount");
        postLikesAmountSpan.textContent = `${postLikes}`;

        const nameOfLikesSpan = document.createElement("span");
        nameOfLikesSpan.classList.add("post-name-of-likes");
        nameOfLikesSpan.textContent = postLikes === 1 ? 'heart' : 'hearts';

        postLikesDiv.appendChild(postLikesAmountSpan);
        postLikesDiv.appendChild(nameOfLikesSpan);

        const postUserOptionsDiv = document.createElement("div");
        postUserOptionsDiv.classList.add("user-options");

        const chatIcon = document.createElement("i");
        chatIcon.classList.add("bi");
        chatIcon.classList.add("bi-chat");

        const heartIcon = document.createElement("i");
        heartIcon.classList.add("bi");
        heartIcon.classList.add("bi-heart");

        postUserOptionsDiv.appendChild(chatIcon);
        postUserOptionsDiv.appendChild(heartIcon);

        postFooter.appendChild(postLikesDiv);
        postFooter.appendChild(postUserOptionsDiv);

        postDiv.appendChild(postHeader);
        postDiv.appendChild(postContentDiv);
        postDiv.appendChild(postFooter);

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

function fetchAllTags() {
    fetch('../../utils/tags/get_all_tags.php')
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                availableTags = [];
                data.data.forEach((tag) => {
                    availableTags.push(tag);
                })

                populateTagSelect();
            } else {
                console.log("Error: No tags found.");
            }
        })
        .catch(err => console.log(err));
}

function populateTagSelect() {
    tagSelect.innerHTML = "";
    availableTags.forEach(tag => {
        const option = document.createElement("option");
        option.value = tag.name;
        option.textContent = tag.name;

        tagSelect.appendChild(option);
    });
}

tagSelect.addEventListener("change", () => {
    const selectedTag = tagSelect.value;
    if (selectedTag) {
        addTag(selectedTag);
        tagSelect.selectedIndex = -1;
    }
})

function addTag(tagName) {
    const tagCardDiv = document.createElement("div");
    tagCardDiv.classList.add("tag-card");

    const tagCardP = document.createElement("p");
    tagCardP.textContent = `#${tagName}`;

    const tagCardIcon = document.createElement("i");
    tagCardIcon.classList.add("bi");
    tagCardIcon.classList.add("bi-x");

    tagCardIcon.addEventListener("click", () => {
        removeTag(tagName, tagCardDiv);
    })

    tagCardDiv.appendChild(tagCardP);
    tagCardDiv.appendChild(tagCardIcon);

    addedTagsContainer.appendChild(tagCardDiv);
    chosenTags.push(tagName);
    availableTags = availableTags.filter((tag) => tag.name !== tagName);
    populateTagSelect();
}

function removeTag(tagName, tagElement) {
    addedTagsContainer.removeChild(tagElement);
    availableTags.push({name: tagName});
    chosenTags = chosenTags.filter((tag) => tag.name !== tagName);
    populateTagSelect();
}

function addNewUserTag(tagName) {
    const formData = new FormData();
    formData.append("tagName", tagName);
    formData.append("isMainTag", String(false));

    fetch('../../utils/tags/add_new_tag.php', {
        method: 'POST',
        body: formData,
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                addTag(tagName);
            } else {
                showToast("Failed to add a new tag.", "error");
            }
        })
        .catch(err => console.log(err));
}

textPostTitleInput.addEventListener("change", () => {
    validateTextPostForm();
})

textPostContentInput.addEventListener("change", () => {
    validateTextPostForm();
})

function validateTextPostForm() {
    const isTextPostTitleValid = textPostTitleInput.value.length > 0;
    const isTextPostContentValid = textPostContentInput.value.length > 0;

    addTextPostButton.disabled = !(isTextPostTitleValid && isTextPostContentValid);
}

addTextPostButton.onclick = (e) => {
    addNewTextPost(e);
}

function addNewTextPost(event) {
    event.preventDefault();

    const formData = new FormData(addTextPostForm);
    formData.append('postType', 'text');
    formData.append('postTags', JSON.stringify(chosenTags));

    fetch('../../utils/posts/add_new_post.php', {
        method: 'POST',
        body: formData,
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                showToast(data.message, "success");
                addTextPostForm.reset();
                chosenTags = [];
                addedTagsContainer.innerHTML = "";
                fetchAllTags();
            } else {
                showToast("Failed to add a new post!", "error");
            }
        })
        .catch(err => console.log(err));
}

window.onclick = (event) => {
    if (event.target === postOptionsModal) {
        postOptionsModal.style.display = 'none';
    }

    if (event.target === addTextModal) {
        addTextModal.style.display = 'none';
    }
}