const signUpModal = document.getElementById('signUpModal');
const signInModal = document.getElementById('signInModal');
const signUpButton = document.getElementById('signUpButton');
const signInButton = document.getElementById('signInButton');
const logoutButton = document.getElementById('logoutButton');
const mainTagsContainer = document.getElementById('mainTags');

document.addEventListener('DOMContentLoaded', () => {
    fetchMainTags();
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

function fetchMainTags() {
    fetch('../../utils/start/get_main_tags.php', {
        method: 'GET'
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                data.data.forEach(mainTag => {
                    const mainTagDiv = document.createElement('div');
                    mainTagDiv.className = 'main-tag-card';

                    const tagImg = document.createElement('img');
                    tagImg.src = mainTag.imageUrl;
                    tagImg.alt = mainTag.name;

                    const tagP = document.createElement('p');
                    tagP.textContent = mainTag.name;

                    mainTagDiv.appendChild(tagImg);
                    mainTagDiv.appendChild(tagP);

                    mainTagsContainer.appendChild(mainTagDiv);
                })
            } else {
                console.log("Failed to fetch main tags. Please try again.");
            }
        }).catch(err => {
            console.log(err);
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

async function signIn() {

    fetch('http://localhost/php-small-social-service-app/authentication/sign-in', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
            nickname: signInNicknameInput.value,
            password: signInPasswordInput.value,
        }),
    })
        .then(res => res.json())
        .then(data => {
            console.log(data);

            if (data.success) {
                showToast(data.message, 'success');

                setTimeout(() => {
                    signInModal.style.display = 'none';
                    signInForm.reset();
                }, 1000)

                window.location = "../dashboard/dashboard.php";
            } else {
                data.errors.forEach((error) => showToast(error));
            }
        }).catch(errors => {
        console.log(errors)
        showToast('Something went wrong. Please try again later.', 'error')
    });
}

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

signUpForm.addEventListener('submit', (event) => {
    event.preventDefault();

    let formData = new FormData(signUpForm);

    fetch('http://localhost/php-small-social-service-app/authentication/sign-up', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            nickname: 'exampleUser',
            password: 'examplePassword'
        })
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