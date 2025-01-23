<?php

session_start();
header('Content-Type: application/json');
ini_set('display_errors', 1);
error_reporting(E_ALL);

if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        'success' => false,
        'errors' => ['User not authenticated!']
    ], JSON_PRETTY_PRINT);
    exit;
}

$userId = $_SESSION['user_id'];

try {
    require_once('../db/dbh.php');
    require_once('posts_model.php');
    require_once('posts_controller.php');

    global $pdo;

    $errors = false;

    if (is_user_not_logged_in($userId)) {
        $errors = true;
    }

    if ($errors) {
        json_encode(['success' => false, 'errors' => ['Something went wrong...']]);
        exit;
    }

    $result = get_random_posts_for_user($pdo, $userId);
    echo json_encode(['success' => true, 'data' => $result], JSON_PRETTY_PRINT);
    exit;
} catch (PDOException $exception) {
    echo json_encode([
        'success' => false,
        'errors' => ['Database connection error: ' . $exception->getMessage()]
    ], JSON_PRETTY_PRINT);
    exit;
}