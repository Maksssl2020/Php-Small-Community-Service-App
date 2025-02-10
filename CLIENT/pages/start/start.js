import {signIn, signUp} from "./startApiFunctions.js";
import {showDiscoverPostAndLikesStatisticsContainer} from "../../../indexEventListeners.js";
import {
    fillPageWithMainTagCards,
    fillPageWithPostsRelatedToSpecifiedTag, validateResetPasswordForm,
    validateSignInForm,
    validateSignUpForm
} from "./startUtils.js";
import {validateFormInput} from "../../../indexUtils.js";
import {forgotPassword, logout} from "../../../indexApiFunctions.js";

export const signUpModal = document.getElementById('signUpModal');
export const signInModal = document.getElementById('signInModal');
export const signUpButton = document.getElementById('signUpButton');
export const signInButton = document.getElementById('signInButton');
export const logoutButton = document.getElementById('logoutButton');
export const mainTagsContainer = document.getElementById('mainTags');
const headerReturnButton = document.getElementById('headerReturnButton');
const headerTitle = document.getElementById('headerTitle');

const forgotPasswordLabel = document.getElementById('forgotPasswordLabel');
const forgotPasswordModal = document.getElementById('forgotPasswordModal');
const returnToSignInModalButton = document.getElementById('returnToSignInModal');
const resetPasswordEmailInput = document.getElementById('resetPasswordEmailInput');
export const forgotPasswordSubmitButton  = document.getElementById('forgotPasswordSubmitButton');
const startFooter = document.getElementById('startFooter');

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const tag = urlParams.get("tag");

    if (tag !== undefined && tag !== null && tag !== "") {
        if (startFooter.classList.contains('hidden')) {
            startFooter.classList.replace('hidden', "visible");
        }
        await handleSectionChange(tag);
    } else {
        if (startFooter.classList.contains('visible')) {
            startFooter.classList.replace('visible', "hidden");
        }
        headerTitle.textContent = "Browse Topics";
        await fillPageWithMainTagCards();
    }
})

if (mainTagsContainer) {
    mainTagsContainer.addEventListener('click', showDiscoverPostAndLikesStatisticsContainer);
}

async function handleSectionChange(specifiedTag) {
    headerTitle.textContent = specifiedTag;
    headerReturnButton.classList.replace("hidden", "visible");
    await fillPageWithPostsRelatedToSpecifiedTag(specifiedTag);
}

if (headerReturnButton) {
    headerReturnButton.addEventListener('click', e => {
        e.preventDefault();
        window.location = "start.php";
    })
}

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
    logoutButton.addEventListener('click', async (event) => {
        event.preventDefault();
        await logout();
    })
}

window.onclick = (event) => {
    if (event.target === signUpModal) {
        signUpModal.style.display = 'none';
    }
    if (event.target === signInModal) {
        signInModal.style.display = 'none';
    }
    if (event.target === forgotPasswordModal) {
        forgotPasswordModal.style.display = 'none';
    }
}


export const signInForm = document.getElementById('signInForm');
export const signInNicknameInput = document.getElementById('signInNicknameInput');
export const signInPasswordInput = document.getElementById('signInPasswordInput');
export const signInSubmitButton = document.getElementById('signInSubmitButton');

if (signInForm) {
    signInForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        await signIn();
    })
}

if (signInNicknameInput) {
    signInNicknameInput.addEventListener('change', () => {
        validateFormInput(signInNicknameInput, signInNicknameInput.value.trim().length > 0);
        validateSignInForm();
    });
}

if (signInPasswordInput) {
    signInPasswordInput.addEventListener('change', () => {
        validateFormInput(signInPasswordInput, signInPasswordInput.value.trim().length >= 8);
        validateSignInForm();
    });
}

if (forgotPasswordLabel) {
    forgotPasswordLabel.onclick = () => {
        signInModal.style.display = 'none';
        forgotPasswordModal.style.display = 'block';
    }
}

if (returnToSignInModalButton) {
    returnToSignInModalButton.onclick = () => {
        forgotPasswordModal.style.display = 'none';
        signInModal.style.display = 'block';
    }
}

if (forgotPasswordSubmitButton) {
    forgotPasswordSubmitButton.onclick = async (e) => {
        e.preventDefault();
        await forgotPassword(resetPasswordEmailInput.value.trim());
        forgotPasswordModal.style.display = 'none';
    }
}

if (resetPasswordEmailInput) {
    resetPasswordEmailInput.addEventListener('change', () => {
        validateFormInput(resetPasswordEmailInput, resetPasswordEmailInput.value.trim().length >= 4);
        validateResetPasswordForm();
    })
}

export const signUpForm = document.getElementById('signUpForm');
export const signUpNicknameInput = document.getElementById('signUpNicknameInput');
export const signUpEmailInput = document.getElementById('signUpEmailInput');
export const signUpPasswordInput = document.getElementById('signUpPasswordInput');
export const signUpRepeatPasswordInput = document.getElementById('signUpRepeatPasswordInput');
export const signUpSubmitButton = document.getElementById('signUpSubmitButton');

if (signUpForm) {
    signUpForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        await signUp();
    });
}

if (signUpNicknameInput) {
    signUpNicknameInput.addEventListener('blur', () => {
        validateFormInput(signUpNicknameInput, signUpNicknameInput.value.trim().length > 0);
        validateSignUpForm();
    });
}
if (signUpEmailInput) {
    signUpEmailInput.addEventListener('blur', () => {
        validateFormInput(signUpEmailInput, signUpEmailInput.value.trim().length >= 4);
        validateSignUpForm();
    });
}
if (signUpPasswordInput) {
    signUpPasswordInput.addEventListener('blur', () => {
        validateFormInput(signUpPasswordInput, signUpPasswordInput.value.trim().length >= 8);
        validateSignUpForm(signUpRepeatPasswordInput);
    });
}
if (signUpRepeatPasswordInput) {
    signUpRepeatPasswordInput.addEventListener('blur', () => {
        validateFormInput(signUpRepeatPasswordInput, signUpRepeatPasswordInput.value === signUpPasswordInput.value);
        validateSignUpForm();
    });
}
