<?php

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nickname = $_POST['nickname'];
    $password = $_POST['password'];

    try {
        require_once('../db/dbh.php');
        require_once('sign_in_model.php');
        require_once('sign_in_controller.php');

        $errors = [];

        if (is_input_empty($nickname, $password)) {
            $errors[] = "Fill in all fields!";
        }
        if (is_nickname_wrong($pdo, $nickname) && is_password_wrong($pdo, $nickname, $password)) {
            $errors[] = "Invalid credentials!";
        }

        require_once('../db/config_session.php');
        $result = get_user_data($pdo, $nickname);

        $newSessionId = session_create_id();
        $sessionId = $newSessionId . "_" . $result["id"];
        session_write_close();
        session_id($sessionId);
        session_start();

        $_SESSION['user_id'] = $result["id"];
        $_SESSION['user_nickname'] = htmlspecialchars($result["nickname"]);
        $_SESSION['user_role'] = htmlspecialchars($result["role"]);
        $_SESSION["last_regeneration"] = time();

        $pdo = null;
        $statement = null;

        echo json_encode(['success' => true, 'message' => 'Logged in successfully!']);
        exit;

    } catch (PDOException $exception) {
        echo json_encode(['success' => false, 'error' =>["Database error: " . $exception->getMessage()]]);
        exit;
    }
} else {
    header("Location: ../start.php");
    exit;
}