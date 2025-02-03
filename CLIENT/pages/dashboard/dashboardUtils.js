export function getPostIdFromIdAttribute(id) {
    const splitId = id.split('-');

    if (splitId.length > 1) {
        return splitId[1];
    }

    return id;
}