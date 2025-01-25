<?php

use models\TagWithImage;

require_once('../Models/main_tag_with_image.php');

function get_all_main_tags(object $pdo): array {
    $query = "SELECT id,name,imageUrl FROM `flickit-db`.tags WHERE isMain=true ORDER BY name DESC LIMIT 14";
    $statement = $pdo->prepare($query);
    $statement->execute();
    $mainTags = $statement->fetchAll(PDO::FETCH_ASSOC);

    $tagObjects = [];

    if (!empty($mainTags)) {
        foreach ($mainTags as $mainTag) {
            $tagWithImage = new TagWithImage($mainTag['id'], $mainTag['name'], $mainTag['imageUrl']);
            $tagObjects[] = $tagWithImage;
        }
    }

    return $tagObjects;
}