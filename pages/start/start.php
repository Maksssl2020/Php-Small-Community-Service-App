<?php

require_once('../../utils/db/config_session.php');
$isSignedIn = isset($_SESSION['user_id']);
$role = '';
$isAdmin = false;

if (isset($_SESSION['user_role'])) {
    $role = $_SESSION['user_role'];
}

if ($role == 'admin') {
    $isAdmin = true;
}

?>

<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Flickit</title>
    <link rel="stylesheet" href="start.css">
    <link rel="stylesheet" href="../../index.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
</head>
<body class="body-container">
    <div id="toastContainer"></div>
    <div class="main-container">
        <div class="left-column">
            <div class="logo-container">
                <h1>Flickit</h1>
            </div>
            <div class="left-sidebar">
                <ul>
                    <?php if($isSignedIn): ?>
                    <li>
                        <a href="../dashboard/dashboard.php">
                            <i class="bi bi-house-door-fill"></i>
                            <p>Dashboard</p>
                        </a>
                    </li>
                    <?php endif; ?>
                    <?php if($isSignedIn && $isAdmin): ?>
                        <li>
                            <a href="../tags/tags.php">
                                <i class="bi bi-bookmark-plus-fill"></i>
                                <p>Add topic</p>
                            </a>
                        </li>
                    <?php endif; ?>
                </ul>
            </div>
        </div>
        <div class="right-column">
            <header>
                <h2>Browse Topics</h2>
                <div class="authentication-container">
                    <?php if(!$isSignedIn): ?>
                        <button type="button" id="signUpButton" class="authentication-button">
                            Sign Up
                        </button>
                        <button type="button" id="signInButton" class="authentication-button">
                            Sign In
                        </button>
                    <?php else: ?>

                        <button style="margin-left: auto" type="button" id="logoutButton" class="authentication-button">
                            Logout
                        </button>

                    <?php endif; ?>
                </div>


            </header>
            <div></div>
        </div>
    </div>

    <div id="signInModal" class="modal-container">
        <div class="modal-content">
            <h3>Flickit</h3>
            <form id="signInForm" class="authentication-form">
                <div class="input-container">
                    <label for="signInNicknameInput">Enter your nickname to sign in:</label>
                    <input type="text" name="nickname" id="signInNicknameInput" placeholder="nickname">
                </div>

                <div class="input-container">
                    <label for="signInPasswordInput">Enter your password to sign in:</label>
                    <input type="password" name="password" id="signInPasswordInput" placeholder="e-mail address">
                </div>

                <button disabled id="signInSubmitButton" type="submit" class="submit-button">Sign In</button>
            </form>
        </div>
    </div>

    <div id="signUpModal" class="modal-container">
        <div class="modal-content">
            <h3>Flickit</h3>
            <form id="signUpForm" class="authentication-form" >
                <div class="input-container">
                    <label for="signUpNicknameInput">Enter a flickit nickname:</label>
                    <input type="text" name="nickname" id="signUpNicknameInput" placeholder="nickname">
                </div>

                <div class="input-container">
                    <label for="signUpEmailInput">Enter e-mail address to sign up:</label>
                    <input type="email" name="email" id="signUpEmailInput" placeholder="e-mail address">
                </div>

                <div class="input-container">
                    <label for="signUpPasswordInput">Set password to your account (Min. 8 characters):</label>
                    <input type="password" name="password" id="signUpPasswordInput" placeholder="password">
                </div>

                <div class="input-container">
                    <label for="signUpRepeatPasswordInput">Repeat entered password:</label>
                    <input type="password" name="" id="signUpRepeatPasswordInput" placeholder="repeat password">
                </div>

                <button disabled type="submit" class="submit-button" id="signUpSubmitButton">Sign Up</button>
            </form>
        </div>
    </div>

    <script src="start.js"></script>
    <script src="../../index.js"></script>
</body>
</html>