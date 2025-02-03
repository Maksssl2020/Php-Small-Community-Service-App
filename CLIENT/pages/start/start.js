import {fetchMainTagsForStartPage, getPostsForNonLoggedInUser, logout, signIn, signUp} from "./startApiFunctions.js";
import {getSignedInUserData} from "../../../indexApiFunctions.js";
import {createDiscoverPost} from "../../../index.js";
import {showDiscoverPostAndLikesStatisticsContainer} from "../../../indexEventListeners.js";

export const signUpModal = document.getElementById('signUpModal');
export const signInModal = document.getElementById('signInModal');
export const signUpButton = document.getElementById('signUpButton');
export const signInButton = document.getElementById('signInButton');
export const logoutButton = document.getElementById('logoutButton');
export const mainTagsContainer = document.getElementById('mainTags');
const headerReturnButton = document.getElementById('headerReturnButton');
const headerTitle = document.getElementById('headerTitle');

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const tag = urlParams.get("tag");

    if (tag !== undefined && tag !== null && tag !== "") {
        await handleSectionChange(tag);
    } else {
        headerTitle.textContent = "Browse Topics";
        await fillPageWithMainTagCards();
    }
})


mainTagsContainer.addEventListener('click', showDiscoverPostAndLikesStatisticsContainer);

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
}

export const signInForm = document.getElementById('signInForm');
export const signInNicknameInput = document.getElementById('signInNicknameInput');
export const signInPasswordInput = document.getElementById('signInPasswordInput');
export const signInSubmitButton = document.getElementById('signInSubmitButton');

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

export const signUpForm = document.getElementById('signUpForm');
export const signUpNicknameInput = document.getElementById('signUpNicknameInput');
export const signUpEmailInput = document.getElementById('signUpEmailInput');
export const signUpPasswordInput = document.getElementById('signUpPasswordInput');
export const signUpRepeatPasswordInput = document.getElementById('signUpRepeatPasswordInput');
export const signUpSubmitButton = document.getElementById('signUpSubmitButton');

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

async function fillPageWithMainTagCards() {
    const tagsData = await fetchMainTagsForStartPage();
    mainTagsContainer.innerHTML = '';

    if (!mainTagsContainer.classList.contains('main-tags')) {
        mainTagsContainer.classList.replace("discover", "main-tags");
    }

    for (const tag of tagsData) {
        const mainTagCard = await createMainTagCard(tag);
        mainTagsContainer.innerHTML += mainTagCard;
    }
}

async function fillPageWithPostsRelatedToSpecifiedTag(specifiedTag) {
    const postsData = await getPostsForNonLoggedInUser(specifiedTag)

    const container1 = document.createElement("div");
    container1.setAttribute("id", "container1");
    container1.classList.add("discover-posts-container-column");
    const container2 = document.createElement("div");
    container2.setAttribute("id", "container2");
    container2.classList.add("discover-posts-container-column");

    mainTagsContainer.innerHTML = '';
    mainTagsContainer.append(container1, container2);
    mainTagsContainer.classList.replace("main-tags", "discover");

    let counter = 1;

    for (let i = 0; i < postsData.length; i++) {
        const post = await createDiscoverPost(postsData[i], false);

        if (!post) continue;

        if (counter === 1) {
            container1.append(post);
        } else {
            container2.append(post);
        }

        if (counter !== 2) {
            counter++;
        } else {
            counter = 1;
        }
    }
}

async function createMainTagCard(mainTag) {
    let url;

    if (await getSignedInUserData() !== null) {
        url = `../dashboard/dashboard.php?section=discover&tag=${mainTag.name}`
    } else {
        url = `../start/start.php?tag=${mainTag.name}`
    }

    return `
    <div class="main-tag-card">
        <a href="${url}"></a>
        <img class="main-tag-image" src="${mainTag.imageUrl}" alt="${mainTag.name}"/>
        <p class="main-tag-name">#${mainTag.name}<p/>
    </div>
    `
}