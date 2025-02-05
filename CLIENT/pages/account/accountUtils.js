import {
    avatarFileInput,
    avatarPreviewDisplay,
    avatarUrlInput,
    confirmNewPasswordInput,
    createdAtDataLabel,
    createdAtPeriodLabel,
    initialUserData,
    modalSubmitButton,
    newPasswordInput,
    updateAccountButtons,
    userAvatarInput,
    userEmailInput,
    userNicknameInput,
    userPasswordInput
} from "./account.js";
import {calcPeriodFromDate, getUserAvatar, showToast} from "../../../indexUtils.js";
import {checkEnteredPassword, updatePassword} from "./accountApiFunctions.js";

export function validateUploadAvatarModalForm() {
    const isValid = avatarUrlInput.value.length > 0 || avatarFileInput.files.length > 0;
    modalSubmitButton.disabled = !isValid;
}

export async function validateAndUpdatePassword() {
    const isEnteredPasswordValid = await checkEnteredPassword();
    let cannotUpdate = false;

    if (!isEnteredPasswordValid) {
        showToast("Entered current password is invalid!", "error");
        cannotUpdate = true;
    }

    if (newPasswordInput.value.length < 8) {
        showToast("Password must be at least 8 characters!", "error");
        cannotUpdate = true;
    }

    if (newPasswordInput.value !== confirmNewPasswordInput.value) {
        showToast("New password and confirm password must be equal!", "error");
        cannotUpdate = true;
    }

    if (!cannotUpdate) {
        await updatePassword();
    }
}

export function addImageFile(file) {
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

export function checkForUserDataChange() {
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

export async function populatePageWithUserData(userData) {
    const {id, userNickname, userEmail, avatarUrl, avatarImage, createdAt} = userData;

    userNicknameInput.value = userNickname;
    userEmailInput.value = userEmail;
    userPasswordInput.value = '1234567890';
    createdAtDataLabel.textContent = new Date(createdAt.date).toLocaleString('pl-PL');
    createdAtPeriodLabel.textContent = calcPeriodFromDate(createdAt.date);
    userAvatarInput.src = getUserAvatar(avatarUrl, avatarImage);
}