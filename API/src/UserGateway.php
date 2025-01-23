<?php

class UserGateway {
    private PDO $connection;
    public function __construct(Database $database) {
        $this->connection = $database->getConnection();
    }

    public function getAllUsers(): array {
        $sql = "SELECT * FROM `flickit-db`.users";
        $stmt = $this->connection->query($sql);
        $users = [];

        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $users[] = $row;
        }

        return $users;
    }

    public function createUser(array $data): void {

    }
}