<?php


function get_tag_id(string $tag_name): int|null {
    try {
        require_once('../db/dbh.php');
        require_once('tags_model.php');
        require_once('tags_controller.php');

        global $pdo;

        if (is_tag_name_empty($tag_name)) {
            return null;
        }

        return get_tag_id_by_tag_name($pdo, $tag_name);
    } catch (PDOException $exception) {
        error_log($exception->getMessage());
        return null;
    }
}