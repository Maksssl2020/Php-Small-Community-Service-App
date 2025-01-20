<?php


function is_user_id_empty(int $user_id): bool {
    return $user_id < 1;
}

function is_avatar_url_empty(string $url): bool {
    return empty($url);
}

function is_avatar_image_empty(array $image): bool {
    return empty($image);
}

function upload_avatar_url(PDO $pdo, int $userId, string $url): void
{
     set_avatar_url($pdo, $userId, $url);
}

function upload_avatar_image(PDO $pdo, int $userId, array $image): void
{
     set_avatar_image($pdo, $userId, $image);
}