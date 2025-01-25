<?php

use models\User;

function get_user_data_by_id(PDO $pdo, int $userId): User {
    require_once('../Models/user.php');

    $query = "SELECT * FROM `flickit-db`.users WHERE id = :userId";
    $statement = $pdo->prepare($query);
    $statement->bindParam(':userId', $userId);
    $statement->execute();
    $result = $statement->fetch(PDO::FETCH_ASSOC);

    return new User($result['id'], $result['nickname'], $result['email'], DateTime::createFromFormat('Y-m-d H:i:s', $result['created_at']), $result['role'], $result['avatarUrl'], $result['avatarImage']);
}

function update_user_nickname_by_user_id(PDO $pdo, int $userId, string $nickname): string {
    $query = "UPDATE `flickit-db`.users SET nickname = :nickname WHERE id = :userId";
    $statement = $pdo->prepare($query);
    $statement->bindParam(':nickname', $nickname);
    $statement->bindParam(':userId', $userId);
    $statement->execute();

    return 'Nickname updated successfully!';
}

function update_user_email_by_user_id(PDO $pdo, int $userId, string $email): string {
    $query = "UPDATE `flickit-db`.users SET email = :email WHERE id = :userId";
    $statement = $pdo->prepare($query);
    $statement->bindParam(':email', $email);
    $statement->bindParam(':userId', $userId);
    $statement->execute();

    return 'Email updated successfully!';
}