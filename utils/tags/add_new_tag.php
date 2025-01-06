<?php

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $tagName = $_POST['tagName'];
    $isMainTag = isset($_POST['isMainTag']) && $_POST['isMainTag'] == 'true';
    $subTag = $_POST['subTag'] ?? null;
    $tagCoverUrl = $_POST['tagCoverUrl'] ?? null;
    $tagType = '';

    if ($isMainTag) {
        $tagType = "main";
    } else if ($subTag != null) {
        $tagType = "subtag";
    } else {
        $tagType = "user";
    }

    try {
        require_once('../db/dbh.php');
        require_once('tags_model.php');
        require_once('tags_controller.php');

        $errors = [];

        if (is_tag_name_empty($tagName)) {
            $errors[] = "Tag name cannot be empty!";
        }

        if (!$isMainTag && $tagType == "subtag" && is_sub_tag_empty($subTag)) {
            $errors[] = "Sub-tag cannot be empty!";
        }

        if ($tagType != 'user' && is_tag_cover_url_empty($tagCoverUrl)) {
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
            create_main_tag($pdo, $tagName, $tagCoverUrl);
        } else if ($tagType == 'subtag') {
            create_subtag($pdo, $tagName, $tagCoverUrl, $subTag);
        } else {
            create_user_tag($pdo, $tagName);
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