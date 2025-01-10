<?php

class DashboardPost implements JsonSerializable {
    private int $id;
    private int $userId;
    private string $postType;
    private ?string $postTitle;
    private ?string $postContent;
    private ?string $postLinkUrl;
    private DateTime $createdAt;
    private ?array $tags;
    private ?array $images;

    public function __construct(int $id, int $userId, string $postType, ?string $postTitle, ?string $postContent, ?string $postLinkUrl, DateTime $createdAt, ?array $tags, ?array $images) {
        $this->id = $id;
        $this->userId = $userId;
        $this->postType = $postType;
        $this->postTitle = $postTitle;
        $this->postContent = $postContent;
        $this->postLinkUrl = $postLinkUrl;
        $this->createdAt = $createdAt;
        $this->tags = $tags ?? [];
        $this->images = $images ?? [];
    }

    public function jsonSerialize(): array {
        return  [
            'id' => $this->id,
            'userId' => $this->userId,
            'postType' => $this->postType,
            'postTitle' => $this->postTitle,
            'postContent' => $this->postContent,
            'postLinkUrl' => $this->postLinkUrl,
            'createdAt' => $this->createdAt,
            'tags' => $this->tags ?? [],
            'images' => $this->images ?? [],
        ];
    }

    public function __toString(): string {
        return $this->postTitle.' - '.$this->postContent.' - '.$this->postLinkUrl.' - '.$this->createdAt->format('Y-m-d H:i:s').' - '.implode($this->tags).' - ';
    }
}