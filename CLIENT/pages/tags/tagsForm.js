import {addNewTag, fetchMainTags} from "./tagsFormApiFunctions.js";

export const addTagForm = document.getElementById('addTagForm');
export const tagNameInput = document.getElementById('tagName');
export const tagCoverUrlInput = document.getElementById('tagCoverUrl');
export const previewImage = document.getElementById('previewImage');
export const addNewTagSubmitButton = document.getElementById('addNewTagSubmitButton');
export const cancelButton = document.getElementById('cancel');
export const isMainTagCheckbox = document.getElementById('isMainTag');
export const subTag = document.getElementById('subTag');

cancelButton.addEventListener('click', () => {
    window.location.href = "../start/start.php";
})

isMainTagCheckbox.addEventListener('change', () => {
    validateTagForm()
})

tagNameInput.addEventListener('blur', () => {
    validateTagForm();
})

tagCoverUrlInput.addEventListener('change', (event) => {
    if (event.target.value.trim() !== '') {
        previewImage.src = event.target.value;
        previewImage.style.visibility = 'visible';
    } else {
        previewImage.style.visibility = 'hidden';
    }

    validateTagForm();
})

function validateTagForm() {
    const isMain = isMainTagCheckbox.checked;

    if (isMain) {
        const isTagNameValid = tagNameInput.value.trim().length > 0;
        const isTagFileValid = tagCoverUrlInput.value.length > 0;

        addNewTagSubmitButton.disabled = !(isTagNameValid && isTagFileValid);
    } else {
        const isTagNameValid = tagNameInput.value.trim().length > 0;
        addNewTagSubmitButton.disabled = !(isTagNameValid);
    }
}

addTagForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    await addNewTag();
})
