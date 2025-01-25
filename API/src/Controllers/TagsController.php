<?php

namespace Controllers;

use Repositories\AuthenticationRepository;
use Repositories\TagsRepository;

class TagsController {

    public function __construct(private TagsRepository $tagsRepository){
    }

    public function processRequest(string $method, string $action, ?string $id): void{
        if ($method === 'POST') {
            $this->processCollectionRequest($action);
        } else {
            http_response_code(405);
            header("Allow: POST");
        }
    }

    protected function processCollectionRequest(string $action): void{}

}