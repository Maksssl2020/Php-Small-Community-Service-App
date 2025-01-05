<?php

try {
    require_once('../db/dbh.php');
    require_once('start_model.php');
    require_once('start_Controller.php');


    $fetchedTags = fetch_main_tags($pdo);


    echo json_encode(['success' => true, 'data' => $fetchedTags], JSON_PRETTY_PRINT);
    exit;
} catch (PDOException $exception) {
    echo json_encode(['success' => false, 'errors' => ['Database error: ' . $exception->getMessage()]]);
    exit;
}