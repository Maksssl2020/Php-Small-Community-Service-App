const createPostButton = document.getElementById("createPostButton");
const postOptionsModal = document.getElementById("postOptionsContainer");
const addTextButton = document.getElementById("addTextButton");
const addTextModal = document.getElementById("addTextModal");

const addedTagsContainer = document.getElementById("addedTagsContainer");
const tagInput = document.getElementById("tagInput");
const tagSelect = document.getElementById("tagSelect");
let availableTags = [];

createPostButton.onclick = () => {
    postOptionsModal.style.display = "block";
}

addTextButton.onclick = () => {
    postOptionsModal.style.display = "none";
    addTextModal.style.display = "block";

    fetchAllTags();
}

tagInput.addEventListener('keypress', (e) => {
    if (e.key === "Enter" && tagInput.value.trim() !== "") {
        addNewUserTag(tagInput.value.trim());
        tagInput.value = "";
    }
})

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

    availableTags = availableTags.filter((tag) => tag.name !== tagName);
    populateTagSelect();
}

function removeTag(tagName, tagElement) {
    addedTagsContainer.removeChild(tagElement);
    availableTags.push({name: tagName});
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

window.onclick = (event) => {
    if (event.target === postOptionsModal) {
        postOptionsModal.style.display = 'none';
    }

    if (event.target === addTextModal) {
        addTextModal.style.display = 'none';
    }
}