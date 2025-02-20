import {getSignedInUserData} from "../../../indexApiFunctions.js";
import {
    avatarFileInput,
    avatarUrlInput, currentPasswordInput, initialUserData, newPasswordInput,
    uploadAvatarModal,
    userAvatarInput,
    userEmailInput,
    userNicknameInput
} from "./account.js";
import {showToast} from "../../../indexUtils.js";

export async function uploadUserAvatar() {
    const {userId} = await getSignedInUserData();
    let body;
    let headers = {};

    if (avatarUrlInput.value.length > 0) {
        body = JSON.stringify({
            avatarUrl: avatarUrlInput.value,
            type: 'url'
        });
        headers['Content-Type'] = 'application/json';
    } else {
        const encodedFile = await encodeFileToBase64(avatarFileInput.files[0])
        body =  JSON.stringify({
            avatarImage: encodedFile,
            type: 'image',
        })
    }

    await fetch(`http://localhost/php-small-social-service-app/users/update-user/${userId}`, {
        method: 'PATCH',
        body: body,
        headers: headers
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log(data)
                data.type === 'url' ? userAvatarInput.src = avatarUrlInput.value : userAvatarInput.src = URL.createObjectURL(avatarFileInput.files[0]);

                showToast("Added new avatar!", "success");
                uploadAvatarModal.style.display = 'none'
            } else {
                data.errors.forEach(error => {
                    showToast(error, 'error');
                })
            }
        }).catch(error => console.log(error))
}

function encodeFileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            resolve(reader.result);
        };

        reader.onerror = (error) => {
            reject(error);
        };

        reader.readAsDataURL(file);
    });
}

export async function updateUserData() {
    const {userId} = await getSignedInUserData();

    let nickname;
    let email;

    if (userNicknameInput.value.trim() !== initialUserData['userNickname']) {
        nickname = userNicknameInput.value.trim();
    }

    if (userEmailInput.value.trim() !== initialUserData['userEmail']) {
        email = userEmailInput.value.trim();
    }

    fetch(`http://localhost/php-small-social-service-app/users/update-user/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({
            nickname: nickname,
            email: email,
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                window.location.reload();
                showToast("Data has been updated!", 'success');
            } else {
                data.errors.forEach(error => {
                    showToast(error, 'error');
                })
            }
        })
        .catch(error => console.log(error))
}

export async function updatePassword() {
    const {userId} = await getSignedInUserData();
    const newPassword = newPasswordInput.value.trim();

    fetch(`http://localhost/php-small-social-service-app/authentication/update-password/${userId}`, {
        method: 'PUT',
        body: JSON.stringify({
            password:newPassword
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showToast("Password updated!", 'success');
            }

            showToast("Something went wrong!", 'error');
        })
        .catch(error => console.log(error));
}

export async function checkEnteredPassword() {
    const {userNickname} = await getSignedInUserData();
    const enteredPassword = currentPasswordInput.value;

    return await fetch("http://localhost/php-small-social-service-app/authentication/is-password-valid", {
        method: 'POST',
        body: JSON.stringify({
            nickname: userNickname,
            password: enteredPassword
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        return data.success;
    })
    .catch(error => {
        console.log(error);
        return false;
    })
}