<?php

$result["state"] = true;
include("config.php");

if ($_GET["id"] == NULL) {
  $result["state"] = false;
  $result["error"]["message"][] = "'id' is missing";
  echo json_encode($result);
  exit;
}
$result["userDetail"] = json_decode(send_bearer("https://api.smartsender.com/v1/contacts/".$_GET["id"], $ssToken), true);
if (array_key_exists("error", $result["userDetail"])) {
  $result["state"] = false;
  $result["error"]["message"][] = "failed load user detail";
}

echo json_encode($result, JSON_UNESCAPED_UNICODE);