<?php

?>

<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <link rel="stylesheet" href="account.css">
    <link rel="stylesheet" href="../../index.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <title>Account</title>
</head>
<body class="body-container">
    <div class="main-container">
        <div class="left-column">
            <div class="left-sidebar">
                <div class="logo-container">
                    <h1>Flickit</h1>
                </div>

                <ul>
                    <li id="dashboardItem">
                        <a>
                            <i class="bi bi-house-door-fill"></i>
                            <p>Dashboard</p>
                        </a>
                    </li>
                    <li >
                        <a>
                            <i class="bi bi-compass-fill"></i>
                            <p>Discover</p>
                        </a>
                    </li>
                    <li >
                        <a href="../start/start.php">
                            <i class="bi bi-bookmarks-fill"></i>
                            <p>Topics</p>
                        </a>
                    </li>
                    <li >
                        <a id="myPostsTopicItem">
                            <i class="bi bi-stickies-fill"></i>
                            <p>My posts</p>
                        </a>
                    </li>
                    <li >
                        <a id="myAccountItem" style="color: var(--custom-white-color-100)">
                            <i class="bi bi-person-fill-gear"></i>
                            <p>Account</p>
                        </a>
                    </li>
                </ul>
            </div>
        </div>
        <div class="account-content-container">
            <div class="account-section-container">
                <div class="section-title-container">
                    <h2>My Account</h2>
                </div>

                <div class="account-options-container">
                    <div class="image-option-container">
                        <label></label>
                        <img/>
                    </div>
                    <div class="text-option-container">
                        <label>E-mail</label>
                        <label id="emailDisplayLabel"></label>
                        <i></i>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="../../index.js"></script>
    <script src="account.js"></script>
</body>
</html>