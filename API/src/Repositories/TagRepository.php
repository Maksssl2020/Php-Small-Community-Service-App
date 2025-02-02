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

    public function getUserNotFollowedTags(string $userId): array {
        $followedTags = $this->findUserFollowedTagsData($userId);

        if (empty($followedTags)) {
            return $this->getAllTags();
        }

        $tagIds = array_column($followedTags, 'tagId');
        $query = "
            SELECT name FROM `flickit-db`.tags 
            WHERE id 
            NOT IN (" . implode(',', array_fill(0, count($tagIds), '?')) . ")
            ";
        $statement = $this->connection->prepare($query);
        $statement->execute(array_values($tagIds));

        return $statement->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getUserFollowedTags(string $userId): array {
        $followedTags = $this->findUserFollowedTagsData($userId);

        if (empty($followedTags)) {
            return [];
        }

        $tagIds = array_column($followedTags, 'tagId');
        $query = "
            SELECT name FROM `flickit-db`.tags 
            WHERE id 
            IN (" . implode(',', array_fill(0, count($tagIds), '?')) . ")
            ";
        $statement = $this->connection->prepare($query);
        $statement->execute(array_values($tagIds));

        return $statement->fetchAll(PDO::FETCH_ASSOC);
    }

    public function findUserFollowedTagsData(string $userId): array {
        $followedTagsQuery = "SELECT * FROM `flickit-db`.user_followed_tags WHERE userId = :userId";
        $followedTagsStatement = $this->connection->prepare($followedTagsQuery);
        $followedTagsStatement->bindParam(":userId", $userId, PDO::PARAM_INT);
        $followedTagsStatement->execute();

        return $followedTagsStatement->fetchAll();
    }

    public function countUserFollowedTags(string $userId): int {
        $query = "SELECT COUNT(*) FROM `flickit-db`.user_followed_tags WHERE userId = :userId";
        $statement = $this->connection->prepare($query);
        $statement->bindParam(":userId", $userId, PDO::PARAM_INT);
        $statement->execute();

        return $statement->fetchColumn();
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

    public function followTag(string $userId, array $data): void {
        $tagId = $this->getTagIdByTagName($data['tagName']);
        $query = "INSERT INTO `flickit-db`.user_followed_tags (userId, tagId) VALUES (:userId, :tagId)";
        $statement = $this->connection->prepare($query);
        $statement->bindParam(':userId', $userId, PDO::PARAM_INT);
        $statement->bindParam(':tagId', $tagId, PDO::PARAM_INT);
        $statement->execute();
    }

    public function unfollowTag(string $userId, array $data): void {
        $tagId = $this->getTagIdByTagName($data['tagName']);
        $query = "DELETE FROM `flickit-db`.user_followed_tags WHERE userId = :userId && tagId = :tagId";
        $statement = $this->connection->prepare($query);
        $statement->bindParam(':userId', $userId, PDO::PARAM_INT);
        $statement->bindParam(':tagId', $tagId, PDO::PARAM_INT);
        $statement->execute();
    }

    public function isTagFollowedByUser(string $userId, string $tagName): bool {
        $tagId = $this->getTagIdByTagName($tagName);
        $query = "SELECT COUNT(*) FROM `flickit-db`.user_followed_tags WHERE userId = :userId AND tagId = :tagId";
        $statement = $this->connection->prepare($query);
        $statement->bindParam(":userId", $userId, PDO::PARAM_INT);
        $statement->bindParam(":tagId", $tagId, PDO::PARAM_INT);
        $statement->execute();

        return $statement->fetchColumn() > 0;
    }

    public function getTagIdByTagName(string $tagName): ?int {
        $query = "SELECT id FROM `flickit-db`.tags WHERE LOWER(name) = lower(:tagName) LIMIT 1";
        $statement = $this->connection->prepare($query);
        $statement->bindParam(':tagName', $tagName);
        $statement->execute();

        $tagId = $statement->fetchColumn();
        return $tagId !== false ? (int)$tagId : null;
    }
}