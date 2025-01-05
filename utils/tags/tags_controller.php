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

function create_tag_without_sub_tag(object $pdo, string $tag_name, string $tag_cover_url): void {
    set_tag_without_sub_tag($pdo, $tag_name, $tag_cover_url);
}

function create_tag_with_sub_tag(object $pdo, string $tag_name, string $tag_file, string $tag_cover_url): void {
    set_tag_with_sub_tag($pdo, $tag_name, $tag_file, $tag_cover_url);
}

function get_main_tags_names(object $pdo): array {
    return get_main_tags($pdo);
}