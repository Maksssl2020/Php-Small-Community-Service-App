<?php

namespace Repositories;

use Models\TagWithImage;
use PDO;

class TagRepository extends BaseRepository {
    public function getAllMainTags(): array {
        $query = "SELECT * FROM `flickit-db`.tags WHERE isMain = true";
        $statement = $this->connection->prepare($query);
        $statement->execute();

        $tags = $statement->fetchAll(PDO::FETCH_ASSOC);
        $tagModels = array();

        foreach ($tags as $tag) {
            $tagModel = new TagWithImage($tag['id'], $tag['name'], $tag['imageUrl']);
            $tagModels[] = $tagModel;
        }

        return $tagModels;
    }

    public function getAllTags(): array {
        $query = "SELECT name FROM `flickit-db`.tags ORDER BY name DESC";
        $statement = $this->connection->prepare($query);
        $statement->execute();

        return $statement->fetchAll(PDO::FETCH_ASSOC);
    }

    public function addNewTagByAdmin(array $data, string $tagType): void {
        $query = "INSERT INTO `flickit-db`.tags (name, imageUrl, isMain, tagType) VALUES (:name, :imageUrl, :$tagType, :isMain)";
        $statement = $this->connection->prepare($query);
        $statement->bindParam(':name', $data['name']);
        $statement->bindParam(':imageUrl', $data['imageUrl']);
        $statement->bindParam(':tagType', $tagType);
        $statement->bindParam(':isMain', $data['isMain']);
        $statement->execute();
    }

    public function addNewTagByUser(array $data): void {
        $query = "INSERT INTO `flickit-db`.tags (name, isMain, tagType) VALUES (:name, 'user', :isMain)";
        $statement = $this->connection->prepare($query);
        $statement->bindParam(':name', $data['name']);
        $statement->bindParam(':isMain', $data['isMain']);
        $statement->execute();
    }

    public function addPostTags(int $postId, array $tags): void {
        $query = "INSERT INTO `flickit-db`.post_tags (postId, tagId) VALUES (?, ?)";
        $statement = $this->connection->prepare($query);

        foreach ($tags as $tag) {
            $tagId = $this->getTagIdByTagName($tag);
            $statement->execute([$postId, $tagId]);
        }
    }

    private function getTagIdByTagName(string $tagName): ?int {
        $query = "SELECT id FROM `flickit-db`.tags WHERE LOWER(name) = lower(:tagName) LIMIT 1";
        $statement = $this->connection->prepare($query);
        $statement->bindParam(':tagName', $tagName);
        $statement->execute();

        $tagId = $statement->fetchColumn();
        return $tagId !== false ? (int)$tagId : null;
    }
}