async function fetchMainTags() {
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

async function addNewTag() {
    let formData = new FormData(addTagForm);

    fetch('http://localhost/php-small-social-service-app/tags/add-new-tag-by-admin', {
        method: 'POST',
        body: JSON.stringify({
            tagName: formData.get('tagName'),
            isMainTag: isMainTagCheckbox.checked,
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
                subtagSelect.style.visibility = 'hidden';
                previewImage.src = '';
            } else {
                data.errors.forEach((error) => showToast(error));
            }
        }).catch(error => {
        console.log(error)
        showToast('Something went wrong. Please try again later.', 'error')
    })
}