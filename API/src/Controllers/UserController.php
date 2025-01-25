<?php

namespace Controllers;

use Repositories\UserRepository;

class UserController
{

    public function __construct(private UserRepository $userRepository)
    {
    }

    public function processRequest(string $method, string $action, ?string $id): void
    {
        if ($id) {
            $this->processResourceRequest($method, $id);
        } else {
            $this->processCollectionRequest($method);
        }
    }

    private function processResourceRequest(string $method, string $id): void
    {
        $user = $this->userRepository->getUser($id);

        if (!$user) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'User not found!']);
            return;
        }

        switch ($method) {
            case 'GET':
            {
                echo json_encode(['success' => true, 'data' => $user]);
                break;
            }
            case "PATCH":
            {
                $data = (array)json_decode(file_get_contents("php://input"), true);

                $errors = $this->getValidationErrors($data, false);
                if (!empty($errors)) {
                    http_response_code(422);
                    echo json_encode(["success" => false, "errors" => $errors]);
                    break;
                }

                $rows = $this->userRepository->updateUser($user, $data);

                echo json_encode(["success" => true, "message" => "User $id updated", "rows" => $rows]);
                break;
            }
            case "DELETE":
            {
                $rows = $this->userRepository->deleteUser($id);
                echo json_encode(["success" => true, "message" => "User $id deleted", "rows" => $rows]);
                break;
            }
            default:
            {
                http_response_code(405);
                header("Allow: GET, PATCH, DELETE");
            }
        }
    }
    
    private function processCollectionRequest(string $method): void
    {
        switch ($method) {
            case "GET":
            {
                echo json_encode(["success" => true, "data" => $this->userRepository->getAllUsers()]);
                break;
            }
            default:
            {
                http_response_code(405);
                header("Allow: GET");
            }
        }
    }

    private function getValidationErrors(array $data, bool $isNew = true): array
    {
        $errors = [];

        if (!empty($data['email']) && !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            $errors[] = "Entered e-mail is not valid!";
        }
        if (!empty($data['password']) && strlen($data['password']) < 8) {
            $errors[] = "Passwords must be at least 8 characters!";
        }
        if (!empty($data['nickname']) && $this->userRepository->isNicknameTaken($data['nickname'])) {
            $errors[] = "Nickname is already taken!";
        }
        if (!empty($data['email']) && $this->userRepository->isEmailTaken($data['email'])) {
            $errors[] = "Email is already taken!";
        }

        return $errors;
    }
}