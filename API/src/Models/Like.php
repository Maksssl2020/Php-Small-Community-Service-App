<?php

namespace Models;

use JsonSerializable;

class Like implements JsonSerializable {
    private int $id;
    private int $postId;
    private int $userId;

    public function __construct(int $id, int $postId, int $userId) {
        $this->id = $id;
        $this->postId = $postId;
        $this->userId = $userId;
    }


    public function jsonSerialize(): array {
        return [
            'id' => $this->id,
            'postId' => $this->postId,
            'userId' => $this->userId,
        ];
    }
}