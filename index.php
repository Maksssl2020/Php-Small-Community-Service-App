<?php

declare(strict_types=1);

spl_autoload_register(function ($class) {
    require __DIR__."/API/src/$class.php";
});

set_error_handler("ErrorHandler::handleException");

header("Content-Type: application/json; charset=UTF-8");

$parts = explode('/', $_SERVER['REQUEST_URI']);

$resource = $parts[2] ?? null;
$id = $parts[3] ?? null;

$database = new Database("localhost", "flickit-db", "root", "");


if ($resource === 'users') {
    $gateway = new UserGateway($database);
    $controller = new UserController($gateway);
    $controller->processRequest($_SERVER['REQUEST_METHOD'], $id);
} else {
    http_response_code(404);
    echo json_encode(['status'=>404, 'errors'=>['Not Found!']]);
    exit;
}