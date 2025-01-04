const signUpModal = document.getElementById('signUpModal');
const signInModal = document.getElementById('signInModal');
const signUpButton = document.getElementById('signUpButton');
const signInButton = document.getElementById('signInButton');

signUpButton.onclick = () => {
    signUpModal.style.display = 'block';
}

signInButton.onclick = () => {
    signInModal.style.display = 'block';
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

signInForm.addEventListener('submit', (event) => {
    event.preventDefault();

    let formData = new FormData(signInForm);

    fetch('../../utils/sign-in/sign_in.php', {
        method: 'POST',
        body: formData,
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            showToast(data.message, 'success');

            setTimeout(() => {
                signInModal.style.display = 'none';
                signInForm.reset();
            }, 1000)
        } else {
            data.errors.forEach((error) => showToast(error));
        }
    }).catch(error => {
        console.log(error)
        showToast('Something went wrong. Please try again later.', 'error')
    });
})

function validateFormInput(input, isValid) {
    input.style.border = isValid ? '2px solid #E9E1FF' : '2px solid #ff4d4f';
}

function validateSignInForm() {
    const isNicknameValid = signInNicknameInput.value.trim().length > 0;
    const isPasswordValid = signInPasswordInput.value.trim().length >= 8;

    signInSubmitButton.disabled = !(isNicknameValid && isPasswordValid);
}

signInNicknameInput.addEventListener('blur', () => {
    validateFormInput(signInNicknameInput, signInNicknameInput.value.trim().length > 0);
    validateSignInForm();
});
signInPasswordInput.addEventListener('blur', () => {
    validateFormInput(signInPasswordInput, signInPasswordInput.value.trim().length >= 8);
    validateSignInForm();
});

const signUpForm = document.getElementById('signUpForm');
const signUpNicknameInput = document.getElementById('signUpNicknameInput');
const signUpEmailInput = document.getElementById('signUpEmailInput');
const signUpPasswordInput = document.getElementById('signUpPasswordInput');
const signUpRepeatPasswordInput = document.getElementById('signUpRepeatPasswordInput');
const signUpSubmitButton = document.getElementById('signUpSubmitButton');

signUpForm.addEventListener('submit', (event) => {
    event.preventDefault();

    let formData = new FormData(signUpForm);

    fetch('utils/sign-up/sign_up.php', {
        method: 'POST',
        body: formData,
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            showToast(data.message, 'success');

            setTimeout(() => {
                signUpModal.style.display = 'none';
                signUpForm.reset();
            }, 1000)
        } else {
            data.errors.forEach(error => showToast(error, 'error'));
        }
    }).catch(error => {
        console.log(error);
        showToast('Something went wrong. Please try again later.', 'error');
    });
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