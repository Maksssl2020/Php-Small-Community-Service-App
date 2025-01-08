<?php

class PostImage implements JsonSerializable {
    private int $id;
    private int $postId;
    private string $url;
    private DateTime $createdAt;

    public function __construct(int $id, int $postId, string $url, DateTime $createdAt){
        $this->id = $id;
        $this->postId = $postId;
        $this->url = $url;
        $this->createdAt = $createdAt;
    }

    public function jsonSerialize(): array {
        return [
            'id' => $this->id,
            'postId' => $this->postId,
            'url' => $this->url,
            'createdAt' => $this->createdAt,
        ];
    }
}