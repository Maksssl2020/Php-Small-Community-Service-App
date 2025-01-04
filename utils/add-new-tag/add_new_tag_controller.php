<?php

function is_tag_name_empty(string $tag_name): bool {
    if (empty($tag_name)) {
        return true;
    } else {
        return false;
    }
}

function is_tag_file_empty(array $tag_file): bool {
    if ($tag_file == null) {
        return true;
    } else {
        return false;
    }
}

function is_tag_name_exists(object $pdo, string $tag_name): bool {
    if (get_tag_name($pdo, $tag_name)) {
        return true;
    } else {
        return false;
    }
}

function create_tag(object $pdo, string $tag_name, string $tag_file): void {
    set_tag($pdo, $tag_name, $tag_file);
}