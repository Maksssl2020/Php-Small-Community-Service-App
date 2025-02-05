<?php

?>

<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <link rel="stylesheet" href="resetPassword.css">
    <link rel="stylesheet" href="../../../index.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <title>Flickit - Reset Password</title>
</head>
<body class="body-container">
    <div id="toastContainer"></div>
    <div class="main-container">
        <form class="reset-password-container">
            <h3>Flickit</h3>
            <div class="input-container">
                <label for="newPassword">New password</label>
                <input type="password" id="newPassword" >
            </div>
            <div class="input-container">
                <label for="confirmPassword">Confirm password</label>
                <input type="password" id="confirmPassword" >
            </div>

            <button disabled class="submit-button" type="submit" id="resetPasswordButton">Reset Password</button>
        </form>
    </div>
    <script type="module" src="resetPassword.js"></script>
    <script type="module" src="../../../index.js"></script>
</body>
</html>
