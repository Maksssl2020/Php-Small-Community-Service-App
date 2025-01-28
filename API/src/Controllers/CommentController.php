<?php

namespace Controllers;

use Repositories\CommentRepository;

readonly class CommentController {

    public function __construct(private CommentRepository $commentRepository) {}

    public function processRequest(string $method, string $action, ?string $id): void {
        if ($method == "GET" && !empty($id)) {
            $this->processResourceGetRequestWithId($action, $id);
        } elseif ($method == 'POST' && !empty($id)) {
            $this->processResourcePostRequestWithId($action, $id);
        }
    }

    private function processResourceGetRequestWithId(string $action, string $id): void {
        switch ($action) {
            case 'get-post-comments': {
                echo json_encode(["success"=>true, "data"=>$this->commentRepository->getPostComments($id)]);
                break;
            }
            case "count-post-comments": {
                echo json_encode(["success"=>true, "data"=>$this->commentRepository->countPostComments($id)]);
                break;
            }
        }
    }

    private function processResourcePostRequestWithId(string $action, string $id): void {
        switch ($action) {
            case 'add-comment': {
                $data = (array)json_decode(file_get_contents("php://input"), true);
                $errors = $this->getValidationErrors($data, $action);

                if (!empty($errors)) {
                    http_response_code(422);
                    echo json_encode(["success" => false, "errors" => $errors]);
                    break;
                }

                echo json_encode(["success" => true, "id" =>  $this->commentRepository->addCommentToPost($id, $data)]);
                break;
            }
        }
    }

    private function getValidationErrors(array $data, string $action): array {
        $errors = [];

        if ($action == 'add-comment' && empty($data['content'])) {
            $errors[] = 'Comment content is required!';
        }

        if ($action == 'add-comment' && empty($data['userId'])) {
            $errors[] = 'User ID is required!';
        }

        return $errors;
    }
}