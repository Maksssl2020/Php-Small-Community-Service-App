const signUpModal = document.getElementById('signUpModal');
const signInModal = document.getElementById('signInModal');
const signUpButton = document.getElementById('signUpButton');
const signInButton = document.getElementById('signInButton');
const logoutButton = document.getElementById('logoutButton');
const mainTagsContainer = document.getElementById('mainTags');

document.addEventListener('DOMContentLoaded', async () => {
    await fetchMainTagsForStartPage();
})

if (signUpButton) {
    signUpButton.onclick = () => {
        signUpModal.style.display = 'block';
    }
}

if (signInButton) {
    signInButton.onclick = () => {
        signInModal.style.display = 'block';
    }
}

if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        fetch('../../utils/sign-in/logout.php', {
            method: 'POST'
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    showToast(data.message, 'success');
                    window.location.reload();
                } else {
                    showToast('Logout failed. Please try again.', 'error');
                }
            }).catch(err => {
            console.log(err);
            showToast('Something went wrong. Please try again.', 'error');
        });
    })
}

window.onclick = (event) => {
    if (event.target === signUpModal) {
        signUpModal.style.display = 'none';
    }
    if (event.target === signInModal) {
        signInModal.style.display = 'none';
    }
}

const signInForm = document.getElementById('signInForm');
const signInNicknameInput = document.getElementById('signInNicknameInput');
const signInPasswordInput = document.getElementById('signInPasswordInput');
const signInSubmitButton = document.getElementById('signInSubmitButton');

signInForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    await signIn();
})



function validateFormInput(input, isValid) {
    input.style.border = isValid ? '2px solid #E9E1FF' : '2px solid #ff4d4f';
}

function validateSignInForm() {
    const isNicknameValid = signInNicknameInput.value.trim().length > 0;
    const isPasswordValid = signInPasswordInput.value.trim().length >= 8;

    signInSubmitButton.disabled = !(isNicknameValid && isPasswordValid);
}

signInNicknameInput.addEventListener('change', () => {
    validateFormInput(signInNicknameInput, signInNicknameInput.value.trim().length > 0);
    validateSignInForm();
});
signInPasswordInput.addEventListener('change', () => {
    validateFormInput(signInPasswordInput, signInPasswordInput.value.trim().length >= 8);
    validateSignInForm();
});

const signUpForm = document.getElementById('signUpForm');
const signUpNicknameInput = document.getElementById('signUpNicknameInput');
const signUpEmailInput = document.getElementById('signUpEmailInput');
const signUpPasswordInput = document.getElementById('signUpPasswordInput');
const signUpRepeatPasswordInput = document.getElementById('signUpRepeatPasswordInput');
const signUpSubmitButton = document.getElementById('signUpSubmitButton');

signUpForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    await signUp();
});

function validateSignUpForm() {
    const isNicknameValid = signUpNicknameInput.value.trim().length > 0;
    const isEmailValid = signUpEmailInput.value.trim().length >= 4;
    const isPasswordValid = signUpPasswordInput.value.trim().length >= 8;
    const isRepeatPasswordValid = signUpRepeatPasswordInput.value === signUpPasswordInput.value;

    signUpSubmitButton.disabled = !(isNicknameValid && isEmailValid && isPasswordValid && isRepeatPasswordValid && isRepeatPasswordValid);
}

signUpNicknameInput.addEventListener('blur', () => {
    validateFormInput(signUpNicknameInput, signUpNicknameInput.value.trim().length > 0);
    validateSignUpForm();
});
signUpEmailInput.addEventListener('blur', () => {
    validateFormInput(signUpEmailInput, signUpEmailInput.value.trim().length >= 4);
    validateSignUpForm();
});
signUpPasswordInput.addEventListener('blur', () => {
    validateFormInput(signUpPasswordInput, signUpPasswordInput.value.trim().length >= 8);
    validateSignUpForm(signUpRepeatPasswordInput);
});
signUpRepeatPasswordInput.addEventListener('blur', () => {
    validateFormInput(signUpRepeatPasswordInput, signUpRepeatPasswordInput.value === signUpPasswordInput.value);
    validateSignUpForm();
});