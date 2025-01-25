<?php

namespace Models;
use JsonSerializable;

class Tag implements JsonSerializable
{

    private int $id;
    private string $name;

    public function __construct(int $id, string $name)
    {
        $this->id = $id;
        $this->name = $name;
    }

    public function jsonSerialize(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
        ];
    }

    public function __toString(): string
    {
        return "id" . $this->id . ":name" . $this->name;
    }
}