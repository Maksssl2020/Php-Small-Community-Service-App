<?php
declare(strict_types=1);
namespace Repositories;

use DateTime;
use Exception;
use Models\User;
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

    public function userExists(string $id): bool {
        $query = "SELECT COUNT(*) FROM `flickit-db`.`users` WHERE id = :id";
        $stmt = $this->connection->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchColumn() > 0;
    }

    public function getUser(string $id): User | false {
        $query = "SELECT * FROM `flickit-db`.`users` WHERE id = :id";
        $stmt = $this->connection->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        return new User($result['id'], $result['nickname'], $result['email'], DateTime::createFromFormat('Y-m-d H:i:s', $result['created_at']), $result['role'], $result['avatarUrl'], $result['avatarImage']);
    }

    public function updateUser(User $current, array $new): int {
        $query = "UPDATE `flickit-db`.`users` 
                  SET nickname = :nickname, email = :email, role = :role, avatarUrl = :avatarUrl, avatarImage = :avatarImage
                  WHERE id = :id 
                    ";

        $stmt = $this->connection->prepare($query);
        $stmt->bindValue(':nickname', $new['nickname'] ?? $current->getUserNickname());
        $stmt->bindValue(':email', $new['email'] ?? $current->getUserEmail());
        $stmt->bindValue(':role', $new['role'] ?? $current->getUserRole());
        $stmt->bindValue(':id', $current->getId());

        if (isset($new['avatarImage'])) {
            $avatarImage = $new['avatarImage'];
            if (str_starts_with($avatarImage, 'data:image/')) {
                $avatarImage = preg_replace('/^data:image\/\w+;base64,/', '', $avatarImage);
            }

            $decodedImage = base64_decode($avatarImage);
            $stmt->bindValue(':avatarImage', $decodedImage, PDO::PARAM_LOB);
            $stmt->bindValue(':avatarUrl', null, PDO::PARAM_NULL);
        }

        if (isset($new['avatarUrl'])) {
            $stmt->bindValue(':avatarUrl', $new['avatarUrl']);
            $stmt->bindValue(':avatarImage', null, PDO::PARAM_NULL);
        }

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