<?php

function get_post_likes_by_post_id(PDO $pdo, int $postId): int {
    $query = "SELECT COUNT(*) FROM `flickit-db`.likes WHERE postId = :postId";
    $statement = $pdo->prepare($query);
    $statement->bindParam(':postId', $postId, PDO::PARAM_INT);
    $statement->execute();

    return (int)$statement->fetchColumn();
}

function add_like_to_post_by_user(PDO $pdo, int $postId, int $userId): void {
    $query = "INSERT INTO `flickit-db`.likes (postId, userId) VALUES (:postId, :userId)";
    $statement = $pdo->prepare($query);
    $statement->bindParam(':postId', $postId, PDO::PARAM_INT);
    $statement->bindParam(':userId', $userId, PDO::PARAM_INT);
    $statement->execute();
}

function check_is_post_liked_by_user(PDO $pdo, int $postId, int $userId): bool {
    $query = "SELECT COUNT(*) FROM `flickit-db`.likes WHERE postId = :postId AND userId = :userId";
    $statement = $pdo->prepare($query);
    $statement->bindParam(':postId', $postId, PDO::PARAM_INT);
    $statement->bindParam(':userId', $userId, PDO::PARAM_INT);
    $statement->execute();

    return $statement->fetchColumn() > 0;
}