<?php

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $tagName = $_POST['tagName'];
    $tagFile = $_FILES['tagFile'];

    error_log($tagName);

    try {
        require_once('../db/dbh.php');
        require_once('add_new_tag_model.php');
        require_once('add_new_tag_controller.php');

        $errors = [];

        if (is_tag_name_empty($tagName)) {
            $errors[] = "Tag name cannot be empty!";
        }

        if (is_tag_file_empty($tagFile)) {
            $errors[] = "Tag file cannot be empty!";
        }

        if (is_tag_name_exists($pdo, $tagName)) {
            $errors[] = "Tag name already exists!";
        }

        error_log($tagName);

        if ($errors) {
            echo json_encode(['success' => false, 'errors' => $errors]);
            exit;
        }



        $fileContent = file_get_contents($tagFile['tmp_name']);
        error_log("COŚ1");
        create_tag($pdo, $tagName, $fileContent);

        $pdo = null;
        $statement = null;

        echo json_encode(['success' => true, 'message' => 'Created new tag successfully!']);
        exit;
    } catch (PDOException $exception) {
        echo json_encode(['success' => false, 'errors' => ["Database error: " . $exception->getMessage()]]);
        exit;
    }
}