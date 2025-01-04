<?php

function get_tag_name(object $pdo, string $tag_name): bool {
    $query = "SELECT COUNT(*) FROM `flickit-db`.tags WHERE name = :tagName";
    $statement = $pdo->prepare($query);
    $statement->bindParam(':tagName', $tag_name);
    $statement->execute();

    return $statement->fetchColumn() > 0;
}


function set_tag(object $pdo, string $tag_name, string $tag_file): void {
    $query = "INSERT INTO `flickit-db`.tags (name, image) VALUES (:name, :image)";
    $statement = $pdo->prepare($query);

    $statement->bindParam(':name', $tag_name);
    $statement->bindParam(':image', $tag_file, PDO::PARAM_LOB);

    try {
        $statement->execute();
        error_log("COŚ");
    } catch (PDOException $exception) {
        error_log($exception->getMessage());
        throw new Exception($exception->getMessage());
    }
}