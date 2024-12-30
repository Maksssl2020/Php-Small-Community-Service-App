<?php

declare(strict_types=1);

function get_nickname(object $pdo, string $nickname): bool {
    $query = "SELECT COUNT(*) FROM `flickit-db`.users WHERE nickname = :nickname";
    $statement = $pdo->prepare($query);
    $statement->bindParam(':nickname', $nickname);
    $statement->execute();

    return $statement->fetchColumn() > 0;
}

function get_email(object $pdo, string $email): bool {
    $query = "SELECT COUNT(*) FROM `flickit-db`.users WHERE email = :email";
    $statement = $pdo->prepare($query);
    $statement->bindParam(':email', $email);
    $statement->execute();

    return $statement->fetchColumn() > 0;
}

function set_user(object $pdo, string $nickname, string $email, string $password): void {
    $query = "INSERT INTO `flickit-db`.users (nickname, email, password) VALUES (:nickname, :email, :password)";
    $statement = $pdo->prepare($query);

    $options = [
        'cost' => 12
    ];
    $hashedPassword = password_hash($password, PASSWORD_BCRYPT, $options);

    $statement->bindParam(':nickname', $nickname);
    $statement->bindParam(':email', $email);
    $statement->bindParam(':password', $hashedPassword);
    $statement->execute();
}