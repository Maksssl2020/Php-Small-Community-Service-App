<?php

class TagWithImage implements JsonSerializable {
    public int $id;
    public string $name;
    public string $image;

    public function __construct(int $id, string $name, string $image) {
        $this->id = $id;
        $this->name = $name;
        $this->image = $image;
    }

    public function getId(): int
    {
        return $this->id;
    }

    public function setId(int $id): void
    {
        $this->id = $id;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function setName(string $name): void
    {
        $this->name = $name;
    }
    public function jsonSerialize(): array {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'imageUrl' => $this->image,
        ];
    }

    public function __toString(): string {
        return "id".$this->id.":name".$this->name;
    }
}