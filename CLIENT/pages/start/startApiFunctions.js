import {
    signInForm,
    signInModal,
    signInNicknameInput,
    signInPasswordInput,
    signUpEmailInput,
    signUpForm,
    signUpModal,
    signUpNicknameInput,
    signUpPasswordInput
} from "./start.js";
import {showToast, updatePagination} from "../../../indexUtils.js";

export async function fetchMainTagsForStartPage() {
    return await fetch('http://localhost/php-small-social-service-app/tags/get-main-tags', {
        method: 'GET',
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
               return data.data.slice(0, 14);
            } else {
                console.log("Failed to fetch main tags. Please try again.");
                return [];
            }

        }).catch(err => {
        console.log(err);
        return [];
    })
}

export async function getPostsForNonLoggedInUser(specifiedTag, pageNumber) {
    const params = new URLSearchParams({tag: specifiedTag, page: pageNumber });
    return await fetch(`http://localhost/php-small-social-service-app/posts/get-discovered-posts?${params.toString()}`, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(res => res.json())
    .then(data => {
        console.log(data);

        if (data.success) {
            const {posts, totalPages} = data.data;
            console.log(posts, totalPages);
            console.log(pageNumber)
            updatePagination(totalPages, pageNumber, "start", "startPageDiscover", specifiedTag)
            return posts;
        }

        return [];
    })
    .catch(err => {
        console.log(err);
        return [];
    })
}

export async function signIn() {
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

                window.location = "../dashboard/dashboard.php?section=dashboard";
            } else {
                data.errors.forEach((error) => showToast(error));
            }
        }).catch(errors => {
        console.log(errors)
        showToast('Something went wrong. Please try again later.', 'error')
    });
}

export async function signUp() {
    fetch('http://localhost/php-small-social-service-app/authentication/sign-up', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            nickname: signUpNicknameInput.value,
            email: signUpEmailInput.value,
            password: signUpPasswordInput.value,
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
}