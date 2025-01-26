async function fetchRandomPostsForUser() {
    const {userId} = await getSignedInUserData();

    fetch(`http://localhost/php-small-social-service-app/posts/get-dashboard-posts-for-user/${userId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then(res => res.json())
        .then(async data => {
            if (data.success) {
                dashboardContentContainer.innerHTML = "";
                await populateDashboardContentWithUserPosts(data.data);
            } else {
                console.log(data.errors);
                showToast("Something went wrong... Please try again later.", 'error')
            }
        })
        .catch(err => console.log(err));
}

async function fetchUserPosts() {
    const {userId} = await getSignedInUserData();

    fetch(`http://localhost/php-small-social-service-app/posts/get-user-posts/${userId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then( res => res.json())
        .then(async data => {
            if (data.success) {
                dashboardContentContainer.innerHTML = "";
                await populateDashboardContentWithUserPosts(data.data);
            } else {
                showToast("Something went wrong... Please try again later.", 'error');
            }
        })
        .catch(err => console.log(err));
}

async function likeOrUnlikePost(postId) {
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

async function fetchPostAmountOfLikes(postId) {
    return fetch(`http://localhost/php-small-social-service-app/posts/get-post-likes/${postId}`, {
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

async function isPostLikedByUser(postId) {
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

async function fetchAllTags() {
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

async function addNewTextPost() {
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

async function addNewImagePost() {
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

async function addNewQuotePost() {
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

async function addNewLinkPost() {
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

function addNewUserTag(tagName) {
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