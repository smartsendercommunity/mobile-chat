<?php

ini_set('max_execution_time', '1700');
set_time_limit(1700);
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Content-Type: application/json; charset=utf-8');
http_response_code(200);

$ssToken = "ktmH**********************************2Jl2";
$auth = [
  [
    "login" => "test",
    "password" => "test",
  ],
  [
    "login" => "test2",
    "password" => "test2"
  ],
];


$input = json_decode(file_get_contents("php://input"), true);
if ($_COOKIE["chatAuth"] != NULL) {
  $authData = $_COOKIE["chatAuth"];
} else if ($input["login"] != NULL && $input["pass"] != NULL) {
  $authData = base64_encode($input["login"].":".md5($input["pass"]));
}

$authDone = false;
foreach ($auth as $user) {
  $authCheck = base64_encode($user["login"].":".md5($user["password"]));
  if ($authCheck == $authData) {
    $authDone = true;
    if ($user["retoken"] != NULL) {
      $ssToken = $user["retoken"];
    }
    break;
  }
}

if ($authDone) {
  setcookie("chatAuth", $authData, (time()+500000), dirname($_SERVER["PHP_SELF"]), $_SERVER["HTTP_HOST"], true);
} else {
  $result["state"] = false;
  http_response_code(301);
  $result["error"]["message"][] = "failed authorization";
  echo json_encode($result);
  exit;
}

function send_bearer($url, $token, $type = "GET", $param = []){
  $descriptor = curl_init($url);
  curl_setopt($descriptor, CURLOPT_POSTFIELDS, json_encode($param));
  curl_setopt($descriptor, CURLOPT_RETURNTRANSFER, 1);
  curl_setopt($descriptor, CURLOPT_HTTPHEADER, array("User-Agent: M-Soft Integration", "Content-Type: application/json", "Authorization: Bearer ".$token)); 
  curl_setopt($descriptor, CURLOPT_CUSTOMREQUEST, $type);
  $itog = curl_exec($descriptor);
  curl_close($descriptor);
  return $itog;
}