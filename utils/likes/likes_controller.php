<?php

function is_post_id_empty(?int $postId): bool {
    if (empty($postId)) {
        return true;
    } else {
        return false;
    }
}

function get_post_likes(PDO $pdo, int $postId): int {
    return get_post_likes_by_post_id($pdo, $postId);
}