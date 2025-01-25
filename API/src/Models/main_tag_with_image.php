<?php

namespace models;
class TagWithImage implements JsonSerializable
{
    public int $id;
    public string $name;
    public string $image;

    public function __construct(int $id, string $name, string $image)
    {
        $this->id = $id;
        $this->name = $name;
        $this->image = $image;
    }

    public function jsonSerialize(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'imageUrl' => $this->image,
        ];
    }

    public function __toString(): string
    {
        return "id" . $this->id . ":name" . $this->name;
    }
}