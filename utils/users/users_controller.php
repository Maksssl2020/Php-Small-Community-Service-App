<?php

function is_user_id_empty(int $user_id): bool {
    if (empty($user_id)) {
        return true;
    } else {
        return false;
    }
}

function find_user_by_id(PDO $pdo, int $userId): User {
    return get_user_data_by_id($pdo, $userId);
}