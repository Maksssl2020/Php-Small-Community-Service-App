const addTextPostButton = document.getElementById("addTextPostButton");
const addImagePostButton = document.getElementById("addImagePostButton");
const addNewPostModal = document.getElementById("addNewPostModal");
const addTextModalCloseButton = document.getElementById("addTextModalCloseButton");

const addPostModalFormContainer = document.getElementById("addPostModalFormContainer");

const addedTagsContainer = document.getElementById("addedTagsContainer");
const tagInput = document.getElementById("tagInput");
const tagSelect = document.getElementById("tagSelect");
let availableTags = [];


const addNewPostButton = document.getElementById("addNewPostButton");
const addTextPostForm = document.getElementById("addTextPostForm");

addTextPostButton.onclick = () => {
    postOptionsModal.style.display = "none";
    addNewPostModal.style.display = "block";

    generateAddTextPostModal();
    fetchAllTags();

    addNewPostButton.onclick = (e) => {
        addNewTextPost(e);
    }
}

addImagePostButton.onclick = () => {
    postOptionsModal.style.display = "none";
    addNewPostModal.style.display = "block";

    generateAddImagePostModal();
    fetchAllTags();

    addNewPostButton.onclick = (e) => {
        addNewImagePost(e);
    }
}

if (addTextModalCloseButton) {
    addTextModalCloseButton.onclick = () => {
        addNewPostModal.style.display = "none";
        addPostModalFormContainer.innerHTML = '';
    }
}

function generateAddTextPostModal() {
    const addTextPostForm = `
        <input id="textPostTitle" name="postTitle" class="text-post-title-input" placeholder="Title"/>
        <textarea id="textPostContent" name="postContent" class="text-post-content-input" placeholder="Common, enter something :)"></textarea>
    `;

    addPostModalFormContainer.innerHTML += addTextPostForm;

    const textPostContentInput = document.getElementById("textPostContent");
    const textPostTitleInput = document.getElementById("textPostTitle");

    textPostTitleInput.addEventListener("change", () => {
        validateTextPostForm();
    })

    textPostContentInput.addEventListener("change", () => {
        validateTextPostForm();
    })
}

function generateAddImagePostModal() {
    const addImagePostForm = `
              <ul id="addedLinksList" class="added-links-list"></ul>
              <div class="add-photo-url-container">
                <input id="photoLinkInput" type="url" placeholder="Enter photo URL and press ENTER :)"/>
                <label>You could add max 5 links of photos!</label>
              </div>
              <textarea id="textPostContent" name="postContent" class="text-post-content-input" placeholder="Common, enter something :)"></textarea>
    `

    addPostModalFormContainer.innerHTML += addImagePostForm;

    const photoLinkInput = document.getElementById("photoLinkInput");
    const addedLinksList = document.getElementById("addedLinksList");

    photoLinkInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            addPhotoUrlToTheList(event.target.value.trim(), addedLinksList);
            photoLinkInput.value = "";
        }
    })

    const observer = new MutationObserver(() => {
        validateImagePostForm();
    })

    observer.observe(addedLinksList, {childList: true});
}

function addPhotoUrlToTheList(url, addedLinksList) {
    if (addedLinksList.children.length > 5) {
        showToast("You can only add up to 5 photo links!", 'error')
        return;
    }

    const urlListItem = document.createElement("li");
    const imageItemContainer = document.createElement("div");
    imageItemContainer.classList.add("image-item-container");

    const deleteIcon = document.createElement("i");
    deleteIcon.classList.add("bi");
    deleteIcon.classList.add("bi-x");

    deleteIcon.addEventListener("click", () => {
        addedLinksList.removeChild(urlListItem);
    })

    const imgItem = document.createElement("img");
    imgItem.src = url;
    imgItem.alt = "Image Preview";

    imageItemContainer.append(imgItem, deleteIcon);
    urlListItem.id = url;
    urlListItem.append(imageItemContainer);
    addedLinksList.append(urlListItem);
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

function validateTextPostForm() {
    const isTextPostTitleValid = document.getElementById("textPostTitle").value.length > 0;
    const isTextPostContentValid = document.getElementById("textPostContent").value.length > 0;

    addNewPostButton.disabled = !(isTextPostTitleValid && isTextPostContentValid);
}

function validateImagePostForm() {
    const isImageListValid = document.getElementById("addedLinksList").children.length > 0;

    console.log(isImageListValid);

    addNewPostButton.disabled = !isImageListValid;
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

function addNewImagePost(event) {
    event.preventDefault();

    const addedLinksList = document.getElementById("addedLinksList");
    const imageLinks = Array.from(addedLinksList.children).map(item => item.id);

    const formData = new FormData();
    formData.append('postType', 'image');
    formData.append('postTags', JSON.stringify(chosenTags));
    formData.append('postImagesLinks', JSON.stringify(imageLinks));

    fetch('../../utils/posts/add_new_post.php', {
        method: 'POST',
        body: formData,
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                showToast('SUCCESSFULL!', "success");
            } else {
                showToast("Failed to add a new post!", "error");
            }
        })
        .catch(err => console.log(err));
}

window.onclick = (event) => {
    if (postOptionsModal && event.target === postOptionsModal) {
        postOptionsModal.style.display = 'none';
    }

    if (event.target === addNewPostModal) {
        addNewPostModal.style.display = 'none';
        addPostModalFormContainer.innerHTML = '';
    }
}