<?php

if($_SERVER['REQUEST_METHOD'] == 'POST'){
    $userId = $_POST['userId'];
    $nickname = $_POST['nickname'] ?? null;
    $email = $_POST['email'] ?? null;


    try {
        require_once('../db/dbh.php');
        require_once('users_model.php');
        require_once('users_controller.php');
        require_once('../sign-up/sign_up_model.php');
        require_once('../sign-up/sign_up_controller.php');

        global $pdo;

        $errors = [];

        if (no_data_to_update_provided($email, $nickname)) {
            $errors[] = 'No data to update!';
        }
        if (is_user_id_empty($userId)) {
            $errors[] = "User ID cannot be empty";
        }
        if ($nickname && is_username_empty($nickname)) {
            $errors[] = "Nickname cannot be empty";
        }
        if ($email && is_email_empty($email)) {
            $errors[] = "Email cannot be empty";
        }
        if ($nickname && is_nickname_taken($pdo,$nickname)) {
            $errors[] = "Chosen nickname is already taken";
        }
        if ($email && is_email_registered($pdo,$email)) {
            $errors[] = "Email is already registered";
        }

        if ($errors) {
            echo json_encode(['success'=>false,'errors' => $errors]);
            exit;
        }

        $messages = [];

        $pdo->beginTransaction();
        if ($nickname) {
            $messages[] = update_user_nickname($pdo,$userId,$nickname);
        }
        if ($email) {
            $messages[] = update_user_email($pdo,$userId,$email);
        }
        $pdo->commit();

        echo json_encode(['success'=>true,'messages' => $messages]);
        exit;
    } catch (PDOException $exception) {
        echo json_encode(['success'=>false, 'errors' => [$exception->getMessage()]]);
        exit;
    }
}