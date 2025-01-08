<?php

function set_text_post(object $pdo, int $user_id, string $title, string $content): int {
    $query = "INSERT INTO `flickit-db`.posts (userId, type, title, content) VALUES (:userId, 'text', :title, :content)";
    $statement = $pdo->prepare($query);
    $statement->bindParam(':userId', $user_id);
    $statement->bindParam(':title', $title);
    $statement->bindParam(':content', $content);
    $statement->execute();

    return $pdo->lastInsertId();
}

function set_post_tags(object $pdo, int $post_id, array $tags): void {
    require_once('../tags/get_tag_id.php');

    $query = "INSERT INTO `flickit-db`.post_tags (postId, tagId) VALUES (?, ?)";
    $statement = $pdo->prepare($query);

    foreach ($tags as $tag) {
        $tagId = get_tag_id($tag);
        $statement->execute([$post_id, $tagId]);
    }
}

function amount_of_user_posts(PDO $pdo, int $user_id): int {
    $query = "SELECT COUNT(*) FROM `flickit-db`.`posts` WHERE `userId` = :user_id";
    $statement = $pdo->prepare($query);
    $statement->bindParam(':user_id', $user_id);
    $statement->execute();

    return $statement->fetchColumn();
}

function fetch_user_posts(PDO $pdo, int $user_id): array {
    require_once('../models/dashboard_post.php');

    $query = "SELECT * FROM `flickit-db`.`posts` WHERE userId = :user_id";
    $statement = $pdo->prepare($query);
    $statement->bindParam(':user_id', $user_id, PDO::PARAM_INT);
    $statement->execute();
    $posts = $statement->fetchAll(PDO::FETCH_ASSOC);

    if (empty($posts)) {
        return [];
    }

    $postIds = array_column($posts, 'id');
    $allTags = get_posts_tags($pdo, $postIds);
    $allImages = get_posts_images($pdo, $postIds);

    $dashboardPosts = [];

    foreach ($posts as $post) {
        $postId = $post['id'];
        $postType = $post['type'];

        $foundTags = $allTags[$postId] ?? [];
        $foundPostImages = ($postType === 'image') ? ($allImages[$postId] ?? []) : [];;

        $dashboardPost = new DashboardPost(
            $postId,
            $post['userId'],
            $postType,
            $post['title'],
            $post['content'],
            $post['linkUrl'],
            DateTime::createFromFormat('Y-m-d H:i:s', $post['createdAt']),
            $foundTags,
            $foundPostImages
        );

        error_log($dashboardPost);
        $dashboardPosts[] = $dashboardPost;
    }

    return $dashboardPosts;
}

function get_posts_tags(PDO $pdo, array $post_ids): array {
    require_once '../models/tag.php';

    if (empty($post_ids)) {
        return [];
    }

    $placeholders = implode(',', array_fill(0, count($post_ids), '?'));
    $query = "
        SELECT pt.postId, t.id, t.name
        FROM `flickit-db`.`post_tags` pt
        JOIN `flickit-db`.`tags` t ON t.id = pt.tagId
        WHERE pt.postId IN ($placeholders)
    ";

    $statement = $pdo->prepare($query);
    $statement->execute($post_ids);
    $results = $statement->fetchAll(PDO::FETCH_ASSOC);

    $tagsByPostId = [];

    foreach ($results as $row) {
        $tagObject = new Tag($row['id'], $row['name']);
        $tagsByPostId[$row['postId']][] = $tagObject;

       error_log($tagObject);
    }

    return $tagsByPostId;
}

function get_posts_images(PDO $pdo, array $post_ids): array {
    require_once('../models/post_image.php');

    if (empty($post_ids)) {
        return [];
    }

    $placeholders = implode(',', array_fill(0, count($post_ids), '?'));
    $query = "SELECT * FROM `flickit-db`.post_images WHERE postId IN ($placeholders)";

    $statement = $pdo->prepare($query);
    $statement->execute($post_ids);
    $results = $statement->fetchAll(PDO::FETCH_ASSOC);

    $imagesByPostId = [];
    foreach ($results as $row) {
        $imageObject = new PostImage($row['id'], $row['postId'], $row['linkUrl'], $row['createdAt']);
        $imagesByPostId[$row['postId']][] = $imageObject;
    }

    return $imagesByPostId;
}