<?php

function find_url_content(string $url): array {
    $html = file_get_contents($url);

    preg_match('/<meta property="og:image" content="(.*?)"/i', $html, $imageMatches);
    preg_match('/<meta property="og:title" content="(.*?)"/i', $html, $titleMatches);
    preg_match('/<meta property="og:description" content="(.*?)"/i', $html, $descriptionMatches);

    return [
        'title' => $titleMatches[1] ?? null,
        'description' => $descriptionMatches[1] ?? null,
        'image' => $imageMatches[1] ?? null,
    ];
}