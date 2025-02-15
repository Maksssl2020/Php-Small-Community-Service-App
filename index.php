<?php
declare(strict_types=1);

ini_set('session.use_only_cookies', 1);
ini_set('session.use_strict_mode', 1);

$publicUrl = "http://localhost:63342";
$ngrokApiUrl = "http://127.0.0.1:4040/api/tunnels";

$context = stream_context_create([
    'http' => [
        'timeout' => 0.01,
    ]
]);
$ngrokResponse = @file_get_contents($ngrokApiUrl, false, $context);

if ($ngrokResponse) {
    $ngrokData = json_decode($ngrokResponse, true);

    if (isset( $ngrokData["tunnels"][0]["public_url"])) {
        $publicUrl =  $ngrokData["tunnels"][0]["public_url"];
    }
}

$allowedOrigins = [
    "http://localhost:63342",
    "http://localhost:63343",
    $publicUrl
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header("Access-Control-Allow-Origin: http://localhost:63342");
}

header("Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS, HEAD, PUT");
header("Access-Control-Allow-Headers: Origin, Content-Type, Authorization, Accept");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

use Controllers\AuthenticationController;
use Controllers\CommentController;
use Controllers\OgpController;
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
} elseif ($resource == "ogp") {
    $controller = new OgpController();
    $controller->processRequest($_SERVER['REQUEST_METHOD'], $action, $id);
} else {
    http_response_code(404);
    echo json_encode(['status'=>404, 'errors'=>['Not Found!']]);
    exit;
}
