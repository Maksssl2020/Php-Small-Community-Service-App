<?php

function set_avatar_url(PDO $pdo, int $userId, string $avatarUrl): void {
    $query = "UPDATE `flickit-db`.users SET avatarUrl = :avatarUrl, avatarImage = null WHERE id = :userId";
    $statement = $pdo->prepare($query);
    $statement->bindParam(':avatarUrl', $avatarUrl);
    $statement->bindParam(':userId', $userId, PDO::PARAM_INT);
    $statement->execute();
}

function set_avatar_image(PDO $pdo, int $userId, array $avatarImage): void {
    $imageData = file_get_contents($avatarImage['tmp_name']);
    $query = "UPDATE `flickit-db`.users SET avatarImage = :avatarImage, avatarUrl = null WHERE id = :userId";
    $statement = $pdo->prepare($query);
    $statement->bindParam(':avatarImage', $imageData, PDO::PARAM_LOB);
    $statement->bindParam(':userId', $userId, PDO::PARAM_INT);
    $statement->execute();
}