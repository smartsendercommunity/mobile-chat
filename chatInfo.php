<?php

include("config.php");

$result["state"] = true;

$result["chatInfo"] = json_decode(send_bearer("https://api.smartsender.com/v1/chats/".$_GET["id"], $ssToken), true);
if ($result["chatInfo"]["error"] != NULL) {
  $result["state"] = false;
}

echo json_encode($result);