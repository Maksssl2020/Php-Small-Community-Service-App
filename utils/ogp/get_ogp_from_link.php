<?php

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $url = $_POST["url"] ?? null;


    try {
        require_once('ogp_model.php');
        require_once('ogp_controller.php');

        $errors = [];

        if (is_url_empty($url)) {
            $errors[] = "URL cannot be empty!";
        }

        if (is_url_invalid($url)) {
            $errors[] = "URL is not valid!";
        }

        if ($errors) {
            echo json_encode(['success' => false, 'errors' => $errors]);
            exit;
        }

        $response = get_url_content($url);

        echo json_encode(['success' => true, 'data' => $response]);
        exit;
    } catch (Exception $exception) {
        echo json_encode(['success' => false, 'errors' => ['Failed to fetch data.']]);
        exit;
    }
}