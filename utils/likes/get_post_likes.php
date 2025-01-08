<?php

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $postId = $_POST['postId'];

    try {
        require_once('../db/dbh.php');
        require_once('likes_model.php');
        require_once('likes_controller.php');

        $errors = [];

        if (is_post_id_empty($postId)) {
            $errors = 'Post ID cannot be empty!';
        }

        if ($errors) {
            echo json_encode(['success' => false, 'errors' => $errors]);
            exit;
        }


        $postLikes = get_post_likes($pdo, $postId);

        echo json_encode(['success' => true, 'data'=>$postLikes]);
        exit;
    } catch (PDOException $exception) {
        echo json_encode(['success' => false, 'errors' => ['Database error: '. $exception->getMessage()]]);
        exit;
    }
}