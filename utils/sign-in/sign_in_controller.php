<?php

declare(strict_types=1);

function is_input_empty(string $nickname, string $password): bool {
    if (empty($nickname) || empty($password)) {
        return true;
    } else {
        return false;
    }
}

function is_nickname_wrong(object $pdo, string $nickname): bool {
    if (!get_user($pdo, $nickname)) {
        return true;
    }  else {
        return false;
    }
}

function is_password_wrong(object $pdo, string $nickname, string $password): bool {
    if (!check_credentials($pdo, $nickname, $password)) {
        return true;
    } else {
        return false;
    }
}

function get_user_data(object $pdo, string $nickname): array {
    return get_user($pdo, $nickname);
}