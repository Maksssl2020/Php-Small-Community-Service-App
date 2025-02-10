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

export function arraysEqual(arr1, arr2) {
    console.log(arr1);
    console.log(arr2);

    if (arr1.length !== arr2.length) return false;
    return arr1.every((val, index) => val.trim() === arr2[index].trim());
}