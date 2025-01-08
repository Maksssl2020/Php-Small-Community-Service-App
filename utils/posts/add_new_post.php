<?php

session_start();
$userId = $_SESSION['user_id'];

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $type = $_POST['postType'];
    $title = $_POST['postTitle'] ?? null;
    $content = $_POST['postContent'] ?? null;
    $linkUrl = $_POST['postLink'] ?? null;
    $tags = json_decode($_POST['postTags'] ?? '[]', true);

    try {
        require_once('../db/dbh.php');
        require_once('posts_model.php');
        require_once('posts_controller.php');

        $errors = [];

        if (is_user_not_logged_in($userId)) {
            $errors[] = 'You must be logged in!';
        }

        $errors = is_post_invalid_depends_on_type($type, $title, $content, $linkUrl);

        $pdo->beginTransaction();
        create_post_depends_on_type($pdo, $userId, $type, $title, $content, $linkUrl, $tags);
        $pdo->commit();

        if ($errors) {
            echo json_encode(['success' => false, 'errors' => $errors]);
            exit;
        }

        echo json_encode(['success' => true, 'message' => 'Added new post successfully!']);
        exit;
    } catch (PDOException $exception) {
        echo json_encode(['success' => false, 'errors' => ['Database connection error: ' . $exception->getMessage()]]);
        exit;
    }
}