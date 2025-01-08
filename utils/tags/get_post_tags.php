<?php

function getPostTags(int $postId): array {
    try {
        require_once('../db/dbh.php');
        require_once('tags_model.php');
        require_once('tags_controller.php');

        if (empty($postId)) {
            return [];
        }

        return get_post_tags_by_post_id($pdo, $postId);
    } catch (PDOException $exception) {
        return [];
    }
}