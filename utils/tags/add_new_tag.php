<?php

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $tagName = $_POST['tagName'];
    $isMainTag = $_POST['isMainTag'];
    $subTag = $_POST['subTag'] ?? null;
    $tagCoverUrl = $_POST['tagCoverUrl'];

    try {
        require_once('../db/dbh.php');
        require_once('tags_model.php');
        require_once('tags_controller.php');

        $errors = [];

        if (is_tag_name_empty($tagName)) {
            $errors[] = "Tag name cannot be empty!";
        }

        if (!$isMainTag && is_sub_tag_empty($subTag)) {
            $errors[] = "Sub-tag cannot be empty!";
        }

        if (is_tag_cover_url_empty($tagCoverUrl)) {
            $errors[] = "Tag cover URL cannot be empty!";
        }

        if (is_tag_name_exists($pdo, $tagName)) {
            $errors[] = "Tag name already exists!";
        }

        error_log($tagName);

        if ($errors) {
            echo json_encode(['success' => false, 'errors' => $errors]);
            exit;
        }

        if ($isMainTag) {
            create_tag_without_sub_tag($pdo, $tagName, $tagCoverUrl);
        } else {
            create_tag_with_sub_tag($pdo, $tagName, $tagCoverUrl, $subTag);
        }

        error_log("COŚ2");

        $pdo = null;
        $statement = null;

        echo json_encode(['success' => true, 'message' => 'Created new tag successfully!']);
        exit;
    } catch (PDOException $exception) {
        echo json_encode(['success' => false, 'errors' => ["Database error: " . $exception->getMessage()]]);
        exit;
    }
}