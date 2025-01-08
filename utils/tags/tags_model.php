<?php

function get_tag_name(object $pdo, string $tag_name): bool {
    $query = "SELECT COUNT(*) FROM `flickit-db`.tags WHERE name = :tagName";
    $statement = $pdo->prepare($query);
    $statement->bindParam(':tagName', $tag_name);
    $statement->execute();

    return $statement->fetchColumn() > 0;
}


function set_main_tag(object $pdo, string $tag_name, string $tag_cover_url): void {
    $query = "INSERT INTO `flickit-db`.tags (name, imageUrl, isMain, tagType) VALUES (:name, :imageUrl, true, 'main')";
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

function set_subtag(object $pdo, string $tag_name, string $tag_cover_url, string $sub_tag): void {
    $query = "INSERT INTO `flickit-db`.tags (name, imageUrl, isMain, subTagFor, tagType) VALUES (:name, :imageUrl, false, :subTagFor, 'subtag')";
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

function set_user_tag(object $pdo, string $tag_name): void {
    $query = "INSERT INTO `flickit-db`.tags (name, isMain, tagType) VALUES (:name, false, 'user')";
    $statement = $pdo->prepare($query);
    $statement->bindParam(':name', $tag_name);

    try {
        $statement->execute();
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

function get_all_tags(object $pdo): array {
    $query = "SELECT name FROM `flickit-db`.tags ORDER BY name DESC";
    $statement = $pdo->prepare($query);
    $statement->execute();

    return $statement->fetchAll(PDO::FETCH_ASSOC);
}

function find_tag_by_tag_name(object $pdo, string $tag_name): ?int {
    $query = "SELECT id FROM `flickit-db`.tags WHERE LOWER(name) = lower(:tagName) LIMIT 1";
    $statement = $pdo->prepare($query);
    $statement->bindParam(':tagName', $tag_name, PDO::PARAM_STR);
    $statement->execute();

    $tagId = $statement->fetchColumn();

    return $tagId !== false ? (int)$tagId : null;
}

function find_post_tags_by_post_id(PDO $pdo, int $post_id): array {
    require_once('../models/tag.php');

    $findTagsIdQuery = "SELECT * FROM `flickit-db`.post_tags WHERE post_id = :postId";
    $statement = $pdo->prepare($findTagsIdQuery);
    $statement->bindParam(':postId', $post_id, PDO::PARAM_INT);
    $statement->execute();
    $foundTagsId = $statement->fetchAll(PDO::FETCH_COLUMN);

    if (empty($foundTagsId)) {
        return [];
    }

    $placeholders = implode(',', array_fill(0, count($foundTagsId), '?'));
    $getTagsQuery = "SELECT id, name FROM `flickit-db`.tags WHERE id IN ($placeholders)";
    $foundTagsStatement = $pdo->prepare($getTagsQuery);
    $foundTagsStatement->execute(array_values($foundTagsId));

    $foundTags = [];

    while ($foundTag = $foundTagsStatement->fetch(PDO::FETCH_ASSOC)) {
        $tagObject = new Tag($foundTag['id'], $foundTag['name']);
        $foundTags[] = $tagObject;
    }

    return $foundTags;
}