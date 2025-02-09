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

    public function getFewRandomTagsForUser(int $userId): array {
        $followedTags = $this->findUserFollowedTagsData($userId);

        if (empty($followedTags)) {
            $query = "
            SELECT name FROM `flickit-db`.tags 
            ORDER BY RAND()
            LIMIT 4
            ";

            $statement = $this->connection->prepare($query);
            $statement->execute();
        } else {
            $tagIds = array_column($followedTags, 'tagId');

            $query = "
            SELECT name FROM `flickit-db`.tags 
            WHERE id 
            NOT IN (" . implode(',', array_fill(0, count($tagIds), '?')) . ")
            ORDER BY RAND()
            LIMIT 4
            ";

            $statement = $this->connection->prepare($query);
            $statement->execute(array_values($tagIds));
        }

        return $statement->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getTagDataByName(string $tagName): array {
        $tagId = $this->getTagIdByTagName($tagName);

        $query = "
        SELECT t.id AS tagId, t.name, COALESCE(COUNT(p.id), 0) AS latestCreatedPosts, COALESCE(COUNT(uft.tagId), 0) AS tagFollowers
        FROM `flickit-db`.tags t
        LEFT JOIN `flickit-db`.post_tags pt ON t.id = pt.tagId
        LEFT JOIN `flickit-db`.posts p ON pt.postId = p.id AND p.createdAt >= DATE_SUB(NOW(), INTERVAL 1 DAY)
        LEFT JOIN `flickit-db`.user_followed_tags uft ON t.id = uft.tagId
        WHERE t.id = :tagId
        GROUP BY t.id, t.name;
        ";

        $statement = $this->connection->prepare($query);
        $statement->bindParam(":tagId", $tagId, PDO::PARAM_INT);
        $statement->execute();

        return $statement->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getUserFollowedTags(string $userId): array {
        $followedTags = $this->findUserFollowedTagsData($userId);

        if (empty($followedTags)) {
            return [];
        }

        $tagIds = array_column($followedTags, 'tagId');
        $query = "
            SELECT t.id AS tagId, t.name, COALESCE(COUNT(p.id), 0) AS latestCreatedPosts 
            FROM `flickit-db`.tags t
            LEFT JOIN `flickit-db`.post_tags pt ON t.id = pt.tagId
            LEFT JOIN `flickit-db`.posts p ON pt.postId = p.id AND p.createdAt >= DATE_SUB(NOW(), INTERVAL 1 DAY)
            WHERE t.id IN (" . implode(',', array_fill(0, count($tagIds), '?')) . ")
            GROUP BY t.id, t.name;
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
        $query = "
            SELECT t.id AS tagId, t.name, COALESCE(COUNT(uft.tagId), 0) AS tagFollowers
            FROM `flickit-db`.tags t
            LEFT JOIN `flickit-db`.user_followed_tags uft ON t.id = uft.tagId
            GROUP BY t.id, t.name
            ORDER BY t.name DESC;
        ";
        $statement = $this->connection->prepare($query);
        $statement->execute();

        return $statement->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getPopularTags(): array {
        $query = "    
            SELECT t.name, COUNT(*) AS totalUse
            FROM `flickit-db`.post_tags pt
            JOIN `flickit-db`.tags t ON pt.tagId = t.id
            GROUP BY  pt.tagId, t.name
            ORDER BY totalUse DESC
            LIMIT 8;
        ";
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
        $query = "INSERT INTO `flickit-db`.tags (name, isMain, tagType) VALUES (:name, false, 'user')";
        $statement = $this->connection->prepare($query);
        $statement->bindParam(':name', $data['tagName']);
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