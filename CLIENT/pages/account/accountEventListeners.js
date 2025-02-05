import {
    avatarFileDropArea,
    avatarFileInput,
    avatarPreviewDisplay,
    initialUserData,
    updateAccountButtons,
    userEmailInput,
    userNicknameInput
} from "./account.js";
import {addImageFile, validateUploadAvatarModalForm} from "./accountUtils.js";

export function restoreInitialUserData() {
    userNicknameInput.value = initialUserData.userNickname;
    userEmailInput.value = initialUserData.userEmail;
    updateAccountButtons.style.display = 'none';
}

export function showAvatarPreviewFromUrl(event) {
    if (event.target.value.length > 0) {
        avatarPreviewDisplay.src = event.target.value;
        avatarPreviewDisplay.style.display = 'block';
    } else {
        avatarPreviewDisplay.src = '';
        avatarPreviewDisplay.style.display = 'none';
    }

    if (avatarFileInput.files.length > 0) {
        avatarFileInput.value = '';
    }

    validateUploadAvatarModalForm();
}

export function showAvatarPreviewFromFileOnDrop(event) {
    event.preventDefault();
    avatarFileDropArea.classList.remove("dragover")

    const file = event.dataTransfer.files[0];
    addImageFile(file)
    avatarFileInput.files = event.dataTransfer.files;

    validateUploadAvatarModalForm();
}

export function showAvatarPreviewFromFileOnChange(event) {
    const file = event.target.files[0];
    addImageFile(file)
    avatarFileInput.files = event.target.files;

    validateUploadAvatarModalForm();
}

export function enableUserNicknameChangeOnClick() {
    userNicknameInput.removeAttribute('readonly');
    userNicknameInput.focus();

    userNicknameInput.addEventListener('blur', () => {
        userNicknameInput.setAttribute('readonly', 'readonly');
    }, {once: true});
}

export function enableUserEmailChangeOnClick() {
    userEmailInput.removeAttribute('readonly');
    userEmailInput.focus();

    userEmailInput.addEventListener('blur', () => {
        userEmailInput.setAttribute('readonly', 'readonly');
    }, {once: true});
}