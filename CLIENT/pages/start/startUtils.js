import {getSignedInUserData} from "../../../indexApiFunctions.js";
import {fetchMainTagsForStartPage, getPostsForNonLoggedInUser} from "./startApiFunctions.js";
import {createDiscoverPost} from "../../../index.js";
import {
    forgotPasswordSubmitButton,
    mainTagsContainer, signInNicknameInput, signInPasswordInput, signInSubmitButton,
    signUpEmailInput,
    signUpNicknameInput,
    signUpPasswordInput,
    signUpRepeatPasswordInput, signUpSubmitButton
} from "./start.js";

export async function fillPageWithMainTagCards() {
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

export async function fillPageWithPostsRelatedToSpecifiedTag(specifiedTag) {
    const pageNumber = localStorage.getItem(`startPageDiscover${specifiedTag}PaginationNumber`) ?? 1;
    const postsData = await getPostsForNonLoggedInUser(specifiedTag, pageNumber)

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

export function validateSignUpForm() {
    const isNicknameValid = signUpNicknameInput.value.trim().length > 0;
    const isEmailValid = signUpEmailInput.value.trim().length >= 4;
    const isPasswordValid = signUpPasswordInput.value.trim().length >= 8;
    const isRepeatPasswordValid = signUpRepeatPasswordInput.value === signUpPasswordInput.value;

    signUpSubmitButton.disabled = !(isNicknameValid && isEmailValid && isPasswordValid && isRepeatPasswordValid && isRepeatPasswordValid);
}

export function validateSignInForm() {
    const isNicknameValid = signInNicknameInput.value.trim().length > 0;
    const isPasswordValid = signInPasswordInput.value.trim().length >= 8;

    signInSubmitButton.disabled = !(isNicknameValid && isPasswordValid);
}

export function validateResetPasswordForm() {
    const isEmailValid = resetPasswordEmailInput.value.trim().length >= 4;

    forgotPasswordSubmitButton.disabled = !isEmailValid;
}