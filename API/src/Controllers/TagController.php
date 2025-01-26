<?php

namespace Controllers;

use Repositories\AuthenticationRepository;
use Repositories\TagRepository;

class TagController {

    public function __construct(private TagRepository $tagRepository){
    }

    public function processRequest(string $method, string $action, ?string $id): void{
        if ($method == 'GET' && empty($id)) {
            $this->processCollectionGetRequest($action);
        } elseif ($method == "POST"  && empty($id)) {
            $this->processResourcePostRequest($action);
        } else {
            http_response_code(405);
            header("Allow: POST, GET");
        }
    }

    private function processResourcePostRequest(string $action): void{
        switch ($action) {
            case 'add-new-tag-by-admin': {
                $data = (array)json_decode(file_get_contents("php://input"), true);
                $errors = $this->getValidationErrors($data, $action);

                if (!empty($errors)) {
                    http_response_code(422);
                    echo json_encode(["success" => false, "errors" => $errors]);
                    break;
                }

                $tagType = $data['isMainTag'] ? 'main': 'default';

                $this->tagRepository->addNewTagByAdmin($data, $tagType);
                echo json_encode(["success" => true]);
                break;
            }
            case 'add-new-tag-by-user': {
                $data = (array)json_decode(file_get_contents("php://input"), true);
                $errors = $this->getValidationErrors($data, $action);

                if (!empty($errors)) {
                    http_response_code(422);
                    echo json_encode(["success" => false, "errors" => $errors]);
                    break;
                }

                $this->tagRepository->addNewTagByUser($data);
                echo json_encode(["success" => true]);
                break;
            }
        }
    }

    private function processCollectionGetRequest(string $action): void {
        switch ($action) {
            case 'get-main-tags': {
                echo json_encode(["success" => true, "data" => $this->tagRepository->getAllMainTags()]);
                break;
            }
            case 'get-all-tags': {
                echo json_encode(["success" => true, "data" => $this->tagRepository->getAllTags()]);
                break;
            }
        }
    }

    private function getValidationErrors(array $data, string $action): array  {
        $errors = [];

        if ('add-new-tag-by-admin' == $action && empty($data['isMainTag'])) {
            $errors[] = "You must specify that tag is main or not!";
        }

        if ('add-new-tag-by-admin' == $action && !empty($data['isMainTag']) && $data['isMainTag'] == true && empty($data['tagCoverUrl'])) {
            $errors[] = "For main tag you must add a tag cover url!";
        }

        if ('add-new-tag-by-user' || 'add-new-tag-by-admin' == $action && empty($data['tagName'])) {
            $errors[] = "Tag name cannot be empty!";
        }

        return $errors;
    }

}