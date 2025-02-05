<?php
declare(strict_types=1);

ini_set('session.use_only_cookies', 1);
ini_set('session.use_strict_mode', 1);

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS, HEAD, PUT");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, Accept, Access-Control-Allow-Origin");
    header("Access-Control-Allow-Credentials: true");
    exit(0);
}

use Controllers\AuthenticationController;
use Controllers\CommentController;
use Controllers\PostController;
use Controllers\TagController;
use Controllers\UserController;
use Repositories\CommentRepository;
use Repositories\PostRepository;
use Repositories\TagRepository;
use Repositories\UserRepository;
use Repositories\AuthenticationRepository;

spl_autoload_register(function ($class) {
    require __DIR__."/API/src/$class.php";
});

set_error_handler("ErrorHandler::handleError");
set_exception_handler("ErrorHandler::handleException");

header("Content-Type: application/json;");

$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$parts = explode('/', $_SERVER['REQUEST_URI']);


$resource = $parts[2] ?? null;
$action = $parts[3] ?? null;
$id = $parts[4] ?? null;

$database = new Database("localhost", "flickit-db", "root", "");

if ($resource === 'users') {
    $repository = new UserRepository($database);
    $controller = new UserController($repository);
    $controller->processRequest($_SERVER['REQUEST_METHOD'], $action, $id);
} elseif ($resource === 'authentication') {
    $repository = new AuthenticationRepository($database);
    $controller = new AuthenticationController($repository);
    $controller->processRequest($_SERVER['REQUEST_METHOD'], $action, $id);
} elseif ($resource === 'tags') {
    $repository = new TagRepository($database);
    $controller = new TagController($repository);
    $controller->processRequest($_SERVER['REQUEST_METHOD'], $action, $id);
} elseif ($resource === 'posts') {
    $tagRepository = new TagRepository($database);
    $postRepository = new PostRepository($database, $tagRepository);
    $userRepository = new UserRepository($database);
    $controller = new PostController($postRepository, $userRepository, $tagRepository);
    $controller->processRequest($_SERVER['REQUEST_METHOD'], $action, $id);
} elseif($resource == "comments") {
    $commentRepository = new CommentRepository($database);
    $controller = new CommentController($commentRepository);
    $controller->processRequest($_SERVER['REQUEST_METHOD'], $action, $id);
} else {
    http_response_code(404);
    echo json_encode(['status'=>404, 'errors'=>['Not Found!']]);
    exit;
}
