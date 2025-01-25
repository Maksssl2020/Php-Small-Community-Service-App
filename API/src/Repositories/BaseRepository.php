<?php

namespace Repositories;

use Database;
use PDO;

class BaseRepository {
    protected PDO $connection;
    public function __construct(Database $database) {
        $this->connection = $database->getConnection();
    }
}