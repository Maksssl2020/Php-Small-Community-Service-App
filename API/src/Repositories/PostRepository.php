<?php

namespace Repositories;

use Database;
use DateTime;
use Models\Like;
use Models\Post;
use Models\PostImage;
use Models\Tag;
use PDO;

class PostRepository extends BaseRepository {
    public function __construct(Database $database, private readonly TagRepository $tagRepository) {
        parent::__construct($database);
    }

    public function postExists(string $postId): bool {
        $query = "SELECT COUNT(*) FROM `flickit-db`.posts WHERE id = :postId";
        $statement = $this->connection->prepare($query);
        $statement->bindParam(':postId', $postId);
        $statement->execute();

        return $statement->fetchColumn() > 0;
    }

    public function getUserPosts(string $userId): array {
        $query = "SELECT * FROM `flickit-db`.posts WHERE userId = :userId";
        $statement = $this->connection->prepare($query);
        $statement->bindParam(":userId", $userId);
        $statement->execute();
        $posts = $statement->fetchAll();

        if (empty($posts)) {
            return [];
        }


        return $this->getPostsData($posts);
    }

    public function getDiscoveredPostsBasedOnChosenTag(string $specifiedTag): array {
        $postsIds = $this->getPostsIdsBasedOnChosenTag($specifiedTag);

        if (empty($postsIds)) {
            return [];
        }

        $fetchPostsQuery = "
            SELECT * 
            FROM `flickit-db`.posts 
            WHERE id IN (" . implode(',', array_fill(0, count($postsIds), '?')) . ")
        ";

        $statement = $this->connection->prepare($fetchPostsQuery);
        $statement->execute($postsIds);
        $posts = $statement->fetchAll(PDO::FETCH_ASSOC);

        return $this->getPostsData($posts);
    }

    public function getDiscoverPostsForUser(string $userId, bool $recent): array {
        if ($recent) {
            $posts = $this->getDashboardPostsForUser($userId);

            usort($posts, function (Post $a, Post $b) {
                return $b->getCreatedAt() <=> $a->getCreatedAt();
            });

            return $posts;
        } else {
            $query = "
                SELECT p.*, 
                (SELECT COUNT(*) FROM `flickit-db`.likes WHERE postId = p.id) AS like_count
                FROM `flickit-db`.posts p
                WHERE p.userId != :userId
                ORDER BY like_count DESC
            ";
            $statement = $this->connection->prepare($query);
            $statement->bindParam(":userId", $userId, PDO::PARAM_INT);
            $statement->execute();
            $posts = $statement->fetchAll();

            return $this->getPostsData($posts);
        }
    }

    public function getDiscoverPostsForUserBasedOnChosenTag(string $userId, string $specifiedTag, bool $recent): array {
        $postsIds = $this->getPostsIdsBasedOnChosenTag($specifiedTag);

        if (empty($postsIds)) {
            return [];
        }

        $fetchPostsQuery = "
            SELECT p.*, 
            (SELECT COUNT(*) FROM `flickit-db`.likes WHERE postId = p.id) AS like_count
            FROM `flickit-db`.posts p
            WHERE p.id IN (" . implode(',', array_fill(0, count($postsIds), '?')) . ")
            AND p.userId != ?
            ORDER BY like_count DESC
        ";

        $statement = $this->connection->prepare($fetchPostsQuery);
        $params = array_merge($postsIds, [$userId]);
        $statement->execute($params);
        $posts = $statement->fetchAll();

        if (empty($posts)) {
            return [];
        }

        $postsModels = $this->getPostsData($posts);

        if ($recent) {
            usort($postsModels, function (Post $a, Post $b) {
                return $b->getCreatedAt() <=> $a->getCreatedAt();
            });
        }

        return $postsModels;
    }

    private function getPostsIdsBasedOnChosenTag(string $specifiedTag): array {
        $tagId = $this->tagRepository->getTagIdByTagName($specifiedTag);

        if (empty($tagId)) {
            return [];
        }

        $findPostsIdWithChosenTagQuery = "
            SELECT DISTINCT postId FROM
            `flickit-db`.post_tags
            WHERE tagId = :tagId
        ";

        $statement = $this->connection->prepare($findPostsIdWithChosenTagQuery);
        $statement->bindParam(':tagId', $tagId, PDO::PARAM_INT);
        $statement->execute();

        return $statement->fetchAll(PDO::FETCH_COLUMN);
    }

    public function getDashboardPostsForUser(string $userId): array {
        $query = "SELECT * FROM `flickit-db`.posts WHERE userId != :userId";
        $statement = $this->connection->prepare($query);
        $statement->bindParam(":userId", $userId);
        $statement->execute();
        $posts = $statement->fetchAll();

        if (empty($posts)) {
            return [];
        }

        return $this->getPostsData($posts);
    }

    public function getDashboardPostsByFollowedTags(string $userId): array {
        $followedTags = $this->tagRepository->findUserFollowedTagsData($userId);

        if (empty($followedTags)) {
            return [];
        }

        $tagIds = array_column($followedTags, 'tagId');

        $getPostsWhichContainsFollowedTag = "
            SELECT DISTINCT postId 
            FROM `flickit-db`.post_tags 
            WHERE tagId IN (" . implode(',', array_fill(0, count($tagIds), '?')) . ")
        ";

        $statement = $this->connection->prepare($getPostsWhichContainsFollowedTag);
        $statement->execute($tagIds);
        $postsIds = $statement->fetchAll(PDO::FETCH_COLUMN);

        if (empty($postsIds)) {
            return [];
        }

        $fetchPostsQuery = "
            SELECT * 
            FROM `flickit-db`.posts 
            WHERE id IN (" . implode(',', array_fill(0, count($postsIds), '?')) . ")
        ";

        $statement = $this->connection->prepare($fetchPostsQuery);
        $statement->execute($postsIds);
        $posts = $statement->fetchAll(PDO::FETCH_ASSOC);

        if (empty($posts)) {
            return [];
        }

        return $this->getPostsData($posts);
    }

    public function getPostCreatorId(string $postId): int {
        $query = "SELECT userId FROM `flickit-db`.posts WHERE id = :postId";
        $statement = $this->connection->prepare($query);
        $statement->bindParam(":postId", $postId, PDO::PARAM_INT);
        $statement->execute();

        return $statement->fetchColumn();
    }

    public function getPostLikes(string $postId): array {
        $query = "SELECT id, postId, userId FROM `flickit-db`.likes WHERE postId = :postId";
        $statement = $this->connection->prepare($query);
        $statement->bindParam(":postId", $postId);
        $statement->execute();
        $postLikes = $statement->fetchAll();

        if (empty($postLikes)) {
            return [];
        }

        $likeModels = [];

        foreach ($postLikes as $like) {
            $likeModels[] = $this->createLikeModel($like);
        }

        return $likeModels;
    }

    private function createLikeModel(array $data): Like {
        return new Like(
            $data["id"],
            $data["postId"],
            $data["userId"],
        );
    }

    public function countPostLikes(string $postId): int {
        $query = "SELECT COUNT(*) FROM `flickit-db`.likes WHERE postId = :postId";
        $statement = $this->connection->prepare($query);
        $statement->bindParam(":postId", $postId);
        $statement->execute();

        return $statement->fetchColumn();
    }

    public function isPostLikedByUser(string $postId, string $userId): bool {
        $query = "SELECT COUNT(*) FROM `flickit-db`.likes WHERE postId = :postId AND userId = :userId";
        $statement = $this->connection->prepare($query);
        $statement->bindParam(":postId", $postId);
        $statement->bindParam(":userId", $userId);
        $statement->execute();

        return $statement->fetchColumn() > 0;
    }

    public function addUserLikeToPost(string $postId, string $userId): void {
        $query = "INSERT INTO `flickit-db`.likes (postId, userId) VALUES (:postId, :userId)";
        $statement = $this->connection->prepare($query);
        $statement->bindParam(":postId", $postId);
        $statement->bindParam(":userId", $userId);
        $statement->execute();
    }

    public function removeUserLikeToPost(string $postId, string $userId): void {
        $query = "DELETE FROM `flickit-db`.likes WHERE postId = :postId AND userId = :userId";
        $statement = $this->connection->prepare($query);
        $statement->bindParam(":postId", $postId);
        $statement->bindParam(":userId", $userId);
        $statement->execute();
    }

    public function addTextPost(array $data): int {
        $query = "INSERT INTO `flickit-db`.posts (userId, type, title, content) VALUES (:userId, 'text', :title, :content)";
        $statement = $this->connection->prepare($query);
        $statement->bindParam(':userId', $data['userId'], PDO::PARAM_INT);
        $statement->bindParam(':title', $data['title']);
        $statement->bindParam(':content', $data['content']);
        $statement->execute();

        return $this->connection->lastInsertId();
    }

    public function addPost(string $postType, array $data): int {
        $query = "INSERT INTO `flickit-db`.posts (userId, type, content) VALUES (:userId, :postType , :content)";
        $statement = $this->connection->prepare($query);
        $statement->bindParam(':userId', $data['userId'], PDO::PARAM_INT);
        $statement->bindParam(':postType', $postType);
        $statement->bindParam(':content', $data['content']);
        $statement->execute();

        return $this->connection->lastInsertId();
    }

    public function addPostImages(int $postId, array $imagesLinks): void {
        $query = "INSERT INTO `flickit-db`.post_images (postId, imageUrl) VALUES (?, ?)";
        $statement = $this->connection->prepare($query);

        foreach ($imagesLinks as $imageLink) {
            $statement->execute([$postId, $imageLink]);
        }
    }

    public function addPostLinks(int $postId, array $sitesLinks): void {
        $query = "INSERT INTO `flickit-db`.post_links (postId, link) VALUES (?, ?)";
        $statement = $this->connection->prepare($query);

        foreach ($sitesLinks as $siteLink) {
            $statement->execute([$postId, $siteLink]);
        }
    }

    public function deletePost(string $postId): void {
        $query = "DELETE FROM `flickit-db`.posts WHERE id = :postId";
        $statement = $this->connection->prepare($query);
        $statement->bindParam(":postId", $postId, PDO::PARAM_INT);
        $statement->execute();
    }

    private function getPostsData(array $posts): array {
        $postIds = array_column($posts, 'id');
        $allTags = $this->getPostTags($postIds);
        $allImages = $this->getPostImages($postIds);
        $allLinks = $this->getPostLinks($postIds);

        $dashboardPosts = [];

        foreach ($posts as $post) {
            $postId = $post['id'];
            $postType = $post['type'];

            $foundTags = $allTags[$postId] ?? [];
            $foundPostImages = ($postType === 'image') ? ($allImages[$postId] ?? []) : [];
            $foundPostLinks = ($postType === 'link') ? ($allLinks[$postId] ?? []) : [];

            $dashboardPost = $this->createPostModel($post, $foundTags, $foundPostImages, $foundPostLinks);

            $dashboardPosts[] = $dashboardPost;
        }

        return $dashboardPosts;
    }

    private function createPostModel(array $postData, ?array $foundTags, ?array $foundPostLinks, ?array $foundPostImages): Post {
        return new Post(
            $postData['id'],
            $postData['userId'],
            $postData['type'],
            $postData['title'],
            $postData['content'],
            $foundPostLinks,
            DateTime::createFromFormat('Y-m-d H:i:s', $postData['createdAt']),
            $foundTags,
            $foundPostImages
        );
    }

    private function getPostTags(array $postsIds): array {
        if (empty($postsIds)) {
            return [];
        }

        $placeholders = implode(',', array_fill(0, count($postsIds), '?'));
        $query = "
        SELECT pt.postId, t.id, t.name
        FROM `flickit-db`.`post_tags` pt
        JOIN `flickit-db`.`tags` t ON t.id = pt.tagId
        WHERE pt.postId IN ($placeholders)
    ";

        $statement = $this->connection->prepare($query);
        $statement->execute($postsIds);
        $results = $statement->fetchAll(PDO::FETCH_ASSOC);

        $tagsByPostId = [];

        foreach ($results as $row) {
            $tagObject = new Tag($row['id'], $row['name']);
            $tagsByPostId[$row['postId']][] = $tagObject;

            error_log($tagObject);
        }

        return $tagsByPostId;
    }

    private function getPostImages(array $postsIds): array {
        if (empty($postsIds)) {
            return [];
        }

        $placeholders = implode(',', array_fill(0, count($postsIds), '?'));
        $query = "SELECT * FROM `flickit-db`.post_images WHERE postId IN ($placeholders)";

        $statement = $this->connection->prepare($query);
        $statement->execute($postsIds);
        $results = $statement->fetchAll(PDO::FETCH_ASSOC);

        $imagesByPostId = [];
        foreach ($results as $row) {
            $imageObject = new PostImage($row['id'], $row['postId'], $row['imageUrl'], DateTime::createFromFormat('Y-m-d H:i:s', $row['createdAt']));
            $imagesByPostId[$row['postId']][] = $imageObject;
        }

        return $imagesByPostId;
    }

    private function getPostLinks(array $postsIds): array {
        if (empty($postsIds)) {
            return [];
        }

        $placeholders = implode(',', array_fill(0, count($postsIds), '?'));
        $query = "SELECT * FROM `flickit-db`.post_links WHERE postId IN ($placeholders)";

        $statement = $this->connection->prepare($query);
        $statement->execute($postsIds);
        $results = $statement->fetchAll(PDO::FETCH_ASSOC);

        $linksByPostId = [];

        foreach ($results as $row) {
            $linksByPostId[$row['postId']][] = $row['link'];
        }

        return $linksByPostId;
    }

}