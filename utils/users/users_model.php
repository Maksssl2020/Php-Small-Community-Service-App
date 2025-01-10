<?php

function get_user_data_by_id(PDO $pdo, int $userId): User {
    require_once('../models/user.php');

    $query = "SELECT * FROM `flickit-db`.users WHERE id = :userId";
    $statement = $pdo->prepare($query);
    $statement->bindParam(':userId', $userId);
    $statement->execute();
    $result = $statement->fetch(PDO::FETCH_ASSOC);

    return new User($result['id'], $result['nickname'], $result['email'], DateTime::createFromFormat('Y-m-d H:i:s', $result['created_at']), $result['role'], $result['avatarUrl'], $result['avatarImage']);
}