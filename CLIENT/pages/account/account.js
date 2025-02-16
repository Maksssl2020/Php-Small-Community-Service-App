import {updateUserData, uploadUserAvatar} from "./accountApiFunctions.js";
import {fetchUserData, getSignedInUserData, logout} from "../../../indexApiFunctions.js";
import {
    enableUserEmailChangeOnClick,
    enableUserNicknameChangeOnClick,
    restoreInitialUserData,
    showAvatarPreviewFromFileOnChange,
    showAvatarPreviewFromFileOnDrop,
    showAvatarPreviewFromUrl
} from "./accountEventListeners.js";
import {checkForUserDataChange, populatePageWithUserData, validateAndUpdatePassword} from "./accountUtils.js";

export const userAvatarInput = document.getElementById('userAvatar');
export const userEmailInput = document.getElementById('userEmail');
export const userNicknameInput = document.getElementById('userNickname');
export const userPasswordInput = document.getElementById('userPassword');
export const avatarFileInput = document.getElementById('avatarFileInput');
export const avatarUrlInput = document.getElementById('avatarUrlInput');
export const uploadAvatarModal = document.getElementById('uploadAvatarModal');
export const updateAccountButtons = document.getElementById('updateAccountButtons');
export const avatarPreviewDisplay = document.getElementById('avatarPreviewDisplay');

export const createdAtDataLabel = document.getElementById('createdAtDataLabel');
export const createdAtPeriodLabel = document.getElementById('createdAtPeriodLabel');
const uploadAvatarButton  = document.getElementById('uploadAvatarButton');
const modalCloseButton  = document.getElementById('modalCloseButton');
export const modalSubmitButton = document.getElementById('modalSubmitButton');
const changeUserNicknameIcon = document.getElementById('changeUserNicknameIcon');
const changeUserEmailIcon = document.getElementById('changeUserEmailIcon');
const changeUserPasswordIcon = document.getElementById("changeUserPasswordIcon");
const cancelUpdateButton = document.getElementById('cancelUpdateButton');
export const avatarFileDropArea = document.getElementById('avatarFileDropArea');

const changePasswordModal = document.getElementById('changePasswordModal');

export const currentPasswordInput = document.getElementById("currentPasswordInput");
export const newPasswordInput = document.getElementById("newPasswordInput");
export const confirmNewPasswordInput = document.getElementById("confirmNewPasswordInput");
export const changeUserPasswordButton  = document.getElementById('changeUserPasswordButton');
export const cancelChangePasswordButton = document.getElementById('cancelChangePasswordButton');
const logoutSelector = document.getElementById("logoutItem");


export let initialUserData = {};

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

if (logoutSelector) {
    logoutSelector.addEventListener("click", logout);
}

function setInitialUserData(userData) {
    initialUserData = {...userData};
}

[userNicknameInput, userEmailInput].forEach(input => {
    input.addEventListener('change', checkForUserDataChange);
})

cancelUpdateButton.addEventListener('click', restoreInitialUserData);

uploadAvatarButton.onclick = async () => {
    uploadAvatarModal.style.display = 'block';
}

modalCloseButton.onclick = () => {
    uploadAvatarModal.style.display = 'none';
}

avatarUrlInput.addEventListener('change', showAvatarPreviewFromUrl)

avatarFileDropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    avatarFileDropArea.classList.add("dragover")
})

avatarFileDropArea.addEventListener('dragleave', () => {
    avatarFileDropArea.classList.remove("dragover")
})

avatarFileDropArea.addEventListener('drop', showAvatarPreviewFromFileOnDrop)
avatarFileInput.addEventListener('change', showAvatarPreviewFromFileOnChange)
// changeUserNicknameIcon.onclick = () => enableUserNicknameChangeOnClick;
// changeUserEmailIcon.onclick = () => enableUserEmailChangeOnClick;

if (changeUserNicknameIcon) {
    changeUserNicknameIcon.addEventListener('click', enableUserNicknameChangeOnClick)
}

if (changeUserEmailIcon) {
    changeUserEmailIcon.addEventListener('click', enableUserEmailChangeOnClick);
}

changeUserPasswordIcon.onclick = () => {
    changePasswordModal.style.display = 'block';
}

window.addEventListener('click', (event) => {
    if (event.target === uploadAvatarModal) {
        uploadAvatarModal.style.display = 'none';
    }

    if (event.target === changePasswordModal) {
        changePasswordModal.style.display = 'none';
    }
})

modalSubmitButton.onclick = async () => {
    await uploadUserAvatar();
}

changeUserPasswordButton.onclick = async () => {
    await validateAndUpdatePassword();
}

cancelChangePasswordButton.onclick = async () => {
    changePasswordModal.style.display = 'none';
}

updateAccountButtons.addEventListener('submit', async event => {
    event.preventDefault();
    await updateUserData();
})