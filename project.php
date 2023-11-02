<?php

include("config.php");

$resut["state"] = true;

$result["project"] = json_decode(send_bearer("https://api.smartsender.com/v1/me", $ssToken), true);
if ($result["project"]["error"] != NULL) {
  $result["state"] = false;
}

echo json_encode($result);