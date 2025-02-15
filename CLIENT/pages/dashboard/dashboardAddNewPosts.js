import {
    addNewImagePost,
    addNewLinkPost,
    addNewQuotePost,
    addNewTextPost,
    addNewUserTag, fetchAllTags, updatePostData,
} from "./dashboardApiFunctions.js";
import { postOptionsModal} from "./dashboard.js";
import {autoResize, fetchSiteData, fetchUserData, getSignedInUserData} from "../../../indexApiFunctions.js";
import {getUserAvatar, showToast} from "../../../indexUtils.js";
import {createSiteCard} from "../../../index.js";
import {arraysEqual} from "./dashboardUtils.js";

const addTextPostButton = document.getElementById("addTextPostButton");
const addImagePostButton = document.getElementById("addImagePostButton");
export const addNewPostModal = document.getElementById("addNewPostModal");
export const addNewPostModalCloseButton = document.getElementById("addNewPostModalCloseButton");

export const addPostModalFormContainer = document.getElementById("addPostModalFormContainer");

const selectLabel = document.getElementById("selectLabel");
const selectOptionsContainer = document.getElementById("selectOptionsContainer");
const selectOptions = document.getElementById("selectOptions");
const tagsFilter = document.getElementById("tagsFilter");
const addedTagsContainer = document.getElementById("addedTagsContainer");

export let availableTags = [];
export let chosenTags = [];


const addNewPostButton = document.getElementById("addNewPostButton");
const addQuotePostButton = document.getElementById("addQuotePostButton");
const addLinkPostButton = document.getElementById("addLinkPostButton");

if (selectLabel) {
    selectLabel.onclick = () => {
        if (selectOptionsContainer.style.display === "none") {
            selectOptionsContainer.style.display = "flex";
        } else {
            selectOptionsContainer.style.display = "none";
        }
    }
}

if (addTextPostButton) {
    addTextPostButton.onclick =  async () => {
        postOptionsModal.style.display = "none";
        addNewPostModal.style.display = "block";
        await setUserDataIntoAddPostModal();
        await generateAddTextPostModal();
        await populateTagSelect([]);

        addNewPostButton.onclick = async (e) => {
            await addNewTextPost(e);
        }
    }
}

if (addImagePostButton) {
    addImagePostButton.onclick = async () => {
        postOptionsModal.style.display = "none";
        addNewPostModal.style.display = "block";
        await setUserDataIntoAddPostModal();
        await generateAddImagePostModal();
        await populateTagSelect([]);

        addNewPostButton.onclick = async (e) => {
            await addNewImagePost(e);
        }
    }
}

if (addQuotePostButton) {
    addQuotePostButton.onclick = async () => {
        postOptionsModal.style.display = "none";
        addNewPostModal.style.display = "block";
        await setUserDataIntoAddPostModal();
        await generateAddQuotePostModal();
        await populateTagSelect([]);

        addNewPostButton.onclick = (e) => {
            addNewQuotePost(e);
        }
    }
}

if (addLinkPostButton) {
    addLinkPostButton.onclick = async () => {
        postOptionsModal.style.display = "none";
        addNewPostModal.style.display = "block";
        await setUserDataIntoAddPostModal();
        await generateAddLinkPostModal();
        await populateTagSelect([]);

        addNewPostButton.onclick = (e) => {
            addNewLinkPost(e);
        }
    }
}

if (addNewPostModalCloseButton) {
    addNewPostModalCloseButton.onclick = () => {
        addNewPostModal.style.display = "none";
        addPostModalFormContainer.innerHTML = '';
    }
}
if (tagsFilter) {
    tagsFilter.addEventListener('keyup', async (e) => {
        const filterValue = e.target.value.toLowerCase();
        const filteredTags = availableTags.filter(tag => tag.name.toLowerCase().includes(filterValue));

        await populateTagSelect(filteredTags.slice(0, 8), true);
        focus();
    })
}

if (tagsFilter) {
    tagsFilter.addEventListener('keypress', async (e) => {
        const inputValue = e.target.value.trim();

        if (e.key === "Enter" &&
            availableTags.every(tag => tag.name.toLowerCase() !== inputValue.toLowerCase()) &&
            chosenTags.every(tag => tag.toLowerCase() !== inputValue.toLowerCase())) {
            e.preventDefault();

            if (inputValue) {
                await addNewUserTag(inputValue);
                tagsFilter.value = '';
            }
        }
    })
}

export async function editPostData(postData, postType, postId) {
    addNewPostModal.style.display = "block";
    await setUserDataIntoAddPostModal();
    await populateTagSelect([]);

    addNewPostButton.onclick = null;

    if (postType === "text") {
        await generateAddTextPostModal(postData, true);
        addNewPostButton.onclick = async () => {
            const formData = new FormData(addPostModalFormContainer);
            await updatePostData(postId, {
                postType: "text",
                title: formData.get('postTitle'),
                content: formData.get('postContent'),
                tags: chosenTags ? chosenTags : null
            });
        }
    } else if (postType === "image") {
        await generateAddImagePostModal(postData, true);
        addNewPostButton.onclick = async () => {
            const formData = new FormData(addPostModalFormContainer);
            const addedLinksList = document.getElementById("addedLinksList");
            const imagesLinks = Array.from(addedLinksList.children).map(item => item.id);

            await updatePostData(postId, {
                postType: "image",
                content: formData.get('postContent'),
                imagesLinks: imagesLinks,
                tags: chosenTags ? chosenTags : null
            })
        }
    } else if (postType === "quote") {
        await generateAddQuotePostModal(postData, true);
        addNewPostButton.onclick = async () => {
            const formData = new FormData(addPostModalFormContainer);

            await updatePostData(postId, {
                postType: "quote",
                content: formData.get('postContent'),
                tags: chosenTags ? chosenTags : null
            })
        }
    } else if (postType === "link") {
        await generateAddLinkPostModal(postData, true);
        addNewPostButton.onclick = async () => {
            const addedLinksList = document.getElementById("addedLinksList");
            const links = Array.from(addedLinksList.children).map(item => item.id);
            const formData = new FormData(addPostModalFormContainer);

            await updatePostData(postId, {
                postType: "link",
                content: formData.get('postContent'),
                links: links,
                tags: chosenTags ? chosenTags : null
            })
        }
    }
}

async function setUserDataIntoAddPostModal() {
    const {userId} = await getSignedInUserData();
    const {userNickname, avatarUrl, avatarImage} = await fetchUserData(userId)
    const userAvatarImg = document.getElementById("addNewPostModalUserAvatar");
    const userNicknameP = document.getElementById("addNewPostModalUserNickname");

    const avatarSrc = getUserAvatar(avatarUrl, avatarImage);

    userNicknameP.textContent = `${userNickname}`;
    userAvatarImg.src = avatarSrc;
}

async function generateAddTextPostModal(postData = null, isEdit = false) {
    let postTitle, postContent, postTags = [];

    if (isEdit) {
        const { postContent: content, postTitle: title, tags} = postData;
        postTitle = title;
        postContent = content;

        if (tags) {
            for (const tag of tags) {
                postTags.push(tag.name);
                await addTag(tag.name);
            }
        }
    }

    const addTextPostForm = `
        <input value="${isEdit ? postTitle : ""}" spellcheck="false" autocomplete="off" id="textPostTitle" name="postTitle" class="text-post-title-input" placeholder="Title"/>
        <textarea spellcheck="false" autocomplete="off" id="textPostContent" name="postContent" class="text-post-content-input scrollbar" placeholder="Common, enter something :)">${isEdit ? postContent : ""}</textarea>
    `;

    addPostModalFormContainer.innerHTML += addTextPostForm;

    const textPostTitleInput = document.getElementById("textPostTitle");
    const textPostContentInput = document.getElementById("textPostContent");

    textPostContentInput.addEventListener("input", () => {
        validateTextPostForm();
    })

    if (isEdit) {
        const closeModalButton = document.getElementById("addNewPostModalCloseButton");
        closeModalButton.addEventListener("click", async () => {
            await resetFormData();
        })

        const observer = new MutationObserver(checkForChanges);
        observer.observe(addedTagsContainer, { childList: true, subtree: true });

        textPostTitleInput.addEventListener("input", checkForChanges)
        textPostContentInput.addEventListener("input", checkForChanges)
    }

    function checkForChanges() {
        const isTitleChanged = textPostTitleInput.value !== postTitle;
        const isContentChanged = textPostContentInput.value !== postContent;
        const isTagsChanged = !arraysEqual(postTags, chosenTags);

        addNewPostButton.disabled = !(isTitleChanged || isContentChanged || isTagsChanged);
    }
}


async function generateAddImagePostModal(postData = null, isEdit = false) {
    let currentPostImagesLinks = [];
    let postContent, postImages = [], postTags = [];

    if (isEdit) {
        const {postContent: content, tags, images} = postData;
        postContent = content;

        if (tags) {
            for (const tag of tags) {
                postTags.push(tag.name);
                await addTag(tag.name);
            }
        }

        if (images) {
            for (const image of images) {
                currentPostImagesLinks.push(image.url)
                postImages.push(image.url);
            }
        }
    }

    const addImagePostForm = `
              <ul id="addedLinksList" class="added-links-list"></ul>
              <div class="add-photo-url-container">
                <input spellcheck="false" autocomplete="off" id="photoLinkInput" type="url" placeholder="Enter photo URL and press ENTER :)"/>
                <label>You could add max 5 links of photos!</label>
              </div>
              <textarea spellcheck="false" autocomplete="off" id="textPostContent" name="postContent" class="text-post-content-input" placeholder="Common, enter something :)">${(isEdit && postContent !== null) ? postContent : ""}</textarea>
    `

    addPostModalFormContainer.innerHTML += addImagePostForm;

    const photoLinkInput = document.getElementById("photoLinkInput");
    const addedLinksList = document.getElementById("addedLinksList");
    const textPostContentInput = document.getElementById("textPostContent");

    if (postImages) {
        postImages.forEach(image => {
            addPhotoUrlToTheList(image, addedLinksList);
        })
    }

    photoLinkInput.addEventListener('keypress', (event) => {
        event.preventDefault();

        if (event.key === 'Enter' && event.target.value.trim().length > 5) {
            addPhotoUrlToTheList(event.target.value.trim(), addedLinksList);
            photoLinkInput.value = "";

            if (isEdit) {
                currentPostImagesLinks.push(event.target.value.trim());
            }
        }
    })

    const observer = new MutationObserver(validateImagePostForm)
    observer.observe(addedLinksList, {childList: true});

    if (isEdit) {
        const closeModalButton = document.getElementById("addNewPostModalCloseButton");

        closeModalButton.addEventListener("click", async () => {
            currentPostImagesLinks = [];
            await resetFormData();
        })

        const observer = new MutationObserver(checkForChanges);
        observer.observe(addedTagsContainer, { childList: true });
        photoLinkInput.addEventListener("change", checkForChanges)
        textPostContentInput.addEventListener("input", checkForChanges)
    }

    function checkForChanges() {
        const isContentChanged = textPostContentInput.value !== postContent;
        const isTagsChanged = !arraysEqual(postTags, chosenTags);
        const isImagesChanged = !arraysEqual(postImages, currentPostImagesLinks)

        addNewPostButton.disabled = !(isImagesChanged || isContentChanged || isTagsChanged);
    }
}

async function generateAddQuotePostModal(postData = null, isEdit = false) {
    let postQuote, postTags = [];

    if (isEdit) {
        const {postContent, tags} = postData;
        postQuote = postContent;

        if (tags) {
            for (const tag of tags) {
                postTags.push(tag.name);
                await addTag(tag.name);
            }
        }
    }

    console.log(postData)

    const addQuotePostForm = `
        <textarea spellcheck="false" autocomplete="off" id="quoteTextarea" name="postContent" class="post-quote-textarea" placeholder="Something that someone once told someone...">${isEdit ? postQuote : ""}</textarea>
    `

    addPostModalFormContainer.innerHTML += addQuotePostForm;

    const quoteTextarea = document.getElementById("quoteTextarea");
    quoteTextarea.addEventListener("input", autoResize);
    autoResize.call(quoteTextarea);

    quoteTextarea.addEventListener('change', () => {
        validateQuotePostForm();
    })

    if (isEdit) {
        const closeModalButton = document.getElementById("addNewPostModalCloseButton");
        closeModalButton.addEventListener("click", async () => {
            await resetFormData();
        })

        const observer = new MutationObserver(checkForChanges);
        observer.observe(addedTagsContainer, {childList: true});
        quoteTextarea.addEventListener("input", checkForChanges);
    }

    function checkForChanges() {
        const isContentChanged = quoteTextarea.value !== postQuote;
        const isTagsChanged = !arraysEqual(postTags, chosenTags);

        addNewPostButton.disabled = !(isContentChanged || isTagsChanged);
    }
}

async function generateAddLinkPostModal(postData = null, isEdit = false) {
    let currentPostSitesLinks = [];
    let content, postLinks = [], postTags = [];

    if (isEdit) {
        const {postContent, tags, postSitesLinks} = postData;

        content = postContent;

        if (tags) {
            for (const tag of tags) {
                postTags.push(tag.name);
                await addTag(tag.name);
            }
        }

        if (postSitesLinks) {
            for (const siteLink of postSitesLinks) {
                postLinks.push(siteLink);
                currentPostSitesLinks.push(siteLink);
            }
        }
    }

    const addLinkPostForm = `
              <ul id="addedLinksList" class="added-links-list"></ul>
              <div class="add-photo-url-container">
                <input spellcheck="false" autocomplete="off" id="siteLinkInput" type="url" placeholder="Enter site URL and press ENTER :)"/>
                <label>You could add max 5 links of sites!</label>
              </div>
              <textarea spellcheck="false" autocomplete="off" id="textPostContent" name="postContent" class="text-post-content-input" placeholder="Common, enter something :)">${isEdit && content !== null ? content : ""}</textarea>
    `

    addPostModalFormContainer.innerHTML += addLinkPostForm;

    const linkInput = document.getElementById("siteLinkInput");
    const addedLinksList = document.getElementById("addedLinksList");
    const textPostContentInput = document.getElementById("textPostContent");

    if (currentPostSitesLinks) {
        for (const siteLink of currentPostSitesLinks) {
            await addSiteUrlToTheList(siteLink, addedLinksList)
        }
    }

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

    if (isEdit) {
        const closeModalButton = document.getElementById("addNewPostModalCloseButton");
        closeModalButton.addEventListener("click", async () => {
            currentPostSitesLinks = [];
            await resetFormData();
        })

        const observer = new MutationObserver(checkForChanges);
        observer.observe(addedTagsContainer, {childList: true});
        textPostContentInput.addEventListener("input", checkForChanges);
        linkInput.addEventListener("change", checkForChanges);
    }

    function checkForChanges() {
        const isContentChanged = textPostContentInput.value !== content;
        const isTagsChanged = !arraysEqual(postTags, chosenTags);
        const isLinksChanged = !arraysEqual(postLinks, currentPostSitesLinks)

        addNewPostButton.disabled = !(isLinksChanged || isContentChanged || isTagsChanged);
    }
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

    listItem.appendChild(deleteIcon);
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
    deleteIcon.classList.add("post-item-delete-icon");

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

export async function populateTagSelect(tags = [], isFiltered = false) {
    let tagsToPopulate;

    if (tags.length === 0 && !isFiltered) {
        const foundTags = await fetchAllTags();
        availableTags = [];

        foundTags.forEach((tag) => {
            availableTags.push(tag);
        })

        tagsToPopulate = availableTags.slice(0, 8);
    } else {
        tagsToPopulate = tags;
    }

    selectOptions.innerHTML = "";

    tagsToPopulate.forEach(tag => {
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

export async function addTag(tagName) {
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
    await populateTagSelect(remainingTags);
}

async function removeTag(tagName, tagElement) {
    addedTagsContainer.removeChild(tagElement);
    chosenTags = chosenTags.filter((tag) => tag !== tagName);
    availableTags.push({name: tagName});
    await populateTagSelect(availableTags.slice(0, 8));
}

function validateTextPostForm() {
    const isTextPostContentValid = document.getElementById("textPostContent").value.length > 0;
    addNewPostButton.disabled = !(isTextPostContentValid);
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

export async function resetFormData() {
    addPostModalFormContainer.reset();
    chosenTags = [];
    addedTagsContainer.innerHTML = "";
    await populateTagSelect();
}

