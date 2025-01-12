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

let initialUserData = {};

window.addEventListener('DOMContentLoaded', async () => {
    let userData;

    const userId = await getSignedUserId();

    if (userId) {
        userData = await fetchUserData(userId);
        setInitialUserData(userData);

        await populatePageWithUserData(userData);
    } else {
        window.location.href = '../dashboard.php';
    }
})

async function getSignedUserId() {
    return await fetch('../../utils/users/get_signed_user_id.php', {
        method: 'GET',
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                return data.data;
            } else {
                return null;
            }
        })
        .catch((error) => {
            console.log(error)
            return null;
        })
}

async function populatePageWithUserData(userData) {
    const {id, userNickname, userEmail, avatarUrl, avatarImage, createdAt} = userData;

    userNicknameInput.value = userNickname;
    userEmailInput.value = userEmail;
    userPasswordInput.value = '1234567890';
    createdAtDataLabel.textContent = new Date(createdAt.date).toLocaleString('pl-PL');
    const calculatedPeriod = calcPeriodFromDate(createdAt.date);

    createdAtPeriodLabel.textContent = `${calculatedPeriod} ${calculatedPeriod === 1 ? 'day' : 'days'} ago`;

    if (avatarUrl) {
        userAvatarInput.src = avatarUrl;
    } else if (avatarImage) {
        userAvatarInput.src = `base64;${avatarUrl}`;
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

    console.log(currentUserData);
    console.log(initialUserData)
}

[userNicknameInput, userEmailInput].forEach(input => {
    input.addEventListener('change', checkForUserDataChange);
})

cancelUpdateButton.addEventListener('click', () => {
    userNicknameInput.value = initialUserData.userNickname;
    userEmailInput.value = initialUserData.userEmail;
    updateAccountButtons.style.display = 'none';
})

uploadAvatarButton.onclick = () => {
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

avatarFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];

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

    validateUploadAvatarModalForm();
})

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
    const isValid = avatarUrlInput.value.length > 0 || avatarUrlInput.files.length > 0;
    modalSubmitButton.disabled = !isValid;
}

window.addEventListener('click', (event) => {
    if (event.target === uploadAvatarModal) {
        uploadAvatarModal.style.display = 'none';
    }
})