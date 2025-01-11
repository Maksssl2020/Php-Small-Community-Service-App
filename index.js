function showToast(message, type = 'error') {
    const toastContainer = document.getElementById('toastContainer')
    const toast = document.createElement('div');
    toast.classList.add('toast');

    if (type === 'error') {
        toast.classList.add('error');
    } else {
        toast.classList.add('success');
    }

    toast.textContent = message;

    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 4000)
}

async function fetchUserData(userId) {
    const formData = new FormData();
    formData.append('userId', userId);

    return await fetch('/utils/users/get_user_data.php', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log(data.data);
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

function autoResize() {
    this.style.height = "auto";
    this.style.height = `${this.scrollHeight}px`;
}

async function fetchSiteData(url) {
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