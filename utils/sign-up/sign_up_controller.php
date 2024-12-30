<?php

declare(strict_types=1);

function is_input_empty(string $nickname, string $email, string $password): bool {
    if (empty($nickname) || empty($email) || empty($password)) {
        return true;
    } else {
        return false;
    }
}

function is_email_invalid(string $email): bool {
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        return true;
    } else {
        return false;
    }
}

function is_password_invalid(string $password): bool {
    if (strlen($password) < 8) {
        return true;
    } else {
        return false;
    }
}

function is_nickname_taken(object $pdo, string $nickname): bool {
    if (get_nickname($pdo, $nickname)) {
        return true;
    } else {
        return false;
    }
}

function is_email_registered(object $pdo, string $email): bool {
    if (get_email($pdo, $email)) {
        return true;
    } else {
        return false;
    }
}

function create_user(object $pdo, string $nickname, string $email, string $password): void {
    set_user($pdo, $nickname, $email, $password);
}