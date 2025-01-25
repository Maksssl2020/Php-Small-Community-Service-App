const addTextPostButton = document.getElementById("addTextPostButton");
const addImagePostButton = document.getElementById("addImagePostButton");
const addNewPostModal = document.getElementById("addNewPostModal");
const addNewPostModalCloseButton = document.getElementById("addNewPostModalCloseButton");

const addPostModalFormContainer = document.getElementById("addPostModalFormContainer");

const selectLabel = document.getElementById("selectLabel");
const selectOptionsContainer = document.getElementById("selectOptionsContainer");
const selectOptions = document.getElementById("selectOptions");
const tagsFilter = document.getElementById("tagsFilter");
const addedTagsContainer = document.getElementById("addedTagsContainer");

let availableTags = [];


const addNewPostButton = document.getElementById("addNewPostButton");
const addQuotePostButton = document.getElementById("addQuotePostButton");
const addLinkPostButton = document.getElementById("addLinkPostButton");

selectLabel.onclick = () => {
    if (selectOptionsContainer.style.display === "none") {
        selectOptionsContainer.style.display = "flex";
    } else {
        selectOptionsContainer.style.display = "none";
    }
}

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

addQuotePostButton.onclick = () => {
    postOptionsModal.style.display = "none";
    addNewPostModal.style.display = "block";

    generateAddQuotePostModal();
    fetchAllTags();

    addNewPostButton.onclick = (e) => {
        addNewQuotePost(e);
    }
}

addLinkPostButton.onclick = () => {
    postOptionsModal.style.display = "none";
    addNewPostModal.style.display = "block";

    generateAddLinkPostModal();
    fetchAllTags();

    addNewPostButton.onclick = (e) => {
        addNewLinkPost(e);
    }
}

if (addNewPostModalCloseButton) {
    addNewPostModalCloseButton.onclick = () => {
        addNewPostModal.style.display = "none";
        addPostModalFormContainer.innerHTML = '';
    }
}
tagsFilter.addEventListener('keyup', (e) => {
    const filterValue = e.target.value.toLowerCase();
    const filteredTags = availableTags.filter(tag => tag.name.toLowerCase().includes(filterValue));

    populateTagSelect(filteredTags.slice(0, 8));
    focus();
})

tagsFilter.addEventListener('keypress', (e) => {
    const inputValue = e.target.value.trim();

    if (e.key === "Enter" && availableTags.every(tag => tag.name.toLowerCase() !== inputValue.toLowerCase()) ) {
        e.preventDefault();

       if (inputValue) {
           addNewUserTag(inputValue);
           tagsFilter.value = '';
       }
    }
})

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
                <input autocomplete="off" id="photoLinkInput" type="url" placeholder="Enter photo URL and press ENTER :)"/>
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

function generateAddQuotePostModal() {
    const addQuotePostForm = `
        <textarea id="quoteTextarea" name="postContent" class="post-quote-textarea" spellcheck="false" placeholder="Something that someone once told someone..."></textarea>
    `

    addPostModalFormContainer.innerHTML += addQuotePostForm;

    const quoteTextarea = document.getElementById("quoteTextarea");
    quoteTextarea.addEventListener("input", autoResize);
    autoResize.call(quoteTextarea);

    quoteTextarea.addEventListener('change', () => {
        validateQuotePostForm();
    })
}

function generateAddLinkPostModal() {
    const addLinkPostForm = `
              <ul id="addedLinksList" class="added-links-list"></ul>
              <div class="add-photo-url-container">
                <input autocomplete="off" id="siteLinkInput" type="url" placeholder="Enter site URL and press ENTER :)"/>
                <label>You could add max 5 links of sites!</label>
              </div>
              <textarea id="textPostContent" name="postContent" class="text-post-content-input" placeholder="Common, enter something :)"></textarea>
    `

    addPostModalFormContainer.innerHTML += addLinkPostForm;

    const linkInput = document.getElementById("siteLinkInput");
    const addedLinksList = document.getElementById("addedLinksList");

    linkInput.addEventListener("keypress", async (event) => {
        let url = event.target.value.trim();
        if (event.key === "Enter" && url !== '') {
            event.preventDefault();
            await addSiteUrlToTheList(url, addedLinksList)
            linkInput.value = "";
        }
    })

    const observer = new MutationObserver(() => {
        validateLinkPostForm();
    })

    observer.observe(addedLinksList, {childList: true});
}

async function addSiteUrlToTheList(url, addedLinksList) {
    if (addedLinksList.children.length > 5) {
        showToast("You can only add up to 5 sites links!", 'error')
        return;
    }

    const siteData = await fetchSiteData(url);
    await createSiteViewCard(url, siteData, addedLinksList);
}

async function createSiteViewCard(url, data, container) {
    const listItem = await createSiteCard(url, data);

    const deleteIcon = document.createElement('i');
    deleteIcon.classList.add('bi');
    deleteIcon.classList.add('bi-x');
    deleteIcon.classList.add('post-item-delete-icon');
    deleteIcon.addEventListener('click', () => {
        container.removeChild(listItem);
    })

    container.appendChild(listItem);
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

                const popularTags = availableTags.slice(0, 8);
                populateTagSelect(popularTags);
            } else {
                console.log("Error: No tags found.");
            }
        })
        .catch(err => console.log(err));
}

function populateTagSelect(tags) {
    selectOptions.innerHTML = "";

    tags.forEach(tag => {
        const selectOptionDiv = document.createElement("div");
        selectOptionDiv.classList.add("select-option");

        const selectOptionInput = document.createElement("input");
        selectOptionInput.type = 'radio';
        selectOptionInput.id = tag.name;
        selectOptionInput.name = tag.name;

        const selectOptionLabel = document.createElement("label");
        selectOptionLabel.for = tag.name;
        selectOptionLabel.innerText = tag.name;

        selectOptionDiv.addEventListener('click', () => {
            addTag(tag.name);
        })

        selectOptionDiv.append(selectOptionInput, selectOptionLabel);
        selectOptions.appendChild(selectOptionDiv);
    });
}

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
    const remainingTags = availableTags.slice(0, 8);
    populateTagSelect(remainingTags);
}

function removeTag(tagName, tagElement) {
    addedTagsContainer.removeChild(tagElement);
    availableTags.push({name: tagName});
    chosenTags = chosenTags.filter((tag) => tag.name !== tagName);
    populateTagSelect(availableTags.slice(0, 8));
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
    addNewPostButton.disabled = !isImageListValid;
}

function validateQuotePostForm() {
    const isQuoteTextareaValid = document.getElementById("quoteTextarea").value.length > 0;
    addNewPostButton.disabled = !isQuoteTextareaValid;
}

function validateLinkPostForm() {
    const isLinkListValid = document.getElementById("addedLinksList").children.length > 0;
    addNewPostButton.disabled = !isLinkListValid;
}

function addNewTextPost(event) {
    event.preventDefault();

    const formData = new FormData(addPostModalFormContainer);
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
                resetFormData();
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

    const formData = new FormData(addPostModalFormContainer);
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
                showToast(data.message, "success");
                addedLinksList.innerHTML = "";
                resetFormData();
            } else {
                showToast("Failed to add a new post!", "error");
            }
        })
        .catch(err => console.log(err));
}

function addNewQuotePost(event) {
    event.preventDefault();

    const formData = new FormData(addPostModalFormContainer);
    formData.append('postType', 'quote');
    formData.append('postTags', JSON.stringify(chosenTags));

    fetch('../../utils/posts/add_new_post.php', {
        method: 'POST',
        body: formData,
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                showToast(data.message, "success");
                resetFormData();
            }
        })
        .catch(err => console.log(err));
}

function addNewLinkPost(event) {
    event.preventDefault();

    const addedLinksList = document.getElementById("addedLinksList");
    const links = Array.from(addedLinksList.children).map(item => item.id);

    const formData = new FormData(addPostModalFormContainer);
    formData.append('postType', 'link');
    formData.append('postTags', JSON.stringify(chosenTags));
    formData.append('postLinks', JSON.stringify(links));

    fetch('../../utils/posts/add_new_post.php', {
        method: 'POST',
        body: formData,
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                showToast(data.message, "success");
                addedLinksList.innerHTML = "";
                resetFormData();
            }
        })
        .catch(err => console.log(err));
}

function resetFormData() {
    addPostModalFormContainer.reset();
    chosenTags = [];
    addedTagsContainer.innerHTML = "";
    fetchAllTags();
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