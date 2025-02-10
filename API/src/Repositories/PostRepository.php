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
    private int $dashboardRowsPerPage = 6;
    private int $discoverRowsPerPage = 12;

    public function __construct(Database $database, private readonly TagRepository $tagRepository) {
        parent::__construct($database);
    }

    private function calculateStartIndexForPagination(int $pageNumber, bool $isDashboard): int {
        if ($isDashboard) {
            return ($pageNumber - 1) * $this->dashboardRowsPerPage;
        } else {
            return ($pageNumber - 1) * $this->discoverRowsPerPage;
        }
    }

    public function postExists(string $postId): bool {
        $query = "SELECT COUNT(*) FROM `flickit-db`.posts WHERE id = :postId";
        $statement = $this->connection->prepare($query);
        $statement->bindParam(':postId', $postId);
        $statement->execute();

        return $statement->fetchColumn() > 0;
    }

    public function updatePostData(Post $current, array $newPostData, string $postId): int {
        $query = "
            UPDATE `flickit-db`.posts 
            SET userId = :userId, type = :type, title = :title, content = :content, createdAt = :createdAt, updatedAt = NOW()
            WHERE id = :id
        ";
        $statement = $this->connection->prepare($query);
        $statement->bindValue(':userId', $current->getUserId());
        $statement->bindValue(':type', $current->getPostType());
        $statement->bindValue(':title', $newPostData['title'] ?? $current->getPostTitle());
        $statement->bindValue(':content', $newPostData['content'] ?? $current->getPostContent());
        $statement->bindValue(':createdAt', $current->getCreatedAt()->format('Y-m-d H:i:s'));
        $statement->bindValue(':id', $postId, PDO::PARAM_INT);
        $statement->execute();
        $affectedRows = $statement->rowCount();

        $postType = $current->getPostType();

        if ($postType == "image" && !empty($newPostData['imagesLinks'])) {
            $this->updatePostImages($postId, $newPostData['imagesLinks']);
        } elseif ($postType == "link" && !empty($newPostData["links"])) {
            $this->updatePostLinks($postId, $newPostData['links']);
        }

        if (!empty($newPostData["tags"])) {
            $this->updatePostTags($postId, $newPostData['tags']);
        }

        return $affectedRows;
    }

    private function updatePostImages(string $postId, array $postImages): void {
        $deleteCurrentImagesQuery = "DELETE FROM `flickit-db`.post_images WHERE postId = :postId";
        $statement = $this->connection->prepare($deleteCurrentImagesQuery);
        $statement->bindValue(':postId', $postId, PDO::PARAM_INT);
        $statement->execute();

        $this->addPostImages(intval($postId), $postImages);
    }

    private function updatePostLinks(string $postId, array $postLinks): void {
        $deleteCurrentLinksQuery = "DELETE FROM `flickit-db`.post_links WHERE postId = :postId";
        $statement = $this->connection->prepare($deleteCurrentLinksQuery);
        $statement->bindValue(':postId', $postId, PDO::PARAM_INT);
        $statement->execute();

        $this->addPostLinks(intval($postId), $postLinks);
    }

    private function updatePostTags(string $postId, array $postTags): void {
        $deleteCurrentTagsQuery = "DELETE FROM `flickit-db`.post_tags WHERE postId = :postId";
        $statement = $this->connection->prepare($deleteCurrentTagsQuery);
        $statement->bindValue(':postId', $postId, PDO::PARAM_INT);
        $statement->execute();

        $this->tagRepository->addPostTags(intval($postId), $postTags);
    }

    public function getPostData(string $postId): array {
        $query = "SELECT * FROM `flickit-db`.posts WHERE id = :postId";
        $statement = $this->connection->prepare($query);
        $statement->bindParam(':postId', $postId, PDO::PARAM_INT);
        $statement->execute();
        $result = $statement->fetch(PDO::FETCH_ASSOC);

        if (empty($result)) {
            return [];
        }

        return $this->getPostsData([$result]);
    }

    public function getUserPosts(string $userId, int $pageNumber): array {
        $startIndex = $this->calculateStartIndexForPagination($pageNumber, true);
        $rowsPerPage = $this->dashboardRowsPerPage;

        $query = "SELECT * FROM `flickit-db`.posts WHERE userId = :userId ORDER BY posts.createdAt DESC LIMIT $startIndex, $rowsPerPage";
        $statement = $this->connection->prepare($query);
        $statement->bindParam(":userId", $userId);
        $statement->execute();
        $posts = $statement->fetchAll();
        $totalPosts = $this->countUserPosts($userId);
        $totalPages = ceil($totalPosts / $rowsPerPage);

        if (empty($posts)) {
            return [];
        }

        return [
            'posts' => $this->getPostsData($posts),
            'totalPages' => $totalPages,
        ];
    }

    public function getPostsForUser(string $userId, int $pageNumber, bool $isDashboard = true): array {
        $startIndex = $this->calculateStartIndexForPagination($pageNumber, $isDashboard);
        $rowsPerPage = $isDashboard ? $this->dashboardRowsPerPage : $this->discoverRowsPerPage;

        $query = "SELECT * FROM `flickit-db`.posts WHERE userId != :userId LIMIT $startIndex, $rowsPerPage";
        $statement = $this->connection->prepare($query);
        $statement->bindParam(":userId", $userId);
        $statement->execute();
        $posts = $statement->fetchAll();
        $totalPosts = $isDashboard ? $this->countDashboardPostsForUser($userId) : $this->countDiscoverPostsForUser($userId);
        $totalPages = ceil($totalPosts / $rowsPerPage);

        return empty($posts) ? [
            'posts' => [],
            'totalPages' => $totalPages,
        ] : [
            'posts' => $this->getPostsData($posts),
            'totalPages' => $totalPages,
        ];
    }

    public function getDiscoveredPostsBasedOnChosenTag(string $specifiedTag, int $pageNumber): array {
        $postsIds = $this->getPostsIdsBasedOnChosenTag($specifiedTag);

        if (empty($postsIds)) {
            return [
                'posts' => [],
                'totalPages' => 0,
            ];
        }

        $inQuery = implode(',', array_fill(0, count($postsIds), '?'));
        $startIndex = $this->calculateStartIndexForPagination($pageNumber, false);
        $rowsPerPage = $this->discoverRowsPerPage;

        $fetchPostsQuery = "
            SELECT * 
            FROM `flickit-db`.posts 
            WHERE id IN ($inQuery)
            LIMIT $startIndex, $rowsPerPage
        ";


        $statement = $this->connection->prepare($fetchPostsQuery);
        $statement->execute($postsIds);
        $posts = $statement->fetchAll(PDO::FETCH_ASSOC);
        $totalPosts = count($postsIds);
        $totalPages = ceil($totalPosts / $rowsPerPage);

        return [
            'posts' => $this->getPostsData($posts),
            'totalPages' => $totalPages,
        ];
    }

    public function getDiscoverPostsForUser(string $userId, bool $recent, int $pageNumber): array {
        if ($recent) {
            $posts = $this->getPostsForUser($userId, $pageNumber, false);

            usort($posts['posts'], function (Post $a, Post $b) {
                return $b->getCreatedAt() <=> $a->getCreatedAt();
            });

            return $posts;
        } else {
            $startIndex = $this->calculateStartIndexForPagination($pageNumber, false);
            $rowsPerPage = $this->discoverRowsPerPage;

            $query = "
                SELECT p.*, 
                (SELECT COUNT(*) FROM `flickit-db`.likes WHERE postId = p.id) AS like_count
                FROM `flickit-db`.posts p
                WHERE p.userId != :userId
                ORDER BY like_count DESC
                Limit $startIndex, $rowsPerPage
            ";

            $statement = $this->connection->prepare($query);
            $statement->bindParam(":userId", $userId, PDO::PARAM_INT);
            $statement->execute();

            $posts = $statement->fetchAll();
            $totalPosts = $this->countDiscoverPostsForUser($userId);
            $totalPages = ceil($totalPosts / $rowsPerPage);

            return [
                "posts" => $this->getPostsData($posts),
                "totalPages" => $totalPages,
            ];
        }
    }

    private function countDiscoverPostsForUser(string $userId): int {
        $query = "SELECT COUNT(*) FROM `flickit-db`.posts WHERE userId != :userId";
        $statement = $this->connection->prepare($query);
        $statement->bindParam(":userId", $userId, PDO::PARAM_INT);
        $statement->execute();

        return $statement->fetchColumn();
    }

    public function getDiscoverPostsForUserBasedOnChosenTag(string $userId, string $specifiedTag, bool $recent, int $pageNumber): array {
        $postsIds = $this->getPostsIdsBasedOnChosenTag($specifiedTag);

        if (empty($postsIds)) {
            return [
                'posts' => [],
                'totalPages' => 0,
            ];
        }

        $inQuery = implode(',', array_fill(0, count($postsIds), '?'));
        $startIndex = $this->calculateStartIndexForPagination($pageNumber, false);
        $rowsPerPage = $this->discoverRowsPerPage;

        $fetchPostsQuery = "
            SELECT p.*, 
            (SELECT COUNT(*) FROM `flickit-db`.likes WHERE postId = p.id) AS like_count
            FROM `flickit-db`.posts p
            WHERE p.id IN ($inQuery)
            AND p.userId != ?
            ORDER BY like_count DESC
            LIMIT ?, ?
        ";

        $statement = $this->connection->prepare($fetchPostsQuery);
        $params = array_merge($postsIds, [$userId, $startIndex, $rowsPerPage]);
        $statement->execute($params);

        $posts = $statement->fetchAll();
        $totalPosts = count($postsIds);
        $totalPages = ceil($totalPosts / $rowsPerPage);

        if (!empty($posts)) {
            $postsModels = $this->getPostsData($posts);
        }

        if ($recent && !empty($posts)) {
            usort($postsModels, function (Post $a, Post $b) {
                return $b->getCreatedAt() <=> $a->getCreatedAt();
            });
        }

        return empty($posts) ? [
            'posts' => [],
            'totalPages' => $totalPages,
        ] : [
            "posts" => $postsModels,
            "totalPages" => $totalPages,
        ];
    }

    private function getPostsIdsBasedOnChosenTag(string $specifiedTag): array {
        $tagId = $this->tagRepository->getTagIdByTagName($specifiedTag);

        if (empty($tagId) || $tagId == 0) {
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

    public function getRandomPostForUserRadar(string $userId): ?Post {
        $query = "SELECT * FROM `flickit-db`.posts WHERE userId != :userId ORDER BY RAND() LIMIT 1";
        $statement = $this->connection->prepare($query);
        $statement->bindParam(":userId", $userId);
        $statement->execute();
        $post = $statement->fetch();

        if (empty($post)) {
            return null;
        }

        return $this->getPostsData(array($post))[0];
    }

    public function getDashboardPostsByFollowedTags(string $userId, int $pageNumber): array {
        $followedTags = $this->tagRepository->findUserFollowedTagsData($userId);

        if (empty($followedTags)) {
            return [
                "posts" => [],
                "totalPages" => 0,
            ];
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
            return [
                "posts" => [],
                "totalPages" => 0,
            ];
        }

        $startIndex = $this->calculateStartIndexForPagination($pageNumber, true);
        $rowsPerPage = $this->dashboardRowsPerPage;
        $inQuery = implode(',', array_fill(0, count($postsIds), '?'));

        $fetchPostsQuery = "
            SELECT * 
            FROM `flickit-db`.posts 
            WHERE id IN ($inQuery)
            LIMIT $startIndex, $rowsPerPage
        ";

        $statement = $this->connection->prepare($fetchPostsQuery);
        $statement->execute($postsIds);
        $posts = $statement->fetchAll(PDO::FETCH_ASSOC);
        $totalPosts = $this->countDashboardPostsForUser($userId);
        $totalPages = ceil($totalPosts / $rowsPerPage);

        return empty($posts) ? [
            'posts' => [],
            'totalPages' => $totalPages,
        ] : [
            'posts' => $this->getPostsData($posts),
            'totalPages' => $totalPages,
        ];
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

    public function getPostAuthorId(string $postId): int {
        $query = "SELECT `userId` FROM `flickit-db`.posts WHERE id = :postId";
        $statement = $this->connection->prepare($query);
        $statement->bindParam(":postId", $postId, PDO::PARAM_INT);
        $statement->execute();

        return $statement->fetchColumn();
    }

    private function countUserPosts(string $userId): int {
        $query = "SELECT COUNT(*) FROM `flickit-db`.posts WHERE userId = :userId";
        $statement = $this->connection->prepare($query);
        $statement->bindParam(":userId", $userId, PDO::PARAM_INT);
        $statement->execute();

        return $statement->fetchColumn();
    }

    private function countDashboardPostsForUser(string $userId): int {
        $query = "SELECT COUNT(*) FROM `flickit-db`.posts WHERE userId != :userId";
        $statement = $this->connection->prepare($query);
        $statement->bindParam(":userId", $userId, PDO::PARAM_INT);
        $statement->execute();

        return $statement->fetchColumn();
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

            $dashboardPost = $this->createPostModel($post, $foundTags, $foundPostLinks, $foundPostImages);

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