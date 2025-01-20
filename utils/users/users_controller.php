<?php

function no_data_to_update_provided(?string $email, ?string $nickname): bool{
    return empty($email) && empty($nickname);
}

function is_user_id_empty(int $user_id): bool {
    return empty($user_id);
}

function is_email_empty(string $email): bool{
    return empty($email);
}

function is_username_empty(string $username): bool{
    return empty($username);
}

function find_user_by_id(PDO $pdo, int $userId): User {
    return get_user_data_by_id($pdo, $userId);
}

function update_user_nickname(PDO $pdo, int $userId, string $nickname): string {
    return update_user_nickname_by_user_id($pdo, $userId, $nickname);
}

function update_user_email(PDO $pdo, int $userId, string $email): string {
    return update_user_email_by_user_id($pdo, $userId, $email);
}
