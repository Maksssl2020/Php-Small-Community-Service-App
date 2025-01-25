<?php
    session_start();
    $userNickname = htmlspecialchars($_SESSION['user_nickname']);
?>
<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <link rel="stylesheet" href="dashboard.css">
    <link rel="stylesheet" href="../../../index.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <title>Dashboard</title>
</head>
<body class="body-container" id="dashboardBody">
<div id="toastContainer"></div>
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
                    <li id="discoverItem">
                        <a>
                            <i class="bi bi-compass-fill"></i>
                            <p>Discover</p>
                        </a>
                    </li>
                    <li id="topicsItem">
                       <a href="../start/start.php">
                           <i class="bi bi-bookmarks-fill"></i>
                           <p>Topics</p>
                       </a>
                    </li>
                    <li id="myPostsTopicItem">
                        <a >
                            <i class="bi bi-stickies-fill"></i>
                            <p>My posts</p>
                        </a>
                    </li>
                    <li id="accountItem">
                        <a href="../account/account.php">
                            <i class="bi bi-person-fill-gear"></i>
                            <p>Account</p>
                        </a>
                    </li>
                </ul>

                <button id="createPostButton" class="create-post-button">
                    <i class="bi bi-pencil-fill"></i>
                    Create
                </button>
            </div>
        </div>
        <div class="dashboard-container">
            <header id="dashboardHeader" class="dashboard-header">

            </header>
            <div class="dashboard-content-container" id="dashboardContentContainer">
            </div>
        </div>
        <div class="right-column">
            <div class="searchbar">
                <i class="bi bi-search"></i>
                <input class="searchbar-input" type="text" placeholder="Search on Flickit"/>
            </div>
        </div>
    </div>

    <div id="postOptionsContainer" class="modal-container">
        <div class="post-options-container">
            <div id="addTextPostButton" class="post-option-card">
                <div class="post-option-icon-container" style="background-color: var(--custom-red-color-300)">
                    <i class="bi bi-alphabet-uppercase"></i>
                </div>
                <p class="post-option-text">Text</p>
            </div>
            <div id="addImagePostButton" class="post-option-card">
                <div class="post-option-icon-container" style="background-color: var(--custom-yellow-color-200)">
                    <i class="bi bi-camera2"></i>
                </div>
                <p class="post-option-text">Photo</p>
            </div>
            <div id="addQuotePostButton" class="post-option-card">
                <div class="post-option-icon-container" style="background-color: var(--custom-green-color-100)">
                    <i class="bi bi-quote"></i>
                </div>
                <p class="post-option-text">Quote</p>
            </div>
            <div id="addLinkPostButton" class="post-option-card">
                <div class="post-option-icon-container" style="background-color: var(--custom-blue-color-100)">
                    <i class="bi bi-link-45deg"></i>
                </div>
                <p class="post-option-text">Link</p>
            </div>
        </div>
    </div>

    <div id="addNewPostModal" class="modal-container">
        <div class="modal-content">
            <header class="add-post-modal-header">
                <p id="userNickname">
                    <?php
                        echo $userNickname;
                    ?>
                </p>
            </header>
            <form class="add-post-modal-main" id="addPostModalFormContainer"></form>
            <div class="add-post-modal-tags-options" >
                <div class="add-tag-container">
                    <label >Select tags or create new one:</label>
                    <div class="add-tags-options-container">
                        <div class="select-search-box-container">
                            <div id="selectLabel" class="select-label-container">
                                <label>Select tags</label>
                                <i class="bi bi-chevron-down"></i>
                            </div>
                            <div id="selectOptionsContainer" class="select-options-container">
                                <input id="tagsFilter" type="text" placeholder="Filter tags..."/>
                                <div id="selectOptions" class="options-list-container">

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="addedTagsContainer" class="chosen-tags-container">
                </div>
            </div>
            <footer class="add-post-modal-footer">
                <button type="button" id="addNewPostModalCloseButton" class="add-post-button">Close</button>
                <button type="submit" disabled id="addNewPostButton" class="add-post-button" style="margin-left: auto; background: var(--custom-pink-color-200); color: var(--custom-white-color-100)">Public now</button>
            </footer>
        </div>
    </div>

    <script src="dashboard.js"></script>
    <script src="dashboardAddNewPosts.js"></script>
    <script src="../../../index.js"></script>
</body>
</html>
