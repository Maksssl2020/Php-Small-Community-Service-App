import {calcPeriodFromDate, fetchUserData, getSignedInUserData} from "../../../index.js";
import {updateUserData, uploadUserAvatar} from "./accountApiFunctions.js";

const userAvatarInput = document.getElementById('userAvatar');
const userEmailInput = document.getElementById('userEmail');
const userNicknameInput = document.getElementById('userNickname');
const userPasswordInput = document.getElementById('userPassword');
const createdAtDataLabel = document.getElementById('createdAtDataLabel');
const createdAtPeriodLabel = document.getElementById('createdAtPeriodLabel');
const uploadAvatarButton  = document.getElementById('uploadAvatarButton');
const uploadAvatarModal = document.getElementById('uploadAvatarModal');
const modalCloseButton  = document.getElementById('modalCloseButton');
const modalSubmitButton = document.getElementById('modalSubmitButton');
const avatarFileInput = document.getElementById('avatarFileInput');
const avatarUrlInput = document.getElementById('avatarUrlInput');
const avatarPreviewDisplay = document.getElementById('avatarPreviewDisplay');
const changeUserNicknameIcon = document.getElementById('changeUserNicknameIcon');
const changeUserEmailIcon = document.getElementById('changeUserEmailIcon');
const updateAccountButtons = document.getElementById('updateAccountButtons');
const cancelUpdateButton = document.getElementById('cancelUpdateButton');
const avatarFileDropArea = document.getElementById('avatarFileDropArea');

let initialUserData = {};

window.addEventListener('DOMContentLoaded', async () => {
    let userData;

    const {userId} = await getSignedInUserData();

    if (userId) {
        userData = await fetchUserData(userId);
        setInitialUserData(userData);

        await populatePageWithUserData(userData);
    } else {
        window.location.href = '../dashboard.php';
    }
})

async function populatePageWithUserData(userData) {
    const {id, userNickname, userEmail, avatarUrl, avatarImage, createdAt} = userData;

    userNicknameInput.value = userNickname;
    userEmailInput.value = userEmail;
    userPasswordInput.value = '1234567890';
    createdAtDataLabel.textContent = new Date(createdAt.date).toLocaleString('pl-PL');
    createdAtPeriodLabel.textContent = calcPeriodFromDate(createdAt.date);

    console.log(userData)

    if (avatarUrl) {
        userAvatarInput.src = avatarUrl;
    } else if (avatarImage) {
        userAvatarInput.src = `data:image/jpg;charset=utf-8;base64, ${avatarImage}`;
    } else {
        userAvatarInput.src = '../../assets/ghost_icon.jpeg';
    }
}

function setInitialUserData(userData) {
    initialUserData = {...userData};
}

function checkForUserDataChange() {
    const currentUserData = {
        userNickname: userNicknameInput.value.trim(),
        userEmail: userEmailInput.value.trim(),
    };

    const isChanged = Object.keys(currentUserData).some(key => {
            return initialUserData[key] !== currentUserData[key]
        }
    );

    updateAccountButtons.style.display = isChanged ? 'flex' : 'none';
}

[userNicknameInput, userEmailInput].forEach(input => {
    input.addEventListener('change', checkForUserDataChange);
})

cancelUpdateButton.addEventListener('click', () => {
    userNicknameInput.value = initialUserData.userNickname;
    userEmailInput.value = initialUserData.userEmail;
    updateAccountButtons.style.display = 'none';
})

uploadAvatarButton.onclick = async () => {
    uploadAvatarModal.style.display = 'block';
}

modalCloseButton.onclick = () => {
    uploadAvatarModal.style.display = 'none';
}

avatarUrlInput.addEventListener('change', (e) => {
    if (e.target.value.length > 0) {
        avatarPreviewDisplay.src = e.target.value;
        avatarPreviewDisplay.style.display = 'block';
    } else {
        avatarPreviewDisplay.src = '';
        avatarPreviewDisplay.style.display = 'none';
    }

    if (avatarFileInput.files.length > 0) {
        avatarFileInput.value = '';
    }

    validateUploadAvatarModalForm();
})

avatarFileDropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    avatarFileDropArea.classList.add("dragover")
})

avatarFileDropArea.addEventListener('dragleave', () => {
    avatarFileDropArea.classList.remove("dragover")
})

avatarFileDropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    avatarFileDropArea.classList.remove("dragover")

    const file = e.dataTransfer.files[0];
    addImageFile(file)
    avatarFileInput.files = e.dataTransfer.files;

    validateUploadAvatarModalForm();
})

avatarFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    addImageFile(file)
    avatarFileInput.files = e.target.files;

    validateUploadAvatarModalForm();
})

function addImageFile(file) {
    if (file) {
        const reader = new FileReader();
        reader.onload = () => {
            avatarPreviewDisplay.src = reader.result;
            avatarPreviewDisplay.style.display = 'block';
        }

        reader.readAsDataURL(file);
    } else {
        avatarPreviewDisplay.src = '';
        avatarPreviewDisplay.style.display = 'none';
    }

    if (avatarUrlInput.value.length > 0) {
        avatarUrlInput.value = '';
    }
}

changeUserNicknameIcon.onclick = () => {
    userNicknameInput.removeAttribute('readonly');
    userNicknameInput.focus();

    userNicknameInput.addEventListener('blur', () => {
        userNicknameInput.setAttribute('readonly', 'readonly');
    }, {once: true});
}

changeUserEmailIcon.onclick = () => {
    userEmailInput.removeAttribute('readonly');
    userEmailInput.focus();

    userEmailInput.addEventListener('blur', () => {
        userEmailInput.setAttribute('readonly', 'readonly');
    }, {once: true});
}

function validateUploadAvatarModalForm() {
    const isValid = avatarUrlInput.value.length > 0 || avatarFileInput.files.length > 0;
    modalSubmitButton.disabled = !isValid;
}

window.addEventListener('click', (event) => {
    if (event.target === uploadAvatarModal) {
        uploadAvatarModal.style.display = 'none';
    }
})

modalSubmitButton.onclick = async () => {
    await uploadUserAvatar();
}

updateAccountButtons.addEventListener('submit', async event => {
    event.preventDefault();
    await updateUserData();
})