<?php

namespace Controllers;

use Repositories\PostRepository;
use Repositories\TagRepository;
use Repositories\UserRepository;

readonly class PostController {
    public function __construct(private PostRepository $postRepository, private UserRepository $userRepository, private TagRepository $tagRepository) {
    }

    public function processRequest(string $method, string $action, ?string $id): void{
        $pageNumber = isset($_GET['page']) ? (int)$_GET['page'] : 1;

        if ($method == 'GET' && !empty($id)) {

            if (str_contains($action, 'get-discovered-posts')) {
                $data = $this->explodeActionStringForRequestWithUserId($action);

                count($data) == 2 ?
                    $this->processCollectionGetRequestWithIdAndAdditionalData("get-discovered-posts-with-tag", $id, $data, $pageNumber) :
                    $this->processCollectionGetRequestWithIdAndAdditionalData("get-discovered-posts", $id, $data, $pageNumber);
            }

            $this->processResourceGetRequestWithId($action, $id, $pageNumber);
        } elseif ($method == "GET" && empty($id)) {
            if (str_contains($action, 'get-discovered-posts')) {
                $data = $this->explodeActionStringForRequestWithoutUserId($action);

                if (count($data) != 0) {
                    $this->processCollectionGetRequestWithoutIdAndWithSpecifiedTag($data[0], $pageNumber);
                }
            }
        } elseif ($method == 'POST' && !empty($id)) {
            $this->processResourcePostRequestWithId($action, $id);
        } elseif ($method == "POST" && empty($id)) {
            $this->processResourcePostRequestWithoutId($action);
        } elseif ($method == 'DELETE' && !empty($id)) {
            $this->processResourceDeleteRequestWithId($action, $id);
        } else {
            http_response_code(405);
            header("Allow: POST, GET");
        }
    }

    private function explodeActionStringForRequestWithUserId(string $action): array {
        $actionParts = explode('-', $action);

        if (count($actionParts) > 4) {
            return [$actionParts[count($actionParts) - 2], $actionParts[count($actionParts) - 1]];
        } elseif (count($actionParts) === 4) {
            return [$actionParts[count($actionParts) - 1]];
        } else {
            return [];
        }
    }

    private function explodeActionStringForRequestWithoutUserId(string $action): array {
        $actionParts = explode('-', $action);

        if (count($actionParts) == 4) {
            return [$actionParts[count($actionParts) - 1]];
        } else {
            return [];
        }
    }

    private function processCollectionGetRequestWithIdAndAdditionalData(string $action, string $id, array $data, int $pageNumber): void {
        switch ($action) {
            case "get-discovered-posts": {
                echo json_encode(['success' => true, 'data' => $this->postRepository->getDiscoverPostsForUser($id, $data[0] == "recent", $pageNumber)]);
                break;
            }
            case "get-discovered-posts-with-tag": {
                echo json_encode(['success' => true, 'data' => $this->postRepository->getDiscoverPostsForUserBasedOnChosenTag($id, $data[1], $data[0] == "recent", $pageNumber)]);
                break;
            }
        }
    }

    private function processCollectionGetRequestWithoutIdAndWithSpecifiedTag(string $specifiedTag, int $pageNumber): void {
        echo json_encode(["success"=>true, "data" => $this->postRepository->getDiscoveredPostsBasedOnChosenTag($specifiedTag, $pageNumber)]);
    }

    public function processResourcePostRequestWithoutId(string $action): void {
        switch ($action) {
            case 'create-text-post': {
                $data = (array)json_decode(file_get_contents("php://input"), true);
                $errors = $this->getValidationErrors($data, $action);

                if (!empty($errors)) {
                    http_response_code(422);
                    echo json_encode(["success" => false, "errors" => $errors]);
                    break;
                }

                $addedPostId = $this->postRepository->addTextPost($data);

                if (isset($data['tags']) && is_array($data['tags'])) {
                    $this->tagRepository->addPostTags($addedPostId, $data['tags']);
                }

                echo json_encode(["success" => true, "message" => "Post has been created!"]);
                break;
            }
            case 'create-image-post': {
                $data = (array)json_decode(file_get_contents("php://input"), true);
                $errors = $this->getValidationErrors($data, $action);

                if (!empty($errors)) {
                    http_response_code(422);
                    echo json_encode(["success" => false, "errors" => $errors]);
                    break;
                }

                $addedPostId = $this->postRepository->addPost('image', $data);
                $this->postRepository->addPostImages($addedPostId, $data['imagesLinks']);

                if (isset($data['tags']) && is_array($data['tags'])) {
                    $this->tagRepository->addPostTags($addedPostId, $data['tags']);
                }

                echo json_encode(["success" => true, "message" => "Post has been created!"]);
                break;
            }
            case 'create-quote-post': {
                $data = (array)json_decode(file_get_contents("php://input"), true);
                $errors = $this->getValidationErrors($data, $action);

                if (!empty($errors)) {
                    http_response_code(422);
                    echo json_encode(["success" => false, "errors" => $errors]);
                    break;
                }

                $addedPostId = $this->postRepository->addPost('quote', $data);

                if (isset($data['tags']) && is_array($data['tags'])) {
                    $this->tagRepository->addPostTags($addedPostId, $data['tags']);
                }

                echo json_encode(["success" => true, "message" => "Post has been created!"]);
                break;
            }
            case 'create-link-post': {
                $data = (array)json_decode(file_get_contents("php://input"), true);
                $errors = $this->getValidationErrors($data, $action);

                if (!empty($errors)) {
                    http_response_code(422);
                    echo json_encode(["success" => false, "errors" => $errors]);
                    break;
                }

                $addedPostId = $this->postRepository->addPost('link', $data);
                $this->postRepository->addPostLinks($addedPostId, $data['links']);

                if (isset($data['tags']) && is_array($data['tags'])) {
                    $this->tagRepository->addPostTags($addedPostId, $data['tags']);
                }

                echo json_encode(["success" => true, "message" => "Post has been created!"]);
                break;
            }
        }
    }

    public function processResourcePostRequestWithId(string $action, string $id): void {
        switch ($action) {
            case "like-post": {
                $data = (array)json_decode(file_get_contents("php://input"), true);
                $errors = $this->getValidationErrors($data, $action);

                if (!empty($errors)) {
                    http_response_code(422);
                    echo json_encode(["success" => false, "errors" => $errors]);
                    break;
                }

                if (!$this->postRepository->postExists($id)) {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'errors' => ['Post not found!']]);
                    break;
                }


                if ($this->postRepository->isPostLikedByUser($id, $data['userId'])) {
                    $this->postRepository->removeUserLikeToPost($id, $data['userId']);

                    echo json_encode(["success" => true, "message" => "You have unliked this post!"]);
                    break;
                }

                $this->postRepository->addUserLikeToPost($id, $data['userId']);
                echo json_encode(["success" => true, "message" => "You have liked this post!"]);
                break;
            }
            case "is-post-liked-by-user": {
                $data = (array)json_decode(file_get_contents("php://input"), true);

                if (!$this->postRepository->postExists($id)) {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'errors' => ['Post not found!']]);
                    break;
                }

                $errors = $this->getValidationErrors($data, $action);

                if (!empty($errors)) {
                    http_response_code(422);
                    echo json_encode(["success" => false, "errors" => $errors]);
                    break;
                }

                echo json_encode(['success' => true, 'data' => $this->postRepository->isPostLikedByUser($id, $data['userId'])]);
                break;
            }
        }
    }

    public function processResourceDeleteRequestWithId(string $action, string $id): void {
        switch ($action) {
            case "delete-post": {
                $this->postRepository->deletePost($id);
                echo json_encode(["success" => true, "message" => "Post has been deleted!"]);
                break;
            }
        }
    }

    public function processResourceGetRequestWithId(string $action, string $id, string $pageNumber): void{
        switch ($action) {
            case 'get-user-posts': {
                if (!$this->userRepository->userExists($id)) {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'errors' => ['User not found!']]);
                    return;
                }

                echo json_encode(['success' => true, 'data' => $this->postRepository->getUserPosts($id, $pageNumber)]);
                break;
            }
            case "get-dashboard-posts-for-user": {
                echo json_encode(['success' => true, 'data' => $this->postRepository->getPostsForUser($id, $pageNumber)]);
                break;
            }
            case "get-dashboard-posts-by-followed-tags": {
                echo json_encode(['success' => true, 'data' => $this->postRepository->getDashboardPostsByFollowedTags($id, $pageNumber)]);
                break;
            }
            case "count-post-likes": {
                if (!$this->postRepository->postExists($id)) {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'errors' => ['Post not found!']]);
                    break;
                }

                echo json_encode(['success'=>true, 'data' => $this->postRepository->countPostLikes($id)]);
                break;
            }
            case "get-post-likes": {
                if (!$this->postRepository->postExists($id)) {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'errors' => ['Post not found!']]);
                    break;
                }

                echo json_encode(['success'=>true, 'data' => $this->postRepository->getPostLikes($id)]);
                break;
            }
            case "get-post-creator-id": {
                echo json_encode(['success'=>true, 'data' => $this->postRepository->getPostCreatorId($id)]);
                break;
            }
            case "get-post-author-id": {
                echo json_encode(["success" => true, "data" => $this->postRepository->getPostAuthorId($id)]);
                break;
            }
            case "get-random-post-for-user-radar": {
                echo json_encode(['success'=>true, 'data' => $this->postRepository->getRandomPostForUserRadar($id)]);
                break;
            }
        }
    }

    private function getValidationErrors(array $data, string $action): array
    {
        $errors = [];

        if (($action == 'like-post' || 'is-post-liked-by-user' || 'create-text-post') && empty($data['userId'])) {
            $errors[] = 'User ID is required!';
        }

        if ($action == 'create-text-post' && empty($data['title'])) {
            $errors[] = 'Title is required!';
        }

        if ($action == 'create-text-post' && empty($data['content'])) {
            $errors[] = 'Content is required!';
        }

        if ($action == 'create-image-post' &&empty($data['imagesLinks'])) {
            $errors[] = 'Post must contains at least one image link!';
        }

        if ($action == 'create-quote-post' && empty($data['content'])) {
            $errors[] = 'Post must contains at least one quote!';
        }

        if ($action == 'create-link-post' && empty($data['links'])) {
            $errors[] = 'Post must contains at least one link!';
        }

        return $errors;
    }
}