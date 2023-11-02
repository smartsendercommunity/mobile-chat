<?php

include("config.php");

$result["state"] = true;
$result["collection"] = [];
if ($_GET["page"] == NULL) {
  $_GET["page"] = 1;
}

$chats = json_decode(send_bearer("https://api.smartsender.com/v1/chats?page=".$_GET["page"]."&limitation=20", $ssToken), true);
if (array_key_exists("collection", $chats)) {
  $result["collection"] = $chats["collection"];
  $result["cursor"] = $chats["cursor"];
} else {
  $result["state"] = false;
  $result["error"]["message"][] = "failed load chats";
  $result["error"]["Smart Sender"] = $chats;
}


echo json_encode($result, JSON_UNESCAPED_UNICODE);