import {
    fetchPostsForUserDiscoverSection,
    fetchPostsWithUserFollowedTags,
    fetchRandomPostsForUser,
    fetchUserPosts
} from "./CLIENT/pages/dashboard/dashboardApiFunctions.js";
import {getPostsForNonLoggedInUser} from "./CLIENT/pages/start/startApiFunctions.js";

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

export function updatePagination(totalPages, currentPage, pageName, typeOfData, specifiedTag = "") {
    const paginationNumbersContainer = document.getElementById(`${pageName}PaginationNumbers`);
    paginationNumbersContainer.innerHTML = '';

    const paginationRightArrow = document.getElementById(`${pageName}PaginationRightArrow`);
    const paginationLeftArrow = document.getElementById(`${pageName}PaginationLeftArrow`);

    paginationRightArrow.replaceWith(paginationRightArrow.cloneNode(true));
    paginationLeftArrow.replaceWith(paginationLeftArrow.cloneNode(true));

    const newPaginationRightArrow = document.getElementById(`${pageName}PaginationRightArrow`);
    const newPaginationLeftArrow = document.getElementById(`${pageName}PaginationLeftArrow`);

    console.log(currentPage)

    newPaginationRightArrow.addEventListener("click", async () => {
        if (currentPage < totalPages) {
            await fetchDataDependsOnTypeOfData(typeOfData, currentPage + 1, specifiedTag);
        }
    })

    newPaginationLeftArrow.addEventListener("click", async () => {
        if (currentPage > 1) {
            await fetchDataDependsOnTypeOfData(typeOfData, currentPage - 1, specifiedTag);
        }
    })

    if (totalPages === 0) {
        totalPages = 1;
    }

    const createPaginationButton = (pageNumber, buttonNumber, isActive = false) => {
        const button = document.createElement('button');
        button.className = `pagination-number pagination-button-${buttonNumber} ${isActive ? 'active' : 'non-active'}`;
        button.textContent = `${pageNumber}`;

        button.onclick = async () => {
            await fetchDataDependsOnTypeOfData(typeOfData, pageNumber, specifiedTag);
        }

        return button;
    }

    const createEllipsisButton = (targetPage) => {
        const button = document.createElement('button');
        button.className = "pagination-ellipsis-button";
        button.textContent = "...";

        button.onclick = async () => {
            await fetchDataDependsOnTypeOfData(typeOfData, targetPage, specifiedTag);
        }

        return button;
    }

    let buttonNumber = 1;

    if (totalPages <= 4) {
        for (let i = 1; i <= totalPages; i++) {
            const button = createPaginationButton(i, buttonNumber, i === currentPage);
            paginationNumbersContainer.appendChild(button);
            buttonNumber++;
        }
    } else {
        if (currentPage <= 3) {
            for (let i = 1; i <= 4; i++) {
                const button = createPaginationButton(i, buttonNumber, i === currentPage);
                paginationNumbersContainer.appendChild(button);
                buttonNumber++;
            }

            paginationNumbersContainer.appendChild(createEllipsisButton(totalPages));
        } else if (currentPage > totalPages - 3) {
            paginationNumbersContainer.appendChild(createEllipsisButton(1))

            for (let i = totalPages - 3; i <= totalPages; i++) {
                const button = createPaginationButton(i, buttonNumber, i === currentPage);
                paginationNumbersContainer.appendChild(button);
                buttonNumber++;
            }
        } else {
            paginationNumbersContainer.appendChild(createEllipsisButton(1))

            for (let i = currentPage - 1; i <= currentPage + 2; i++) {
                const button = createPaginationButton(i, buttonNumber, i === currentPage);
                paginationNumbersContainer.appendChild(button);
                buttonNumber++;
            }

            paginationNumbersContainer.appendChild(createEllipsisButton(totalPages))
        }
    }
}

async function fetchDataDependsOnTypeOfData(typeOfData, pageNumber, specifiedTag = "") {
    switch (typeOfData) {
        case "userPosts": {
            await fetchUserPosts(pageNumber);
            localStorage.setItem("myPostsPaginationNumber", `${pageNumber}`);
            break;
        }
        case "dashboardForYouPosts": {
            await fetchRandomPostsForUser(pageNumber);
            localStorage.setItem("dashboardForYouPaginationNumber", `${pageNumber}`);
            break;
        }
        case "dashboardYourTagsPosts": {
            await fetchPostsWithUserFollowedTags(pageNumber);
            localStorage.setItem("dashboardYourTagsPaginationNumber", `${pageNumber}`);
            break;
        }
        case "recent": {
            await fetchPostsForUserDiscoverSection(typeOfData, pageNumber, specifiedTag);
            localStorage.setItem(`discoverRecent${specifiedTag}PaginationNumber`, `${pageNumber}`);
            break;
        }
        case "theBest": {
            await fetchPostsForUserDiscoverSection(typeOfData, pageNumber, specifiedTag);
            localStorage.setItem(`discoverTheBest${specifiedTag}PaginationNumber`, `${pageNumber}`);
            break;
        }
        case "popular": {
            await fetchPostsForUserDiscoverSection(typeOfData, pageNumber);
            localStorage.setItem("discoverPopularPaginationNumber", `${pageNumber}`);
            break;
        }
        case "recentForYou": {
            await fetchPostsForUserDiscoverSection(typeOfData, pageNumber);
            localStorage.setItem("discoverRecentForYousPaginationNumber", `${pageNumber}`);
            break;
        }
        case "startPageDiscover": {
            await getPostsForNonLoggedInUser(specifiedTag, pageNumber);
            localStorage.setItem(`startPageDiscover${specifiedTag}PaginationNumber`, `${pageNumber}`);
            break;
        }
    }
}