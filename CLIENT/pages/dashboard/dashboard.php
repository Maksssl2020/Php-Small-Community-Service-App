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
        <div id="leftColumn" class="left-column dashboard">
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
                    <li id="logoutItem">
                        <a>
                            <i class="bi bi-box-arrow-left"></i>
                            <p>Logout</p>
                        </a>
                    </li>
                </ul>

                <button id="createPostButton" class="create-post-button">
                    <i class="bi bi-pencil-fill"></i>
                    Create
                </button>
            </div>
        </div>
        <div id="dashboardMiddleContainer" class="dashboard-container dashboard">
            <header id="dashboardHeader" class="dashboard-header"></header>
            <div class="dashboard-content-container scrollbar" id="dashboardContentContainer"></div>
            <footer class="dashboard-footer" id="dashboardFooter">
                <button id="dashboardPaginationLeftArrow" style="padding-right: 8px" class="pagination-arrow">
                    <i class="bi bi-chevron-left"></i>
                </button>
                <div id="dashboardPaginationNumbers" class="pagination-numbers">
                </div>
                <button id="dashboardPaginationRightArrow" style="padding-left: 8px" class="pagination-arrow">
                    <i class="bi bi-chevron-right"></i>
                </button>
            </footer>
        </div>
        <div id="rightColumn" class="right-column scrollbar dashboard">
            <div class="searchbar">
                <i class="bi bi-search"></i>
                <input id="tagsSearchbar" class="searchbar-input" type="text" placeholder="Search on Flickit"/>

                <div id="searchbarDropdown" class="searchbar-dropdown scrollbar hidden"></div>
            </div>

            <div id="chosenTagDataContainer" class="chosen-tag-data-container hidden">
            </div>

            <div id="userFollowedTagsInformationContainer" class="user-followed-tags-container hidden">
                <header>
                    <h2>Followed</h2>
                    <button id="userFollowedTagsManageButton">Manage</button>
                </header>
                <div class="user-followed-tags-list scrollbar" id="userFollowedTagsList"></div>
            </div>

            <div class="random-tags-container">
                <header>
                    <h2>Check out these tags</h2>
                </header>
                <div id="randomTagsContainer"></div>
                <footer>
                    <a href="../dashboard/dashboard.php?section=discover">Discover all on Flickit</a>
                </footer>
            </div>

            <div id="randomPostInformationContainer" class="random-post-container hidden">
                <h2>Radar</h2>
                <div id="randomPostContainer"></div>
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

    <div id="addNewPostModal" class="modal-container scrollbar">
        <div class="modal-content">
            <header class="add-post-modal-header">
                <img id="addNewPostModalUserAvatar" src="" alt="user_avatar"/>
                <p id="addNewPostModalUserNickname"></p>
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
                                <div id="selectOptions" class="options-list-container"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="addedTagsContainer" class="chosen-tags-container scrollbar">
                </div>
            </div>
            <footer class="add-post-modal-footer">
                <button type="button" id="addNewPostModalCloseButton" class="add-post-button">Close</button>
                <button type="submit" disabled id="addNewPostButton" class="add-post-button" style="margin-left: auto; background: var(--custom-pink-color-200); color: var(--custom-white-color-100)">Public now</button>
            </footer>
        </div>
    </div>

    <div id="manageFollowedTagsModal" class="modal-container">
        <div class="modal-content">
            <div class="followed-tags-modal-content-container">
                <div class="followed-tags-modal-header">
                    <header>
                        <label>Followed tags</label>
                        <i style="cursor: pointer;" id="closeManageFollowedTagsModal" class="bi bi-x"></i>
                    </header>
                </div>
                <div class="followed-tags-modal-searchbar">
                    <i class="bi bi-search search-icon"></i>
                    <input placeholder="Find more tags" id="searchNewTagsToFollow" type="text"/>
                    <i id="resetTagsSearchbar" class="bi bi-x reset-searchbar"></i>
                </div>
                <div id="followedTagsModalList" class="followed-tags-modal-list"></div>
            </div>
        </div>
    </div>

    <div id="deleteModalWarningContainer" class="modal-container">
        <div class="warning-modal-content">
            <h2 id="deleteWarningMessage"></h2>
            <div>
                <button id="cancelDelete" class="cancel-button">Cancel</button>
                <button id="confirmDelete" class="delete-button warning">Delete</button>
            </div>
        </div>
    </div>

    <div id="discoverPostStatisticsModal" class="modal-container">
        <div class="modal-content">
            <header class="discover-post-statistics-header">
                <span id="discoverPostAmountOfHearts"></span>
                <span id="discoverPostHeartsVariety"></span>
                <i id="closeStatisticsModal" class="bi bi-x"></i>
            </header>
            <div class="discover-post-statistics-types-container">
                <div id="discoverPostCommentsStatistic" class="statistic-container active">
                    <i id="discoverPostShowComments" class="bi bi-chat"></i>
                    <span id="discoverPostAmountOfComments"></span>
                </div>
                <div id="discoverPostLikesStatistic" class="statistic-container">
                    <i id="discoverPostShowLikes" class="bi bi-heart"></i>
                    <span id="discoverPostAmountOfLikes"></span>
                </div>
            </div>
            <div id="discoverPostStatisticsContent" class="discover-post-statistics-content-container">
            </div>
            <footer id="discoverPostStatisticsFooter" class="discover-post-statistics-footer visible">
                <img id="discoverPostCommentInputUserAvatar" src="" alt="user"/>
                <div class="comment-input">
                    <input id="discoverPostCommentInput"/>
                    <button disabled id="discoverPostAddCommentButton" class="add-comment-button">
                        <i id="discoverPostAddCommentIcon" class="bi bi-send"></i>
                    </button>
                </div>
            </footer>
        </div>
    </div>

    <script type="module" src="dashboard.js"></script>
    <script type="module" src="dashboardAddNewPosts.js"></script>
    <script type="module" src="dashboardApiFunctions.js"></script>
    <script type="module" src="../../../index.js"></script>
    <script type="module" src="../../../indexUtils.js"></script>
    <script type="module" src="../../../indexApiFunctions.js"></script>
    <script type="module" src="dashboardPostRender.js"></script>
    <script type="module" src="dashboardUtils.js"></script>
    <script type="module" src="dashboardEventListeners.js"></script>
</body>
</html>
