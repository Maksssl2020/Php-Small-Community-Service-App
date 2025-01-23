<?php


function is_user_not_logged_in(int $userId): bool {
    return empty($userId);
}

function is_post_id_empty(?int $postId): bool {
    return empty($postId);
}

function get_post_likes(PDO $pdo, int $postId): int {
    return get_post_likes_by_post_id($pdo, $postId);
}

function add_like_to_post(PDO $pdo, int $postId, int $userId): void {
    add_like_to_post_by_user($pdo, $postId, $userId);
}

function is_post_liked_by_user(PDO $pdo, int $userId, int $postId): bool {
    return check_is_post_liked_by_user($pdo, $postId, $userId);
}