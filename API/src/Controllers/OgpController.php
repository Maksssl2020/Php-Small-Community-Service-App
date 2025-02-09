<?php

namespace Controllers;
use DOMDocument;
use DOMXPath;

class OgpController {
    public function __construct() {}

    public function processRequest(string $method, string $action, ?string $id): void{
        if ($method == "POST" && $action == "get-ogp-data") {
            $this->fetchOgpData();
        }
    }

    private function fetchOgpData(): void {
        $data = (array)json_decode(file_get_contents("php://input"), true);

        if (empty($data["url"])) {
            echo json_encode(["success"=>false, "errors" => ["url is empty!"]]);
            return;
        }

        $html = file_get_contents($data["url"]);

        if (empty($html)) {
            echo json_encode(["success"=>false]);
            return;
        }

        libxml_use_internal_errors(true);
        $doc = new DOMDocument();
        $doc->loadHTML($html);
        $xpath = new DOMXPath($doc);
        $query = '//*/meta[starts-with(@property, \'og:\')]';
        $metas = $xpath->query($query);
        $ogpData = [];

        foreach ($metas as $meta) {
            $property = $meta->getAttribute('property');
            $content = $meta->getAttribute('content');
            $ogpData[$property] = $content;
        }

        echo json_encode(["success"=>true, "data"=>$ogpData]);
    }
}