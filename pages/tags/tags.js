const addTagForm = document.getElementById('addTagForm');
const tagNameInput = document.getElementById('tagName');
const tagFileInput = document.getElementById('tagFile');
const previewImage = document.getElementById('previewImage');
const addNewTagSubmitButton = document.getElementById('addNewTagSubmitButton');
const cancelButton = document.getElementById('cancel');

cancelButton.addEventListener('click', () => {
    window.location.href = "../start/start.php";
})

tagNameInput.addEventListener('blur', () => {
    validateTagForm();
})

tagFileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];

    if (file) {
        const reader = new FileReader();

        reader.onload = (e) => {
            previewImage.src = e.target.result;
            previewImage.style.visibility = 'visible';
        }

        reader.readAsDataURL(file);
        validateTagForm();
    } else {
        previewImage.style.visibility = 'hidden';
    }
});

function validateTagForm() {
    const isTagNameValid = tagNameInput.value.trim().length > 0;
    const isTagFileValid = tagFileInput.value.length > 0;

    addNewTagSubmitButton.disabled = !(isTagNameValid && isTagFileValid);
}


addTagForm.addEventListener('submit', (event) => {
    event.preventDefault();

    let formData = new FormData(addTagForm);

    console.log('BEFORE FETCHING');

    fetch('../../utils/add-new-tag/add_new_tag.php', {
        method: 'POST',
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showToast(data.message, 'success');
            addTagForm.reset();
            previewImage.style.visibility = 'hidden';
            previewImage.src = '';
        } else {
            data.errors.forEach((error) => showToast(error));
        }
    }).catch(error => {
        console.log(error)
        showToast('Something went wrong. Please try again later.', 'error')
    })
})
