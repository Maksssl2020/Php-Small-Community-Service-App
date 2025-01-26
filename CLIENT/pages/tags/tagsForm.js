const addTagForm = document.getElementById('addTagForm');
const tagNameInput = document.getElementById('tagName');
const tagCoverUrlInput = document.getElementById('tagCoverUrl');
const previewImage = document.getElementById('previewImage');
const addNewTagSubmitButton = document.getElementById('addNewTagSubmitButton');
const cancelButton = document.getElementById('cancel');
const isMainTagCheckbox = document.getElementById('isMainTag');
const subtagSelect = document.getElementById('subtagSelect');
const subTag = document.getElementById('subTag');

cancelButton.addEventListener('click', () => {
    window.location.href = "../start/start.php";
})

tagNameInput.addEventListener('blur', () => {
    validateTagForm();
})

isMainTagCheckbox.addEventListener('change', async (event) => {
    if (event.target.checked) {
        subtagSelect.style.visibility = 'hidden';
    } else {
        subtagSelect.style.visibility = 'visible';
        await fetchMainTags();
    }
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
    const isTagNameValid = tagNameInput.value.trim().length > 0;
    const isTagFileValid = tagCoverUrlInput.value.length > 0;

    addNewTagSubmitButton.disabled = !(isTagNameValid && isTagFileValid);
}

addTagForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    await addNewTag();
})
