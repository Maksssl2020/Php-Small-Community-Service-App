export function getUserAvatar(avatarUrl, avatarImage) {
    let avatarSrc;

    if (avatarUrl != null) {
        avatarSrc = avatarUrl;
    } else if (avatarImage != null) {
        avatarSrc = `data:image/jpeg;base64,${avatarImage}`
    } else {
        avatarSrc = '../../assets/ghost_icon.jpeg';
    }

    return avatarSrc;
}

export function getPostIdFromIdAttribute(id) {
    const splitId = id.split('-');

    if (splitId.length > 1) {
        return splitId[1];
    }

    return id;
}