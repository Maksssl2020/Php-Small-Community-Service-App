<?php

namespace Models;

use DateTime;
use JsonSerializable;

class Comment implements JsonSerializable {
    private int $id;
    private int $postId;
    private int $userId;
    private string $content;
    private DateTime $createdAt;

    public function __construct(int $id, int $postId, int $userId, string $content, DateTime $createdAt) {
        $this->id = $id;
        $this->postId = $postId;
        $this->userId = $userId;
        $this->content = $content;
        $this->createdAt = $createdAt;
    }

    public function jsonSerialize(): array {
        return [
            'id' => $this->id,
            'postId' => $this->postId,
            'userId' => $this->userId,
            'content' => $this->content,
            'createdAt' => $this->createdAt
        ];
    }
}