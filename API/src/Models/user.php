<?php

namespace models;
class User implements JsonSerializable
{
    private int $id;
    private string $userNickname;
    private string $userEmail;
    private DateTime $createdAt;
    private string $userRole;
    private ?string $avatarUrl;
    private ?string $avatarImage;

    public function __construct(int $id, string $userNickname, string $userEmail, DateTime $createdAt, string $userRole, ?string $avatarUrl, ?string $avatarImage)
    {
        $this->id = $id;
        $this->userNickname = $userNickname;
        $this->userEmail = $userEmail;
        $this->createdAt = $createdAt;
        $this->userRole = $userRole;
        $this->avatarUrl = $avatarUrl;
        $this->avatarImage = $avatarImage;
    }

    public function jsonSerialize(): array
    {
        return [
            'id' => $this->id,
            'userNickname' => $this->userNickname,
            'userEmail' => $this->userEmail,
            'createdAt' => $this->createdAt,
            'userRole' => $this->userRole,
            'avatarUrl' => $this->avatarUrl,
            'avatarImage' => $this->avatarImage ? base64_encode($this->avatarImage) : null
        ];
    }
}