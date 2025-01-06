<?php

try {
    require_once('../db/dbh.php');
    require_once('tags_model.php');
    require_once('tags_controller.php');

    $allTags = get_all_tags_names($pdo);

    echo json_encode(['success' => true, 'data' => $allTags]);
    exit;
} catch (PDOException $exception) {
    echo json_encode(['success' => false, 'errors' => ["Database error: " . $exception->getMessage()]]);
    exit;
}