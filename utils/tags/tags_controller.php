<?php

function is_tag_name_empty(string $tag_name): bool {
    if (empty($tag_name)) {
        return true;
    } else {
        return false;
    }
}

function is_sub_tag_empty(string $sub_tag): bool {
    if (empty($sub_tag)) {
        return true;
    } else {
        return false;
    }
}

function is_tag_cover_url_empty(string $tag_cover): bool {
    if (empty($tag_cover)) {
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

function create_main_tag(object $pdo, string $tag_name, string $tag_cover_url): void {
    set_main_tag($pdo, $tag_name, $tag_cover_url);
}

function create_subtag(object $pdo, string $tag_name, string $tag_file, string $tag_cover_url): void {
    set_subtag($pdo, $tag_name, $tag_file, $tag_cover_url);
}

function create_user_tag(object $pdo, string $tag_name) {
    set_user_tag($pdo, $tag_name);
}

function get_main_tags_names(object $pdo): array {
    return get_main_tags($pdo);
}

function get_all_tags_names(object $pdo): array {
    return get_all_tags($pdo);
}