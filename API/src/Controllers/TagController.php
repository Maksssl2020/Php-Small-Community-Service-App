<?php

namespace Controllers;

use Repositories\AuthenticationRepository;
use Repositories\TagRepository;

readonly class TagController {

    public function __construct(private TagRepository $tagRepository){
    }

    public function processRequest(string $method, string $action, ?string $id): void{
        if ($method == 'GET' && empty($id)) {
            $this->processCollectionGetRequest($action);
        } elseif ($method == "GET" && !empty($id)) {
            $this->processResourceGetRequestWithId($action, $id);
        } elseif ($method == "POST"  && empty($id)) {
            $this->processResourcePostRequest($action);
        } elseif ($method == "POST" && !empty($id)) {
            $this->processResourcePostRequestWithId($action, $id);
        } elseif ($method == "DELETE" && !empty($id)) {
            $this->processResourceDeleteRequest($action, $id);
        } else {
            http_response_code(405);
            header("Allow: POST, GET");
        }
    }

    private function processResourceGetRequestWithId(string $action, string $id): void {
        switch ($action) {
            case 'get-user-followed-tags': {
                echo json_encode(['success' => true, 'data'=>$this->tagRepository->getUserFollowedTags($id)]);
                break;
            }
            case 'get-user-not-followed-tags': {
                echo json_encode(['success' => true, 'data'=>$this->tagRepository->getUserNotFollowedTags($id)]);
                break;
            }
            case 'count-user-followed-tags': {
                echo json_encode(['success' => true, 'data'=>$this->tagRepository->countUserFollowedTags($id)]);
                break;
            }
        }
    }

    private function processResourcePostRequestWithId(string $action, string $id): void {
        switch ($action) {
            case 'follow-tag': {
                $data = (array)json_decode(file_get_contents("php://input"), true);
                $errors = $this->getValidationErrors($data, $action, $id);

                if (!empty($errors)) {
                    http_response_code(422);
                    echo json_encode(["success" => false, "errors" => $errors]);
                    break;
                }

                $this->tagRepository->followTag($id, $data);
                echo json_encode(["success" => true, 'message'=>"Tag has been followed!"]);
                break;
            }
        }
    }

    private function processResourcePostRequest(string $action): void{
        switch ($action) {
            case 'add-new-tag-by-admin': {
                $data = (array)json_decode(file_get_contents("php://input"), true);
                $errors = $this->getValidationErrors($data, $action, null);

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
                $errors = $this->getValidationErrors($data, $action, null);

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

    private function processResourceDeleteRequest(string $action, string $id): void {
        switch ($action) {
            case 'unfollow-tag': {
                $data = (array)json_decode(file_get_contents("php://input"), true);
                $errors = $this->getValidationErrors($data, $action, $id);

                if (!empty($errors)) {
                    http_response_code(422);
                    echo json_encode(["success" => false, "errors" => $errors]);
                    break;
                }

                $this->tagRepository->unfollowTag($id, $data);
                echo json_encode(["success" => true, "message"=>"Tag has been unfollowed!"]);
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

    private function getValidationErrors(array $data, string $action, ?string $userId): array  {
        $errors = [];

        if ('add-new-tag-by-admin' == $action && empty($data['isMainTag'])) {
            $errors[] = "You must specify that tag is main or not!";
        }

        if ('add-new-tag-by-admin' == $action && !empty($data['isMainTag']) && $data['isMainTag'] == true && empty($data['tagCoverUrl'])) {
            $errors[] = "For main tag you must add a tag cover url!";
        }

        if (($action == 'add-new-tag-by-user' || $action == 'add-new-tag-by-admin') && empty($data['tagName'])) {
            $errors[] = "Tag name cannot be empty!";
        }

        if (($action == 'follow-tag' || $action == 'unfollow-tag') && empty($data['tagName'])) {
            if ($action == 'follow-tag') {
                $errors[] = "Tag name to follow cannot be empty!";
            } else {
                $errors[] = "Tag name to unfollow cannot be empty!";
            }
        }

        if ('follow-tag' == $action && !empty($data['tagName']) && $this->tagRepository->isTagFollowedByUser($userId, $data['tagName'])) {
            $errors[] = "That tag is already following by you!";
        }

        if ('unfollow-tag' == $action && !empty($data['tagName']) && !$this->tagRepository->isTagFollowedByUser($userId, $data['tagName'])) {
            $errors[] = "You don't follow that tag!";
        }

        return $errors;
    }

}