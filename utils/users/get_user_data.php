<?php

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $userId = $_POST['userId'];

    try {
        require_once('../db/dbh.php');
        require_once('users_model.php');
        require_once('users_controller.php');

        global $pdo;

        $errors = [];

        if (is_user_id_empty($userId)) {
            $errors = "User ID cannot be empty.";
        }

        if ($errors) {
            echo json_encode(['success'=>false, 'errors' => $errors]);
            exit;
        }

        $foundUser = find_user_by_id($pdo, $userId);

        echo json_encode(['success'=>true, 'data' => $foundUser]);
        exit;

    } catch (PDOException $exception) {
        echo json_encode(['success'=>false, 'errors' => ['Database connection error: ' . $exception->getMessage()]]);
        exit;
    }
}