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
        $user = $this->getUserByNickname($nickname);

        if ($user) {
            return password_verify($password, $user["password"]);
        } else {
            return false;
        }
    }

    public function getUserByNickname(string $nickname): bool|array {
        $query = "SELECT * FROM `flickit-db`.users WHERE nickname = :nickname";
        $statement = $this->connection->prepare($query);
        $statement->bindParam(':nickname', $nickname);
        $statement->execute();

        return $statement->fetch(PDO::FETCH_ASSOC);
    }

    public function getUserByEmail(string $email): bool|array {
        $query = "SELECT * FROM `flickit-db`.users WHERE email = :email";
        $statement = $this->connection->prepare($query);
        $statement->bindParam(':email', $email);
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

    public function updateUserPassword(string $userId, string $password): void {
        $query = "UPDATE `flickit-db`.`users` SET password = :password WHERE id = :userId";
        $stmt = $this->connection->prepare($query);
        $stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
        $stmt->bindValue(':password', $this->hashPassword($password));
        $stmt->execute();
    }

    public function storeResetPasswordToken(string $userId, string $token): void {
        $expiresAt = date("Y-m-d H:i:s", strtotime("+30 minutes"));

        $query = "
        INSERT INTO `flickit-db`.password_resets (userId, token, expiresAt) 
        VALUES (:userId, :token, :expiresAt)
        ON DUPLICATE KEY UPDATE token = :updatedToken, expiresAt = :updatedExpiresAt
    ";

        $statement = $this->connection->prepare($query);
        $statement->bindParam(':userId', $userId, PDO::PARAM_INT);

        $hashedToken = password_hash($token, PASSWORD_BCRYPT);
        $statement->bindParam(':token', $hashedToken);
        $statement->bindParam(':updatedToken', $hashedToken);

        $statement->bindParam(':expiresAt', $expiresAt);
        $statement->bindParam(':updatedExpiresAt', $expiresAt);

        $statement->execute();
    }

    public function validateResetPasswordToken(string $token): ?int {
        $query = "SELECT userId FROM `flickit-db`.`password_resets` WHERE token = :token AND expiresAt > NOW()";
        $statement = $this->connection->prepare($query);
        $statement->bindParam(':token', $token);
        $statement->execute();
        $result = $statement->fetch(PDO::FETCH_ASSOC);

        return $result ? (int) $result["userId"] : null;
    }

    private function hashPassword(string $password): string {
        $options = [
            'cost' => 12
        ];
        return password_hash($password, PASSWORD_BCRYPT, $options);
    }
}
