<?php

if ($_SERVER["REQUEST_METHOD"] === "POST") {

    $nickname = $_POST["nickname"] ?? '';
    $email = $_POST["email"] ?? '';
    $password = $_POST["password"] ?? '';

    try {
        require_once('../db/dbh.php');
        require_once('sign_up_model.php');
        require_once('sign_up_controller.php');

        $errors = [];

        if (is_input_empty($nickname, $email, $password)) {
            $errors[] = "Fill in all fields!";
        }
        if (is_email_invalid($email)) {
            $errors[] = "Invalid email used!";
        }
        if (is_password_invalid($password)) {
            $errors[] = "Password's length must be at least 8 characters!";
        }
        if (is_nickname_taken($pdo, $nickname)) {
            $errors[] = "Username already taken!";
        }
        if (is_email_registered($pdo, $email)) {
            $errors[] = "Email already registered!";
        }

        require_once('../db/config_session.php');

        if ($errors) {
            echo json_encode(['success' => false, 'errors' => $errors]);
            exit;
        }

        create_user($pdo, $nickname, $email, $password);

        $pdo = null;
        $statement = null;

        echo json_encode(['success' => true, 'message' => 'Registration successful!']);;
        exit;
    } catch (PDOException $exception) {
        echo json_encode(['success' => false, 'errors' => ["Database error: " . $exception->getMessage()]]);
        exit;
    }

} else {
    header("Location: ../start.php");
    exit;
}