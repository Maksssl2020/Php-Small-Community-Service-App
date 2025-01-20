<?php

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $userId = $_POST['userId'];
    $avatarUrl = $_POST["avatarUrl"] ?? null;
    $avatarImage = $_FILES["avatarImage"] ?? null;

    try {
        require_once('../db/dbh.php');
        require_once('account_model.php');
        require_once('account_controller.php');

        global $pdo;

        $errors = [];

        if (is_user_id_empty($userId)) {
            $errors[] = "User ID cannot be empty.";
        }

        if ($avatarUrl && is_avatar_url_empty($avatarUrl)) {
            $errors[] = "Invalid image URL!";
        }

        if ($avatarImage && is_avatar_image_empty($avatarImage)) {
            $errors[] = "Invalid image!";
        }

        if ($errors) {
            echo json_encode(["success" => false, "errors" => $errors]);
            exit;
        }

        if ($avatarUrl) {
            upload_avatar_url($pdo, $userId, $avatarUrl);

            echo json_encode(["success" => true, "type" => 'url']);
        } else {
            upload_avatar_image($pdo, $userId, $avatarImage);

            echo json_encode(["success" => true, "type" => 'image']);
        }
        exit;

    } catch (PDOException $exception) {
        echo json_encode(["success" => false, "errors" => ['DB error: ' . $exception->getMessage()]]);
    }
}