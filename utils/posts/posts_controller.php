<?php

function is_user_not_logged_in(?int $user_id): bool {
    if ($user_id == null) {
        return true;
    } else {
        return false;
    }
}

function user_does_not_have_added_posts(PDO $pdo, int $user_id): bool {
    if (amount_of_user_posts($pdo, $user_id) == 0) {
        return true;
    } else {
        return false;
    }
}

function is_post_invalid_depends_on_type(string $post_type, ?string $title, ?string $content, ?array $imagesLinks, ?array $sitesLinks): array {
    return match ($post_type) {
        'text' => is_text_post_invalid($title, $content),
        'image' => is_image_post_invalid($imagesLinks),
        'quote'=> is_quote_post_invalid($content),
        'link' => is_link_post_invalid($sitesLinks),
        default => ['Invalid post type!'],
    };
}

function is_text_post_invalid(?string $title, ?string $content): array {
    $errors = [];

    if (empty($title)) {
        $errors[] = 'Title cannot be empty!';
    }

    if (empty($content)) {
        $errors[] = 'Content cannot be empty!';
    }

    return $errors;
}

function is_image_post_invalid(?array $imagesLinks): array {
    return empty($imagesLinks) ? ['Post must contains at least one image link!'] : [];
}

function is_quote_post_invalid(?string $content): array {
    return empty($content) ? ['Post must contains at least one quote!'] : [];
}

function is_link_post_invalid(?array $sitesLinks): array {
    return empty($sitesLinks) ? ['Post must contains at least one site link!'] : [];
}

function create_post_depends_on_type(object $pdo, int $user_id, string $post_type, ?string $title, ?string $content, ?array $imagesLinks, ?array $sitesLinks, array $tags): void {
    $postId = null;

    switch ($post_type) {
        case 'text': {
            $postId = create_text_post($pdo, $user_id, $title, $content);
            break;
        }
        case 'image': {
            $postId = create_image_post($pdo, $user_id, $content);
            append_images_to_post($pdo, $postId, $imagesLinks);
            break;
        }
        case 'quote': {
            $postId = create_quote_post($pdo, $user_id, $content);
            break;
        }
        case 'link': {
            $postId = create_link_post($pdo, $user_id, $content);
            append_links_to_post($pdo, $postId, $sitesLinks);
            break;
        }
    }

    if (!empty($tags) && $postId != null) {
        append_tags_to_post($pdo, $postId, $tags);
    }
}

function create_text_post(object $pdo, int $user_id, string $title, string $content): int {
    return set_text_post($pdo, $user_id, $title, $content);
}

function create_image_post(object $pdo, int $user_id, ?string $content): int {
    return set_post($pdo, $user_id, 'image', $content);
}

function create_quote_post(object $pdo, int $user_id, ?string $content): int {
    return set_post($pdo, $user_id, 'quote', $content);
}

function create_link_post(object $pdo, int $user_id, ?string $content): int {
    return set_post($pdo, $user_id, 'link', $content);
}

function append_images_to_post(object $pdo, int $postId, array $imagesLinks): void {
    set_post_images($pdo, $postId, $imagesLinks);
}

function append_links_to_post(object $pdo, int $postId, array $imagesLinks): void {
    set_post_links($pdo, $postId, $imagesLinks);
}

function append_tags_to_post(object $pdo, int $post_id, array $tags): void {
    set_post_tags($pdo, $post_id, $tags);
}

function get_all_user_posts(PDO $pdo, int $user_id): array {
    return fetch_user_posts($pdo, $user_id);
}