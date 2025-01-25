<?php
declare(strict_types=1);
namespace Repositories;

use PDO;

class UserRepository extends BaseRepository {
    public function getAllUsers(): array {
        $query = "SELECT * FROM `flickit-db`.users";
        $stmt = $this->connection->query($query);
        $users = [];

        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $users[] = $row;
        }

        return $users;
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

    public function getUser(string $id): array | false {
        $query = "SELECT * FROM `flickit-db`.`users` WHERE id = :id";
        $stmt = $this->connection->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function updateUser(array $current, array $new): int {
        $query = "UPDATE `flickit-db`.`users` 
                  SET nickname = :nickname, email = :email, password = :password, role = :role, avatarUrl = :avatarUrl, avatarImage = :avatarImage
                  WHERE id = :id 
                    ";

        $password = $current['password'];

        $stmt = $this->connection->prepare($query);
        $stmt->bindValue(':nickname', $new['nickname'] ?? $current['nickname']);
        $stmt->bindValue(':email', $new['email'] ?? $current['email']);
        $stmt->bindValue(':role', $new['role'] ?? $current['role']);
        $stmt->bindValue(':avatarUrl', $new['avatarUrl'] ?? $current['avatarUrl']);
        $stmt->bindValue(':avatarImage', $new['avatarImage'] ?? $current['avatarImage']);
        $stmt->bindValue(':id', $current['id']);

        if (!empty($new['password'])) {
            $password = $this->hashPassword($new['password']);
        }

        $stmt->bindValue(':password',  $password);

        $stmt->execute();

        return $stmt->rowCount();
    }

    public function deleteUser(string $id): int {
        $query = "DELETE FROM `flickit-db`.`users` WHERE id = :id";
        $stmt = $this->connection->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->rowCount();
    }

    private function hashPassword(string $password): string {
        $options = [
            'cost' => 12
        ];
        return password_hash($password, PASSWORD_BCRYPT, $options);
    }
}