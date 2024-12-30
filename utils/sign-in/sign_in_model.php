<?php


function check_credentials(object $pdo, string $nickname, string $password): bool {
    $result = get_user($pdo, $nickname);
    return password_verify($password, $result["password"]);
}

function get_user(object $pdo, string $nickname): bool|array {
    $query = "SELECT * FROM `flickit-db`.users WHERE nickname = :nickname";
    $statement = $pdo->prepare($query);
    $statement->bindParam(':nickname', $nickname);
    $statement->execute();

    return $statement->fetch(PDO::FETCH_ASSOC);
}