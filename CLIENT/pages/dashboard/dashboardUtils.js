import {fetchRandomPostsForUser, fetchUserPosts} from "./dashboardApiFunctions.js";

export function getPostIdFromIdAttribute(id) {
    const splitId = id.split('-');

    if (splitId.length > 1) {
        return splitId[1];
    }

    return id;
}

export function updatePagination(totalPages, currentPage, typeOfData) {
    const paginationNumbersContainer = document.getElementById('paginationNumbers');
    paginationNumbersContainer.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.className = i === currentPage ? "pagination-number active" : "pagination-number non-active";
        button.textContent = `${i}`;

        setClickEventListenerDependsOnButtonTypeOfData(button, i, typeOfData);

        paginationNumbersContainer.appendChild(button);
    }
}

function setClickEventListenerDependsOnButtonTypeOfData(button, pageNumber, typeOfData) {
    switch (typeOfData) {
        case "userPosts": {
            button.onclick = async () => {
                await fetchUserPosts(pageNumber);
                localStorage.setItem("userPostsPaginationNumber", `${pageNumber}`);
            }
            break;
        }
        case "dashboardPaginationNumber": {
            button.onclick = async () => {
                await fetchRandomPostsForUser(pageNumber);
                localStorage.setItem("dashboardPaginationNumber", `${pageNumber}`);
            }
            break;
        }
    }
}