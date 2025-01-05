<?php

function get_tag_name(object $pdo, string $tag_name): bool {
    $query = "SELECT COUNT(*) FROM `flickit-db`.tags WHERE name = :tagName";
    $statement = $pdo->prepare($query);
    $statement->bindParam(':tagName', $tag_name);
    $statement->execute();

    return $statement->fetchColumn() > 0;
}


function set_tag_without_sub_tag(object $pdo, string $tag_name, string $tag_cover_url): void {
    $query = "INSERT INTO `flickit-db`.tags (name, imageUrl, isMain) VALUES (:name, :imageUrl, true)";
    $statement = $pdo->prepare($query);

    $statement->bindParam(':name', $tag_name);
    $statement->bindParam('imageUrl', $tag_cover_url);

    try {
        $statement->execute();
        error_log("COŚ");
    } catch (PDOException $exception) {
        error_log($exception->getMessage());
        throw $exception;
    }
}

function set_tag_with_sub_tag(object $pdo, string $tag_name, string $tag_cover_url, string $sub_tag): void {
    $query = "INSERT INTO `flickit-db`.tags (name, imageUrl, isMain, subTagFor) VALUES (:name, :imageUrl, false, :subTagFor)";
    $statement = $pdo->prepare($query);

    $statement->bindParam(':name', $tag_name);
    $statement->bindParam(':imageUrl', $tag_cover_url);
    $statement->bindParam(':subTagFor', $sub_tag);

    try {
        $statement->execute();
        error_log("COŚ");
    } catch (PDOException $exception) {
        error_log($exception->getMessage());
        throw $exception;
    }
}

function get_main_tags(object $pdo): array {
    $query = "SELECT name FROM `flickit-db`.tags WHERE isMain=true ORDER BY name DESC";
    $statement = $pdo->prepare($query);
    $statement->execute();

    return $statement->fetchAll(PDO::FETCH_ASSOC);
}