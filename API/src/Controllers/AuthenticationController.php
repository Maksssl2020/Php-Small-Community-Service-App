<?php

namespace Controllers;
require("vendor/autoload.php");

use PHPMailer\PHPMailer\Exception;
use Random\RandomException;
use Repositories\AuthenticationRepository;
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;

class AuthenticationController {
    public function __construct(private AuthenticationRepository $authenticationRepository){
    }

    public function processRequest(string $method, string $action, ?string $id): void{
        if ($method === 'POST') {
            $this->processAuthenticationPostRequest($action);
        } elseif ($method === "DELETE") {
            $this->processLogoutRequest($action);
        } elseif ($method === "PUT" && $action == "update-password" && !empty($id)) {
            $this->processUpdatePasswordRequest($id);
        } else {
            http_response_code(405);
            header("Allow: POST");
        }
    }

    private function processLogoutRequest(string $action): void {
        switch ($action) {
            case "logout": {
                session_start();

                $_SESSION = [];

                session_destroy();

                echo json_encode(['success' => true, 'message' => 'Logged out successfully!']);
                break;
            }
        }
    }

    private function processAuthenticationPostRequest(string $action): void {
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

                $user = $this->authenticationRepository->getUserByNickname($data['nickname']);

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
            case "is-password-valid": {
                $data = (array)json_decode(file_get_contents("php://input"), true);

                $errors = $this->getValidationErrors($data, false);

                if (!empty($errors)) {
                    http_response_code(401);
                    echo json_encode(["success" => false, "errors" => $errors]);
                    break;
                }

                echo json_encode(["success" => true, "message" => "Password valid"]);
                break;
            }
            case "forgot-password": {
                $data = (array)json_decode(file_get_contents("php://input"), true);

                if (empty($data["email"])) {
                    http_response_code(401);
                    echo json_encode(["success" => false, "errors" => ["Email is required!"]]);
                    break;
                }

                $user = $this->authenticationRepository->getUserByEmail($data["email"]);

                if (!$user) {
                    http_response_code(401);
                    echo json_encode(["success" => false, "errors" => ["User not found!"]]);
                    break;
                }

                $ngrokUrl = file_get_contents("http://127.0.0.1:4040/api/tunnels");
                $ngrokData = json_decode($ngrokUrl, true);

                if (!isset($ngrokData["tunnels"][0]["public_url"])) {
                    http_response_code(500);
                    echo json_encode(["success" => false, "errors" => ["Failed to retrieve Ngrok URL!"]]);
                    break;
                }

                $publicUrl = $ngrokData["tunnels"][0]["public_url"];

                try {
                    $token = bin2hex(random_bytes(32));
                    $this->authenticationRepository->storeResetPasswordToken($user["id"], $token);
                    $resetLink = "$publicUrl/php-small-social-service-app/CLIENT/pages/reset-password/resetPassword.php?token=" . urlencode($token);
                    $mail = new PHPMailer(true);

                    $mail->isSMTP();
                    $mail->SMTPAuth = true;
                    $mail->Host = 'smtp.gmail.com';
                    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
                    $mail->Port = 587;
                    $mail->Username = "maksymilian.leszczynski2020@gmail.com";
                    $mail->Password = "mmzd lunr zndz nopv";
                    $mail->setFrom("maksymilian.leszczynski2020@gmail.com", "Flickit Support");
                    $mail->addAddress($user["email"]);
                    $mail->isHTML();
                    $mail->Subject = "Password Reset Request";

                    $mailContent = "<p>Click the link below to reset your password:</p><a target='_self' href='$resetLink'>$resetLink</a>";

                    $mail->Body = stripslashes($mailContent);

                    if ($mail->send()) {
                        echo json_encode(["success" => true, "message" => "Password reset link sent!"]);
                    } else {
                        http_response_code(500);
                        echo json_encode(["success" => false, "errors" => ["Failed to send email."]]);
                    }

                    break;
                } catch (RandomException|Exception $e) {
                    http_response_code(500);
                    echo json_encode(["success" => false, "errors" => $e->getMessage()]);
                    break;
                }
            }
            case "reset-password": {
                $data = (array)json_decode(file_get_contents("php://input"), true);

                if (empty($data["token"]) || empty($data["password"])) {
                    http_response_code(401);
                    echo json_encode(["success" => false, "errors" => ["Token is required!", "New password is required!"]]);
                    break;
                }

                $userId = $this->authenticationRepository->validateResetPasswordToken($data["token"]);

                if (!$userId) {
                    http_response_code(401);
                    echo json_encode(["success" => false, "errors" => ["Invalid or expired token!"]]);
                    break;
                }

                $this->authenticationRepository->updateUserPassword($userId, $data["password"]);
                echo json_encode(["success" => true, "message" => "Password reset successfully!"]);
                break;
            }
            default: {
                http_response_code(405);
                header("Allow: sign-in, sign-up");
            }
        }
    }

    private function processUpdatePasswordRequest(string $id): void {
        $data = (array)json_decode(file_get_contents("php://input"), true);

        if (empty($data["password"])) {
            http_response_code(401);
            echo json_encode(["success" => false, "errors" => ["New password is required!"]]);
        } else {
            $this->authenticationRepository->updateUserPassword($id, $data["password"]);
            echo json_encode(["success" => true, "message" => "Password updated successfully!"]);
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
        if (!$isSigningUp && !empty($data["nickname"]) && !empty($data["password"]) && !$this->authenticationRepository->checkCredentials($data["nickname"], $data["password"])) {
            $errors[] = "Invalid credentials!";
        }

        return $errors;
    }
}