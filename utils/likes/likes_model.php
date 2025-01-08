<?php

function get_post_likes_by_post_id(PDO $pdo, int $postId): int {
    $query = "SELECT COUNT(*) FROM `flickit-db`.likes WHERE postId = :postId";
    $statement = $pdo->prepare($query);
    $statement->bindParam(':postId', $postId, PDO::PARAM_INT);
    $statement->execute();

    return (int)$statement->fetchColumn();
}