<?php

session_start();
header('Content-Type: application/json');
ini_set('display_errors', 1);
error_reporting(E_ALL);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode([
            'success' => false,
            'errors' => ['User not authenticated!']
        ], JSON_PRETTY_PRINT);
        exit;
    }

    $userId = $_SESSION['user_id'];
    $postId = $_POST['postId'];

    try {
        require_once('../db/dbh.php');
        require_once('likes_model.php');
        require_once('likes_controller.php');

        error_log($userId);
        error_log($postId);

        global $pdo;

        if (!$pdo) {
            echo json_encode(['success' => false, 'message' => 'Database connection failed']);
            exit;
        }

        $errors = [];

        if (is_user_not_logged_in($userId)) {
            $errors[] = 'You are not logged in!';
        }
        if (is_post_id_empty($postId)) {
            $errors[] = 'Post ID is empty!';
        }

        if ($errors) {
            echo json_encode(['success' => false, 'errors' => $errors]);
            exit;
        }

        add_like_to_post($pdo, $postId, $userId);

        echo json_encode(['success' => true, 'message' => 'Post has been liked!']);
        exit;

    }  catch (PDOException $exception) {
        echo json_encode([
            'success' => false,
            'errors' => ['Database connection error: ' . $exception->getMessage()]
        ], JSON_PRETTY_PRINT);
        exit;
    }
}
