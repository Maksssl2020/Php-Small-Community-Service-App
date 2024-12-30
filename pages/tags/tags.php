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
     <div class="main-container">
         <div class="add-tag-container">
             <form class="add-tag-form" >
                 <div class="input-container">
                     <label for="tag-name">Enter a tag name:</label>
                     <input type="text" id="tag-name" placeholder="Enter a tag name">
                 </div>
                 <div class="photo-input-container">
                     <label class="text-label">Add Tag Cover:</label>
                     <label class="photo-label" for="tag-file">
                         <i class="bi bi-cloud-arrow-up-fill"></i>
                     </label>
                     <input class="photo-input" type="file" id="tag-file" placeholder="Enter a tag name">
                 </div>
                 
                 <img class="tag-cover-display" src="">
             </form>
         </div>
     </div>
</body>
</html>