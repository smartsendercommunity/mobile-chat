<?php

include("config.php");

$result["state"] = true;
if ($_GET["id"] == NULL) {
  $result["state"] = false;
  $result["error"]["message"][] = "'id' is missing";
  echo json_encode($result);
  exit;
}

$result["contactInfo"] = json_decode(send_bearer("https://api.smartsender.com/v1/contacts/".$_GET["id"]."/chat", $ssToken), true);
if ($result["contactInfo"]["error"] != NULL) {
  $result["state"] = false;
}
echo json_encode($result, JSON_UNESCAPED_UNICODE);