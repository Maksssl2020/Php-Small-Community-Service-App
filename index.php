<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Flickit</title>
    <link rel="stylesheet" href="index.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
</head>
<body>
    <div class="main-container">
        <div class="left-column">
            <div class="logo-container">
                <h1>Flickit</h1>
            </div>
        </div>
        <div class="right-column">
            <header>
                <h2>Browse categories</h2>
                <div class="authentication-container">
                    <button type="button" id="signUpButton" class="authentication-button">
                        Sign Up
                    </button>
                    <button id="signInButton" class="authentication-button">
                        Sign In
                    </button>
                </div>
            </header>
            <div></div>
        </div>
    </div>

    <div id="signUpModal" class="modal-container">
        <div class="modal-content">
            <h3>Flickit</h3>
            <form class="sign-up-form">
                <label for="emailInput">Enter e-mail address to sign up:</label>
                <input type="email" name="" id="emailInput" placeholder="e-mail address">
            </form>
        </div>
    </div>

    <script src="index.js"></script>
</body>
</html>