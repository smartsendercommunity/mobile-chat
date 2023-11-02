<?php

$result["state"] = true;
include("config.php");

if ($_SERVER["REQUEST_METHOD"] == "GET") {
  if ($_GET["page"] == NULL) {
    $_GET["page"] = 1;
  }
  $result["term"] = $_GET["term"];
  $tags = json_decode(send_bearer("https://api.smartsender.com/v1/tags?limitation=20&page=".$_GET["page"]."&term=".$_GET["term"], $ssToken), true);
  if (array_key_exists("collection", $tags)) {
    $result["tags"] = $tags["collection"];
    $result["cursor"] = $tags["cursor"];
  } else {
    $result["state"] = false;
    $result["error"]["message"][] = "failed load tags";
    $result["error"]["smartsender"] = $tags;
  }
} else if ($_SERVER["REQUEST_METHOD"] == "POST") {
  if ($input["userId"] == NULL) {
    $result["state"] = false;
    $result["error"]["message"][] = "'userId' is missing";
  }
  if ($input["tagId"] == NULL) {
    $result["state"] = false;
    $result["error"]["message"][] = "'tagId' is missing";
  }
  if ($result["state"] == false) {
    echo json_encode($result);
    exit;
  }
  $add = json_decode(send_bearer("https://api.smartsender.com/v1/contacts/".$input["userId"]."/tags/".$input["tagId"], $ssToken, "POST"), true);
  if ($add["state"] != true) {
    $result["state"] = false;
    $result["error"]["message"][] = "failed append tag to contact";
    $result["error"]["smartsender"] = $add;
  }
} else if ($_SERVER["REQUEST_METHOD"] == "DELETE") {
  if ($input["userId"] == NULL) {
    $result["state"] = false;
    $result["error"]["message"][] = "'userId' is missing";
  }
  if ($input["tagId"] == NULL) {
    $result["state"] = false;
    $result["error"]["message"][] = "'tagId' is missing";
  }
  if ($result["state"] == false) {
    echo json_encode($result);
    exit;
  }
  $add = json_decode(send_bearer("https://api.smartsender.com/v1/contacts/".$input["userId"]."/tags/".$input["tagId"], $ssToken, "DELETE"), true);
  if ($add["state"] != true) {
    $result["state"] = false;
    $result["error"]["message"][] = "failed delete tag from contact";
    $result["error"]["smartsender"] = $add;
  }
} else {
  $result["state"] = false;
  $result["error"]["message"][] = "method is not supported. Use methods GET, POST, DELETE";
}

echo json_encode($result, JSON_UNESCAPED_UNICODE);