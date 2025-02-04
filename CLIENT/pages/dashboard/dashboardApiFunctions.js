import {
    dashboardContentContainer,
    populateDashboardContentWithPostsThatContainFollowedTags
} from "./dashboard.js";
import {populateDashboardContentPosts, updatePostAfterLikeOrUnlike} from "./dashboardPostRender.js";
import {showToast} from "../../../indexUtils.js";
import {getSignedInUserData} from "../../../indexApiFunctions.js";

export let fetchController = new AbortController();

export async function fetchRandomPostsForUser(signal) {
    const {userId} = await getSignedInUserData();

    fetchController.abort();
    fetchController = new AbortController();

    try {
        const response = await fetch(`http://localhost/php-small-social-service-app/posts/get-dashboard-posts-for-user/${userId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
            signal: signal,
        });

        const data = await response.json();

        if (data.success) {
            dashboardContentContainer.innerHTML = "";
            await populateDashboardContentPosts(data.data);
        } else {
            console.log(data.errors);
            showToast("Something went wrong... Please try again later.", 'error')
        }
    } catch (error) {
        console.log(error);
    }
}

export async function fetchPostsWithUserFollowedTags(signal) {
    const {userId} = await getSignedInUserData();

    fetchController.abort();
    fetchController = new AbortController();

    try {
        const response = await fetch(`http://localhost/php-small-social-service-app/posts/get-dashboard-posts-by-followed-tags/${userId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
            signal: signal,
        });

        const data = await response.json();

        if (data.success) {
            dashboardContentContainer.innerHTML = "";
            await populateDashboardContentWithPostsThatContainFollowedTags(data.data);
        } else {
            console.log(data.errors);
            showToast("Something went wrong... Please try again later.", 'error')
        }
    }  catch(error) {
        console.log(error);
    }
}

export async function fetchUserPosts(signal) {
    const {userId} = await getSignedInUserData();

    fetchController.abort();
    fetchController = new AbortController();

    try {
        const response = await fetch(`http://localhost/php-small-social-service-app/posts/get-user-posts/${userId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
            signal: signal,
        });

        const data = await response.json();

        if (data.success) {
            dashboardContentContainer.innerHTML = "";
            await populateDashboardContentPosts(data.data);
        } else {
            showToast("Something went wrong... Please try again later.", 'error')
        }
    } catch (error) {
        console.log(error);
    }
}

export async function fetchPostsForUserDiscoverSection(signal, type, specifiedTag = "") {
    const {userId} = await getSignedInUserData();
    let url;
    switch (type) {
        case "recent": {
            url = `http://localhost/php-small-social-service-app/posts/get-discovered-posts-recent-${specifiedTag}/${userId}`;
            break;
        }
        case "theBest": {
            url = `http://localhost/php-small-social-service-app/posts/get-discovered-posts-best-${specifiedTag}/${userId}`;
            break;
        }
        case "popular": {
            url = `http://localhost/php-small-social-service-app/posts/get-discovered-posts-popular/${userId}`;
            break;
        }
        case "recentForYou": {
            url = `http://localhost/php-small-social-service-app/posts/get-discovered-posts-recent/${userId}`;
            break;
        }
        default: {
            url = `http://localhost/php-small-social-service-app/posts/get-discovered-posts-recent/${userId}`;
            break;
        }
    }


    return await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        },
        signal: signal,
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                return data.data;
            }

            return [];
        })
        .catch(error => {
            console.log(error);
            return [];
        });
}

export async function getUserFollowedTags() {
    const {userId} = await getSignedInUserData();

    return await fetch(`http://localhost/php-small-social-service-app/tags/get-user-followed-tags/${userId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then( res => res.json())
        .then(async data => {
            if (data.success) {
                return data.data;
            } else {
                showToast("Something went wrong... Please try again later.", 'error');
                return [];
            }
        })
        .catch(err => {
            console.log(err);
            return [];
        });
}

export async function getUserNotFollowedTags() {
    const {userId} = await getSignedInUserData();

    fetchController.abort();
    fetchController = new AbortController();

    return await fetch(`http://localhost/php-small-social-service-app/tags/get-user-not-followed-tags/${userId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        },
        signal: fetchController.signal,
    })
        .then( res => res.json())
        .then(async data => {
            if (data.success) {
                return data.data;
            } else {
                showToast("Something went wrong... Please try again later.", 'error');
                return [];
            }
        })
        .catch(err => {
            console.log(err);
            return [];
        });
}

export async function followTag(tagName) {
    const {userId} = await getSignedInUserData();

    return await fetch(`http://localhost/php-small-social-service-app/tags/follow-tag/${userId}`, {
        method: "POST",
        body: JSON.stringify({
            tagName: tagName
        }),
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then(res => res.json())
        .then(async data => {
            if (data.success) {
                return true;
            } else if (!data.success) {
                data.errors.forEach(err => showToast(err));
                return false;
            }

            return false;
        })
        .catch(err => {
            console.log(err);
            return false;
        });
}

export async function unfollowTag(tagName) {
    const {userId} = await getSignedInUserData();

    return await fetch(`http://localhost/php-small-social-service-app/tags/unfollow-tag/${userId}`, {
        method: "DELETE",
        body: JSON.stringify({
            tagName: tagName
        }),
        headers: {
            "Content-Type": "application/json"
        }
    }).then(res =>  res.json())
        .then(async data => {
            if (data.success) {
                return true;
            } else if (!data.success) {
                data.errors.forEach(err => showToast(err));
                return false;
            }

            return false;
        })
        .catch(err => {
            console.log(err);
            return false;
        });
}

export async function likeOrUnlikePost(postId) {
    const {userId} = await getSignedInUserData();

    fetch(`http://localhost/php-small-social-service-app/posts/like-post/${postId}`, {
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
                updatePostAfterLikeOrUnlike(postId);
                showToast(data.message, 'success');
            } else {
                data.errors.forEach(err => showToast(err));
            }
        })
        .catch(err => console.log(err));
}

export async function getPostCreatorId(postId) {
    return await fetch(`http://localhost/php-small-social-service-app/posts/get-post-creator-id/${postId}`, {
        method: "GET",
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

export async function getAmountOfUserFollowedTags() {
    const {userId} = await getSignedInUserData();

    return await fetch(`http://localhost/php-small-social-service-app/tags/count-user-followed-tags/${userId}`, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                return parseInt(data.data);
            }

            return 0;
        })
    .catch(err => {
        console.log(err);
        return 0;
    })
}

export async function fetchAllTags() {
    fetch('http://localhost/php-small-social-service-app/tags/get-all-tags', {
        method: 'GET',
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                availableTags = [];

                data.data.forEach((tag) => {
                    availableTags.push(tag);
                })

                const popularTags = availableTags.slice(0, 8);
                populateTagSelect(popularTags);
            } else {
                console.log("Error: No tags found.");
            }
        })
        .catch(err => console.log(err));
}

export async function addNewTextPost() {
    const {userId} = await getSignedInUserData();
    const formData = new FormData(addPostModalFormContainer);

    fetch('http://localhost/php-small-social-service-app/posts/create-text-post', {
        method: 'POST',
        body: JSON.stringify({
            userId: userId,
            title: formData.get('postTitle'),
            content: formData.get('postContent'),
            tags: chosenTags ? chosenTags : null
        }),
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                showToast(data.message, "success");
                resetFormData();
            } else {
                showToast("Failed to add a new post!", "error");
            }
        })
        .catch(err => console.log(err));
}

export async function addNewImagePost() {
    const {userId} = await getSignedInUserData();
    const formData = new FormData(addPostModalFormContainer);
    const addedLinksList = document.getElementById("addedLinksList");
    const imagesLinks = Array.from(addedLinksList.children).map(item => item.id);

    fetch('http://localhost/php-small-social-service-app/posts/create-image-post', {
        method: 'POST',
        body: JSON.stringify({
            userId: userId,
            content: formData.get('postContent'),
            imagesLinks: imagesLinks,
            tags: chosenTags ? chosenTags : null
        }),
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                showToast(data.message, "success");
                addedLinksList.innerHTML = "";
                resetFormData();
            } else {
                showToast("Failed to add a new post!", "error");
            }
        })
        .catch(err => console.log(err));
}

export async function addNewQuotePost() {
    const {userId} = await getSignedInUserData();
    const formData = new FormData(addPostModalFormContainer);
    formData.append('postType', 'quote');

    fetch('http://localhost/php-small-social-service-app/posts/create-quote-post', {
        method: 'POST',
        body: JSON.stringify({
            userId: userId,
            content: formData.get('postContent'),
            tags: chosenTags ? chosenTags : null
        }),
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                showToast(data.message, "success");
                resetFormData();
            }
        })
        .catch(err => console.log(err));
}

export async function addNewLinkPost() {
    const {userId} = await getSignedInUserData();
    const addedLinksList = document.getElementById("addedLinksList");
    const links = Array.from(addedLinksList.children).map(item => item.id);

    const formData = new FormData(addPostModalFormContainer);
    formData.append('postType', 'link');
    formData.append('postTags', JSON.stringify(chosenTags));
    formData.append('postLinks', JSON.stringify(links));

    fetch('http://localhost/php-small-social-service-app/posts/create-link-post', {
        method: 'POST',
        body: JSON.stringify({
            userId: userId,
            links: links,
            content: formData.get('postContent'),
            tags: chosenTags ? chosenTags : null
        }),
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then(res => res.json())
        .then(async data => {
            if (data.success) {
                showToast(data.message, "success");
                addedLinksList.innerHTML = "";
                await resetFormData();
            }
        })
        .catch(err => console.log(err));
}

export function addNewUserTag(tagName) {
    fetch('http://localhost/php-small-social-service-app/tags/add-new-tag-by-user', {
        method: 'POST',
        body: JSON.stringify({
            tagName: tagName,
            isMainTag: false,
        }),
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                addTag(tagName);
            } else {
                showToast("Failed to add a new tag.", "error");
            }
        })
        .catch(err => console.log(err));
}

export async function addComment(postId, content) {
    const {userId} = await getSignedInUserData();

    return await fetch(`http://localhost/php-small-social-service-app/comments/add-comment/${postId}`, {
        method: 'POST',
        body: JSON.stringify({
            userId: userId,
            content: content
        }),
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            return parseInt(data.id);
        }

        return -1;
    })
    .catch(err => {
        console.log(err);
        return -1;
    });
}

export async function countPostComments(postId) {
    return await fetch(`http://localhost/php-small-social-service-app/comments/count-post-comments/${postId}`, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            return parseInt(data.data);
        }

        return 0;
    })
    .catch(err => {
        console.log(err);
        return 0;
    });
}

export async function getPostComments(postId) {
    return await fetch(`http://localhost/php-small-social-service-app/comments/get-post-comments/${postId}`, {
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

        return [];
    })
        .catch(err => {
            console.log(err);
            return [];
        });
}

export async function getPostLikesData(postId) {
    return await fetch(`http://localhost/php-small-social-service-app/posts/get-post-likes/${postId}`, {
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

        return [];
    })
        .catch(err => {
            console.log(err);
            return [];
        });
}

export async function deletePostById(postId) {
    fetch(`http://localhost/php-small-social-service-app/posts/delete-post/${postId}`, {
        method: 'DELETE',
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                showToast(data.message, "success");
            }
        })
        .catch(err => console.log(err));
}

export async function deleteComment(commentId) {
    fetch(`http://localhost/php-small-social-service-app/comments/delete-comment/${commentId}`, {
        method: 'DELETE',
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            showToast(data.message, "success");
        }
    })
    .catch(err => console.log(err));
}

export async function test($path) {
    fetch(`http://localhost/php-small-social-service-app/pages/${$path}`, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then(res => {
            console.log(res);
            console.log(res.text());
        })
    .then(data => {

    })
    .catch(err => console.log(err));
}
