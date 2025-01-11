<?php

session_start();

if ($_SERVER["REQUEST_METHOD"] == "GET") {
    if (isset($_SESSION['user_id'])) {
        $user_id = $_SESSION['user_id'];

        echo json_encode(['success' => true, 'data' => $user_id]);
    } else {
        echo json_encode(['success' => false, 'errors' => ['User is not logged in!']]);
    }

    exit;
}