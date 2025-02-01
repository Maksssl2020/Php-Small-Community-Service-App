export function showToast(message, type = 'error') {
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

export function calcPeriodFromDate(date) {
    const today = new Date();
    const enteredDate = new Date(date);
    const differenceInMilliseconds = today - enteredDate;

    const differenceInDays = Math.floor(differenceInMilliseconds / (1000 * 60 * 60 * 24));
    if (differenceInDays > 0) {
        return differenceInDays === 1 ? `${differenceInDays} day ago` : `${differenceInDays} days ago`;
    }

    const differenceInHours = Math.floor(differenceInMilliseconds / (1000 * 60 * 60));
    if (differenceInHours > 0) {
        return differenceInHours === 1 ?  `${differenceInHours} hour ago` : `${differenceInHours} hours ago`;
    }

    const differenceInMinutes = Math.floor(differenceInMilliseconds / (1000 * 60));
    if (differenceInMinutes > 0) {
        return differenceInMinutes === 1 ? `${differenceInMinutes} minute ago` : `${differenceInMinutes} minutes ago`;
    }

    return "a moment ago";
}

export function formatDate(dateString, isLongDate = false) {
    const date = new Date(dateString);
    let formattedDate, formattedTime;

    if (isLongDate) {
        formattedDate = date.toLocaleDateString("pl-PL", {
            day: "2-digit",
            month: "long",
            year: "numeric",

        })

        formattedTime = date.toLocaleTimeString("pl-PL", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        })

        return `${formattedDate}, ${formattedTime}`;
    }

    return  date.toLocaleDateString("pl-PL");
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