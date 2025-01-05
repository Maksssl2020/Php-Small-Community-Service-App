<?php


?>
<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <link rel="stylesheet" href="dashboard.css">
    <link rel="stylesheet" href="../../index.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <title>Dashboard</title>
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
                    <li class="discoverItem">
                        <a>
                            <i class="bi bi-compass-fill"></i>
                            <p>Discover</p>
                        </a>
                    </li>
                    <li class="topicsItem">
                       <a href="../start/start.php">
                           <i class="bi bi-bookmarks-fill"></i>
                           <p>Topics</p>
                       </a>
                    </li>
                    <li class="topicsItem">
                        <a href="">
                            <i class="bi bi-stickies-fill"></i>
                            <p>My posts</p>
                        </a>
                    </li>
                </ul>

                <button class="create-post-button">
                    <i class="bi bi-pencil-fill"></i>
                    Create
                </button>
            </div>
        </div>
        <div class="dashboard-container">
            <header class="dashboard-header">
                <button class="header-button">For you</button>
                <button class="header-button">Your tags</button>
                <button class="header-options-button">
                    <i class="bi bi-sliders"></i>
                </button>
            </header>
        </div>
        <div class="right-column">
            <div class="searchbar">
                <i class="bi bi-search"></i>
                <input class="searchbar-input" type="text" placeholder="Search on Flickit"/>
            </div>
        </div>
    </div>

    <script src="dashboard.js"></script>
</body>
</html>
