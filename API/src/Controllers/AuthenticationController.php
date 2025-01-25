<?php

namespace Controllers;

use Repositories\AuthenticationRepository;

class AuthenticationController {
    public function __construct(private AuthenticationRepository $authenticationRepository){
    }

    public function processRequest(string $method, string $action, ?string $id): void{
        if ($method === 'POST') {
            $this->processAuthenticationRequest($action);
        } else {
            http_response_code(405);
            header("Allow: POST");
        }
    }

    public function processAuthenticationRequest(string $action): void {
        switch ($action) {
            case 'sign-up': {
                $data = (array)json_decode(file_get_contents("php://input"), true);
                $errors = $this->getValidationErrors($data);

                if (!empty($errors)) {
                    http_response_code(422);
                    echo json_encode(["success" => false, "errors" => $errors]);
                    break;
                }

                $id = $this->authenticationRepository->createUser($data);

                http_response_code(201);
                echo json_encode(["success" => true, "message" => "User created", "id" => $id]);
                break;
            }
            case 'sign-in': {
                $data = (array)json_decode(file_get_contents("php://input"), true);
                $errors = $this->getValidationErrors($data, false);

                if (!empty($errors)) {
                    http_response_code(401);
                    echo json_encode(["success" => false, "errors" => $errors]);
                    break;
                }

                $user = $this->authenticationRepository->getUser($data['nickname']);

                $newSessionId = hash('sha256', uniqid('sess_', true));
                $sessionId = $newSessionId . "_" . $user["id"];
                $sessionId = preg_replace('/[^A-Za-z0-9\-]/', '', $sessionId);

                session_write_close();
                session_id($sessionId);
                session_start();

                $_SESSION['user_id'] = $user["id"];
                $_SESSION['user_nickname'] = htmlspecialchars($user["nickname"]);
                $_SESSION['user_role'] = htmlspecialchars($user["role"]);
                $_SESSION["last_regeneration"] = time();

                echo json_encode(['success' => true, 'message' => 'Logged in successfully!']);
                break;
            }
            default: {
                http_response_code(405);
                header("Allow: sign-in, sign-up");
            }
        }
    }

    private function getValidationErrors(array $data, bool $isSigningUp = true): array {
        $errors = [];

        if (empty($data["nickname"])) {
            $errors[] = "Nickname is required!";
        }
        if ($isSigningUp && empty($data["email"])) {
            $errors[] = "Email is required!";
        }
        if (empty($data["password"])) {
            $errors[] = "Password is required!";
        }
        if (!empty($data['email']) && !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            $errors[] = "Entered e-mail is not valid!";
        }
        if ($isSigningUp && !empty($data['password']) && strlen($data['password']) < 8) {
            $errors[] = "Passwords must be at least 8 characters!";
        }
        if ($isSigningUp && !empty($data['nickname']) && $this->authenticationRepository->isNicknameTaken($data['nickname'])) {
            $errors[] = "Nickname is already taken!";
        }
        if ($isSigningUp && !empty($data['email']) && $this->authenticationRepository->isEmailTaken($data['email'])) {
            $errors[] = "Email is already taken!";
        }
        if (!$isSigningUp && !$this->authenticationRepository->checkCredentials($data["nickname"], $data["password"])) {
            $errors[] = "Invalid credentials!";
        }

        return $errors;
    }
}