<?php

ini_set('session.use_only_cookies', 1);
ini_set('session.use_strict_mode', 1);

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (isset($_SESSION["user_id"])) {
    manage_session(true);
} else {
    manage_session(false);
}

function manage_session(bool $isLoggedIn):void {
    if (!isset($_SESSION["last_regeneration"])) {
        regenerate_session_id($isLoggedIn);
    } else {
        $interval = 60 * 30;

        if (time() - $_SESSION["last_regeneration"] >= $interval) {
            regenerate_session_id($isLoggedIn);
        }
    }
}

function regenerate_session_id(bool $isLoggedIn): void {
    if ($isLoggedIn) {
        $userId = $_SESSION["user_id"];
        $newSessionId = session_create_id("user_{$userId}_");
        session_id($newSessionId);
    } else {
        session_regenerate_id(true);
    }

    $_SESSION["last_regeneration"] = time();
    set_session_lifetime();
}

function set_session_lifetime(): void {
    setcookie(session_name(), session_id(), time() + (1800), "/");
}