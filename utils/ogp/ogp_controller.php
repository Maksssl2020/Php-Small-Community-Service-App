<?php

function is_url_empty(string $url):bool {
    if (empty($url)) {
        return true;
    } else {
        return false;
    }
}

function is_url_invalid(string $url):bool {
    if (filter_var($url, FILTER_VALIDATE_URL) === false) {
        return true;
    } else {
        return false;
    }
}

function get_url_content(string $url): array {
    return find_url_content($url);
}