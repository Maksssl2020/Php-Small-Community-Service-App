<?php

namespace Models;
use DateTime;
use JsonSerializable;

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

    public function getId(): int {
        return $this->id;
    }

    public function getUserNickname(): string {
        return $this->userNickname;
    }

    public function getUserEmail(): string {
        return $this->userEmail;
    }

    public function getCreatedAt(): DateTime {
        return $this->createdAt;
    }

    public function getUserRole(): string {
        return $this->userRole;
    }

    public function getAvatarUrl(): ?string {
        return $this->avatarUrl;
    }

    public function getAvatarImage(): ?string {
        return $this->avatarImage;
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