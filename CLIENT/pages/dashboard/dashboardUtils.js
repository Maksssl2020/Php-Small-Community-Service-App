import {
    fetchPostsForUserDiscoverSection,
    fetchPostsWithUserFollowedTags,
    fetchRandomPostsForUser,
    fetchUserPosts
} from "./dashboardApiFunctions.js";
import {paginationLeftArrow, paginationRightArrow} from "./dashboard.js";

export function getPostIdFromIdAttribute(id) {
    const splitId = id.split('-');

    if (splitId.length > 1) {
        return splitId[1];
    }

    return id;
}

export function updatePagination(totalPages, currentPage, typeOfData, specifiedTag = "") {
    const paginationNumbersContainer = document.getElementById('paginationNumbers');
    paginationNumbersContainer.innerHTML = '';

    paginationRightArrow.replaceWith(paginationRightArrow.cloneNode(true));
    paginationLeftArrow.replaceWith(paginationLeftArrow.cloneNode(true));
    const newPaginationRightArrow = document.getElementById('paginationRightArrow');
    const newPaginationLeftArrow = document.getElementById('paginationLeftArrow');

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

    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.className = i === currentPage ? "pagination-number active" : "pagination-number non-active";
        button.textContent = `${i}`;

        button.onclick = async () => {
            await fetchDataDependsOnTypeOfData(typeOfData, i, specifiedTag);
        }

        paginationNumbersContainer.appendChild(button);
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
    }
}