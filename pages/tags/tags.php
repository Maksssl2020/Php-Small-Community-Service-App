<?php


?>

<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <link rel="stylesheet" href="tags.css">
    <link rel="stylesheet" href="../../index.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <title>Tags</title>
</head>
<body class="body-container">
<div id="toastContainer"></div>
     <div class="main-container">
         <div class="add-tag-container">
             <h1>Add New Tag Form</h1>
             <form id="addTagForm" class="add-tag-form" method="POST" enctype="multipart/form-data">
                 <div class="input-container">
                     <label for="tagName">Enter a tag name:</label>
                     <input type="text" name="tagName" id="tagName" placeholder="Enter a tag name">
                 </div>
                 <div class="photo-input-container">
                     <label class="text-label">Add Tag Cover:</label>
                     <label class="photo-label" for="tagFile">
                         <i class="bi bi-cloud-arrow-up-fill"></i>
                     </label>
                     <input class="photo-input" type="file" name="tagFile" id="tagFile" placeholder="Enter a tag name">
                 </div>

                 <div class="added-photo-container" >
                     <img id="previewImage" class="tag-cover-display" src="" alt="Tag Cover Display">
                 </div>

                 <div class="buttons-container">
                     <button id="cancel" type="button" class="submit-button">Cancel</button>
                     <button disabled id="addNewTagSubmitButton" type="submit" class="submit-button">Add Photo</button>
                 </div>
             </form>
         </div>
     </div>

    <script src="tags.js"></script>
    <script src="../../index.js"></script>
</body>
</html>