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
    <link rel="stylesheet" href="../../../index.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <title>Account</title>
</head>
<body class="body-container">
<div id="toastContainer"></div>
    <div class="main-container">
        <div class="left-column">
            <div class="left-sidebar">
                <div class="logo-container">
                    <h1>Flickit</h1>
                </div>

                <ul>
                    <li id="dashboardItem">
                        <a href="../dashboard/dashboard.php?section=dashboard">
                            <i class="bi bi-house-door-fill"></i>
                            <p>Dashboard</p>
                        </a>
                    </li>
                    <li >
                        <a href="../dashboard/dashboard.php?section=discover">
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
                    <li>
                        <a id="myPostsTopicItem" href="../dashboard/dashboard.php?section=myPosts">
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
                        <label>Avatar</label>
                        <button id="uploadAvatarButton" class="upload-avatar-button">
                            <i class="bi bi-cloud-arrow-up-fill"></i>
                        </button>
                        <div>
                            <img id="userAvatar" src="" alt=""/>
                        </div>
                    </div>
                    <div class="text-option-container">
                        <label for="userNickname">Nickname</label>
                        <input class="change-text-data-input" id="userNickname" type="text" readonly/>
                        <i id="changeUserNicknameIcon" class="bi bi-pencil-fill"></i>
                    </div>
                    <div class="text-option-container">
                        <label for="userEmail">E-mail</label>
                        <input class="change-text-data-input" id="userEmail" type="email" readonly/>
                        <i id="changeUserEmailIcon" class="bi bi-pencil-fill"></i>
                    </div>
                    <div class="text-option-container">
                        <label for="userPassword">Password</label>
                        <input class="change-text-data-input" type="password" id="userPassword" readonly/>
                        <i id="changeUserPasswordIcon" class="bi bi-pencil-fill"></i>
                    </div>
                    <div class="user-info-container">
                        <label class="info-label">Created At</label>
                        <label id="createdAtDataLabel" class="created-at-label">Password</label>
                        <label id="createdAtPeriodLabel" class="period-label">Password</label>
                    </div>
                </div>
                <form id="updateAccountButtons" class="update-account-buttons">
                    <button id="cancelUpdateButton" class="cancel-update-button">Cancel</button>
                    <button type="submit" class="submit-update-button">Update</button>
                </form>
            </div>
        </div>
    </div>

    <div id="uploadAvatarModal" class="modal-container">
        <div class="modal-content">
            <div class="avatar-inputs-container">
                <div class="upload-avatar-as-image">
                    <label class="modal-info-label">Add avatar image</label>
                    <label id="avatarFileDropArea" for="avatarFileInput" class="modal-image-placeholder">
                        <i class="bi bi-cloud-arrow-up-fill"></i>
                    </label>
                    <input id="avatarFileInput" type="file"/>
                </div>
                <div class="upload-avatar-as-url">
                    <label for="avatarUrlInput" class="modal-info-label">Add avatar url</label>
                    <input id="avatarUrlInput" type="url"/>
                </div>
            </div>
            <div class="modal-image-preview">
                <img id="avatarPreviewDisplay" src="" alt="user-avatar"/>
            </div>
            <div class="modal-buttons-container">
                <button id="modalCloseButton" class="modal-submit-button">Cancel</button>
                <button id="modalSubmitButton" disabled class="modal-submit-button">Add</button>
            </div>
        </div>
    </div>

    <div id="changePasswordModal" class="modal-container">
        <div class="modal-content change-data">
            <label class="modal-title">Change your password</label>
            <div class="input-container">
                <label for="currentPasswordInput">Current password</label>
                <input id="currentPasswordInput" type="password"/>
            </div>
            <div class="input-container">
                <label for="newPasswordInput">New password</label>
                <input id="newPasswordInput" type="password"/>
            </div>
            <div class="input-container">
                <label for="confirmNewPasswordInput">Confirm new password</label>
                <input id="confirmNewPasswordInput" type="password"/>
            </div>
            <div class="password-modal-buttons-container">
                <button id="cancelChangePasswordButton" type="button" class="cancel">Cancel</button>
                <button id="changeUserPasswordButton" type="submit" class="submit">Change password</button>
            </div>
        </div>
    </div>

    <script type="module" src="account.js"></script>
    <script type="module" src="accountApiFunctions.js"></script>
    <script type="module" src="../../../index.js"></script>
</body>
</html>