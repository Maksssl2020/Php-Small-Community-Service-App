import {showToast} from "./indexUtils.js";

export async function fetchUserData(userId) {
    return await fetch(`http://localhost/php-small-social-service-app/users/get-user-data/${userId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        }
    })
        .then(response => {
            return response.json()
        })
        .then(data => {
            if (data.success) {
                return data.data;
            } else {
                return null;
            }
        })
        .catch(error => {
            console.log(error);
            return null;
        });
}

export function autoResize() {
    this.style.height = "auto";
    this.style.height = this.scrollHeight + 50 + "px";
}

export async function fetchSiteData(url) {
    return await fetch('/utils/ogp/get_ogp_from_link.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `url=${encodeURIComponent(url)}`
    })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                return data.data;
            } else {
                data.errors.forEach(error => {
                    showToast(error, 'error');
                })

                return null;
            }
        })
        .catch(err => {
            console.log(err);
            return null;
        });
}

export async function getSignedInUserData() {
    return await fetch('http://localhost/php-small-social-service-app/users/get-signed-in-user-data', {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            return data.data;
        } else {
            return null;
        }
    })
    .catch(err => {
        console.log(err);
        return null;
    });
}

export async function fetchPostAmountOfLikes(postId) {
    return fetch(`http://localhost/php-small-social-service-app/posts/count-post-likes/${postId}`, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                return data.data;
            }
            return 0;
        })
        .catch(err => {
            console.log(err);
            return 0;
        });
}

export async function isPostLikedByUser(postId) {
    const {userId} = await getSignedInUserData();

    return await fetch(`http://localhost/php-small-social-service-app/posts/is-post-liked-by-user/${postId}`, {
        method: 'POST',
        body: JSON.stringify({
            userId: userId
        }),
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then(res => {
            return res.json()
        })
        .then(data => {
            if (data.success) {
                return data.data;
            }

            return false;
        })
        .catch(err => {
            console.log(err);
            return false;
        });
}

export async function forgotPassword(userEmail) {
    fetch("http://localhost/php-small-social-service-app/authentication/forgot-password", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: userEmail.trim(),
        })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                showToast(data.message, 'success');
            } else {
                showToast('Something went wrong. Please try again.', 'error')
            }
        })
        .catch(errors => {
            console.log(errors)
            showToast('Something went wrong. Please try again.', 'error')
        })
}