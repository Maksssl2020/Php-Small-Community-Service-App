<?php

function fetch_main_tags(object $pdo): array {
    return get_all_main_tags($pdo);
}