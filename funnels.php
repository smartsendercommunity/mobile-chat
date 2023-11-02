<?php

$result["state"] = true;
include("config.php");

if ($_SERVER["REQUEST_METHOD"] == "GET") {
  if ($_GET["page"] == NULL) {
    $_GET["page"] = 1;
  }
  $result["term"] = $_GET["term"];
  $funnels = json_decode(send_bearer("https://api.smartsender.com/v1/funnels?limitation=20&page=".$_GET["page"]."&term=".$_GET["term"], $ssToken), true);
  if (array_key_exists("collection", $funnels)) {
    $result["funnels"] = $funnels["collection"];
    $result["cursor"] = $funnels["cursor"];
  } else {
    $result["state"] = false;
    $result["error"]["message"][] = "failed load funnels";
    $result["error"]["smartsender"] = $funnels;
  }
} else if ($_SERVER["REQUEST_METHOD"] == "POST") {
  if ($input["userId"] == NULL) {
    $result["state"] = false;
    $result["error"]["message"][] = "'userId' is missing";
  }
  if ($input["funnelId"] == NULL) {
    $result["state"] = false;
    $result["error"]["message"][] = "'funnelId' is missing";
  }
  if ($result["state"] == false) {
    echo json_encode($result);
    exit;
  }
  $add = json_decode(send_bearer("https://api.smartsender.com/v1/contacts/".$input["userId"]."/funnels/".$input["funnelId"], $ssToken, "POST"), true);
  if ($add["state"] != true) {
    $result["state"] = false;
    $result["error"]["message"][] = "failed append funnel to contact";
    $result["error"]["smartsender"] = $add;
  }
} else if ($_SERVER["REQUEST_METHOD"] == "DELETE") {
  if ($input["userId"] == NULL) {
    $result["state"] = false;
    $result["error"]["message"][] = "'userId' is missing";
  }
  if ($input["funnelId"] == NULL) {
    $result["state"] = false;
    $result["error"]["message"][] = "'funnelId' is missing";
  }
  if ($result["state"] == false) {
    echo json_encode($result);
    exit;
  }
  $add = json_decode(send_bearer("https://api.smartsender.com/v1/contacts/".$input["userId"]."/funnels/".$input["funnelId"], $ssToken, "DELETE"), true);
  if ($add["state"] != true) {
    $result["state"] = false;
    $result["error"]["message"][] = "failed delete funnel from contact";
    $result["error"]["smartsender"] = $add;
  }
} else {
  $result["state"] = false;
  $result["error"]["message"][] = "method is not supported. Use methods GET, POST, DELETE";
}

echo json_encode($result, JSON_UNESCAPED_UNICODE);