<?php

namespace Repositories;

use Database;
use PDO;

class AuthenticationRepository extends BaseRepository{
    public function createUser(array $data): string {
        $query = "INSERT INTO `flickit-db`.users (nickname, email, password) VALUES (:nickname, :email, :password)";
        $stmt = $this->connection->prepare($query);

        $stmt->bindParam(':nickname', $data['nickname']);
        $stmt->bindParam(':email', $data['email']);
        $stmt->bindValue(':password', $this->hashPassword($data['password']));
        $stmt->execute();

        return $this->connection->lastInsertId();
    }

    public function checkCredentials(string $nickname, string $password): bool {
        $user = $this->getUser($nickname);

        if ($user) {
            return password_verify($password, $user["password"]);
        } else {
            return false;
        }
    }

    public function getUser(string $nickname): bool|array {
        $query = "SELECT * FROM `flickit-db`.users WHERE nickname = :nickname";
        $statement = $this->connection->prepare($query);
        $statement->bindParam(':nickname', $nickname);
        $statement->execute();

        return $statement->fetch(PDO::FETCH_ASSOC);
    }

    public function isEmailTaken(string $email): bool {
        $query = "SELECT COUNT(*) FROM `flickit-db`.`users` WHERE email = :email";
        $stmt = $this->connection->prepare($query);
        $stmt->bindParam(':email', $email);
        $stmt->execute();

        return $stmt->fetchColumn() > 0;
    }

    public function isNicknameTaken(string $nickname): bool {
        $query = "SELECT COUNT(*) FROM `flickit-db`.`users` WHERE nickname = :nickname";
        $stmt = $this->connection->prepare($query);
        $stmt->bindParam(':nickname', $nickname);
        $stmt->execute();

        return $stmt->fetchColumn() > 0;
    }

    private function hashPassword(string $password): string {
        $options = [
            'cost' => 12
        ];
        return password_hash($password, PASSWORD_BCRYPT, $options);
    }
}
