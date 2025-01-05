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

isMainTagCheckbox.addEventListener('change', (event) => {
    if (event.target.checked) {
        subtagSelect.style.visibility = 'hidden';
    } else {
        subtagSelect.style.visibility = 'visible';
        fetchMainTags();
    }
})

function fetchMainTags() {
    fetch('../../utils/tags/get_main_tags.php')
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            data.data.forEach(tag => {
                const option = document.createElement('option');
                option.value = tag.name;
                option.textContent = tag.name;
                subTag.appendChild(option);
            })
        } else {
            console.log("Failed to fetch main tags!");
        }
    }).catch(err => console.log(err));
}

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


addTagForm.addEventListener('submit', (event) => {
    event.preventDefault();

    let formData = new FormData(addTagForm);
    formData.append('isMainTag', isMainTagCheckbox.checked);

    if (!isMainTagCheckbox.checked) {
        const subTagValue = subTag.value;
        formData.append('subTag', subTagValue);
        console.log(subTagValue);
    }

    fetch('../../utils/tags/add_new_tag.php', {
        method: 'POST',
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showToast(data.message, 'success');
            addTagForm.reset();
            previewImage.style.visibility = 'hidden';
            subtagSelect.style.visibility = 'hidden';
            previewImage.src = '';
        } else {
            data.errors.forEach((error) => showToast(error));
        }
    }).catch(error => {
        console.log(error)
        showToast('Something went wrong. Please try again later.', 'error')
    })
})
