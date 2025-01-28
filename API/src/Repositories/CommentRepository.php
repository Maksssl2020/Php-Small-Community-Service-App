<?php

namespace Repositories;

use DateTime;
use Models\Comment;
use PDO;

class CommentRepository extends BaseRepository {

    public function getPostComments(string $postId) : array {
        $query = "SELECT * FROM `flickit-db`.comments WHERE postId = :postId";
        $statement = $this->connection->prepare($query);
        $statement->bindParam(':postId', $postId, PDO::PARAM_INT);
        $statement->execute();
        $comments = $statement->fetchAll(PDO::FETCH_ASSOC);

        if (empty($comments)) {
            return [];
        }

        $commentModels = [];
        foreach ($comments as $comment) {
            $commentModels[] = $this->createCommentModel($comment);
        }

        return $commentModels;
    }

    public function countPostComments(string $postId) : int {
        $query = "SELECT * FROM `flickit-db`.comments WHERE postId = :postId";
        $statement = $this->connection->prepare($query);
        $statement->bindParam(':postId', $postId, PDO::PARAM_INT);
        $statement->execute();

        return $statement->rowCount();
    }

    public function addCommentToPost(string $postId, array $data): int {
        $query = "INSERT INTO `flickit-db`.comments (postId, userId, content) VALUES (:postId, :userId, :content)";
        $statement = $this->connection->prepare($query);
        $statement->bindParam(':postId', $postId, PDO::PARAM_INT);
        $statement->bindParam(':userId', $data['userId'], PDO::PARAM_INT);
        $statement->bindParam(':content', $data['content']);
        $statement->execute();

        return $this->connection->lastInsertId();
    }

    public function createCommentModel(array $data): Comment {
        return new Comment(
            $data['id'],
            $data['postId'],
            $data['userId'],
            $data['content'],
            DateTime::createFromFormat('Y-m-d H:i:s', $data['addedAt'])
        );
    }
}