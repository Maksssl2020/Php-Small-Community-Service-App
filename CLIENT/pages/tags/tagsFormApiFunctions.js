import {showToast} from "../../../indexUtils.js";
import {addTagForm, isMainTagCheckbox, previewImage, subTag} from "./tagsForm.js";

export async function fetchMainTags() {
    fetch('http://localhost/php-small-social-service-app/tags/get-main-tags', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
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

export async function addNewTag() {
    let formData = new FormData(addTagForm);
    const isMainTag = isMainTagCheckbox.checked;
    console.log(isMainTag);

    fetch('http://localhost/php-small-social-service-app/tags/add-new-tag-by-admin', {
        method: 'POST',
        body: JSON.stringify({
            tagName: formData.get('tagName'),
            isMainTag: isMainTag,
            tagCoverUrl: formData.get('tagCoverUrl'),
        }),
        headers: {
            "Content-Type": "application/json",
        }
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
}