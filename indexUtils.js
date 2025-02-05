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
        return `${differenceInMinutes} min. ago`;
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

export function getUserAvatar(avatarUrl, avatarImage) {
    let avatarSrc;

    if (avatarUrl != null) {
        avatarSrc = avatarUrl;
    } else if (avatarImage != null) {
        avatarSrc = `data:image/jpeg;base64,${avatarImage}`
    } else {
        avatarSrc = '/CLIENT/assets/ghost_icon.jpeg';
    }

    return avatarSrc;
}

export function validateFormInput(input, isValid) {
    input.style.border = isValid ? '2px solid #E9E1FF' : '2px solid #ff4d4f';
}