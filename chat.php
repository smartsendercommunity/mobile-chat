<?php

include("config.php");

$result["state"] = true;

if ($_SERVER["REQUEST_METHOD"] == "GET") {
  $result["collection"] = [];
  if ($_GET["page"] == NULL) {
    $_GET["page"] = 1;
  }
  if ($_GET["id"] == NULL) {
    $result["state"] = false;
    $result["error"]["message"][] = "chatId is missing";
    echo json_encode($result);
    exit;
  }
  $messages = json_decode(send_bearer("https://api.smartsender.com/v1/chats/".$_GET["id"]."/messages?activities=1&limitation=20&page=".$_GET["page"], $ssToken), true);
  if (array_key_exists("collection", $messages)) {
    $result["collection"] = $messages["collection"];
    $result["cursor"] = $messages["cursor"];
  } else {
    $result["state"] = false;
    $result["error"]["message"][] = "failed load messages";
    $result["error"]["smartsender"] = $messages;
  }
} else if ($_SERVER["REQUEST_METHOD"] == "POST") {
  if ($input["userId"] == NULL) {
    $result["state"] = false;
    $result["error"]["message"][] = "'userId' is missing";
  }
  if ($input["type"] == NULL) {
    $result["state"] = false;
    $result["error"]["message"][] = "'type' is missing";
  }
  if ($input["content"] == NULL) {
    $result["state"] = false;
    $result["error"]["message"][] = "'content' is missing";
  }
  if ($result["state"] == false) {
    echo json_encode($result);
    exit;
  }
  if ($input["type"] == "text") {
    $send = json_decode(send_bearer("https://api.smartsender.com/v1/contacts/".$input["userId"]."/send", $ssToken, "POST", [
      "type" => "text",
      "watermark" => 1,
      "content" => $input["content"],
    ]), true);
    if (array_key_exists("content", $send)) {
      $result["message"] = $send;
    } else {
      $result["state"] = false;
      $result["error"]["message"][] = "failed send text message";
      $result["error"]["smartsender"] = $send;
    }
  }
} else if ($_SERVER["REQUEST_METHOD"] == "PUT") {
  if ($input["gateId"] == NULL) {
    $result["state"] = false;
    $result["error"]["message"][] = "'gateId' is missing";
  }
  if ($input["messageId"] == NULL) {
    $result["state"] = false;
    $result["error"]["message"][] = "'messageId' is missing";
  }
  if ($input["text"] == NULL) {
    $result["state"] = false;
    $result["error"]["message"][] = "'text' is missing";
  }
  if ($result["state"] == false) {
    echo json_encode($result);
    exit;
  }
  $edit = json_decode(send_bearer("https://api.smartsender.com/v1/gates/".$input["gateId"]."/messages", $ssToken, "PUT", [
    "text" => $input["text"],
    "messageId" => $input["messageId"],
  ]), true);
  if ($edit["state"] != true) {
    $result["state"] = false;
    $result["error"]["message"][] = "failed edit message";
    $result["error"]["smartsender"] = $edit;
  }
} else if ($_SERVER["REQUEST_METHOD"] == "DELETE") {
  if ($input["gateId"] == NULL) {
    $result["state"] = false;
    $result["error"]["message"][] = "'gateId' is missing";
  }
  if ($input["messageId"] == NULL) {
    $result["state"] = false;
    $result["error"]["message"][] = "'messageId' is missing";
  }
  if ($result["state"] == false) {
    echo json_encode($result);
    exit;
  }
  $del = json_decode(send_bearer("https://api.smartsender.com/v1/gates/".$input["gateId"]."/messages", $ssToken, "DELETE", ["messageIds"=>[$input["messageId"]]]), true);
  if ($del["state"] != true) {
    $result["state"] = false;
    $result["error"]["message"][] = "failed delete message";
    $result["error"]["smartsender"] = $del;
  }
} else {
  $result["state"] = false;
  $result["error"]["message"][] = "method is not supported. Use methods GET, POST, PUT, DELETE";
}



echo json_encode($result, JSON_UNESCAPED_UNICODE);