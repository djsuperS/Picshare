<?php
// Headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Database en model classes
include_once '../config/database.php';
include_once '../models/Friend.php';
include_once '../models/Auth.php';
include_once '../models/User.php';
include_once '../models/UserSetting.php';

// Database connectie
$database = new Database();
$db = $database->getConnection();

// Objecten
$friend = new Friend($db);
$auth = new Auth($db);
$user = new User($db);
$user_setting = new UserSetting($db);

// Request method en URI
$request_method = $_SERVER["REQUEST_METHOD"];
$request_uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri_segments = explode('/', trim($request_uri, '/'));

// Haal de token uit de header
$headers = getallheaders();
$token = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : null;

// Authenticatie check - voor vriendschappen is inloggen vereist
$current_user = null;
if($token) {
    $current_user = $auth->getUserFromToken($token);
    if(!$current_user) {
        http_response_code(401);
        echo json_encode(["message" => "Invalid or expired token."]);
        exit;
    }
} else {
    http_response_code(401);
    echo json_encode(["message" => "Authentication required."]);
    exit;
}

// Route verwerken
switch($request_method) {
    case 'GET':
        if(isset($uri_segments[2]) && $uri_segments[2] === 'requests') {
            // GET /api/friends/requests - Vriendschapsverzoeken ophalen
            $stmt = $friend->getPendingRequests($current_user['id']);
            $num = $stmt->rowCount();
            
            $requests_arr = [];
            $requests_arr["records"] = [];
            
            while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                extract($row);
                
                $request_item = [
                    "id" => $id,
                    "sender_id" => $sender_id,
                    "sender_name" => $sender_name,
                    "sender_picture" => $sender_picture,
                    "created_at" => $created_at
                ];
                
                array_push($requests_arr["records"], $request_item);
            }
            
            http_response_code(200);
            echo json_encode($requests_arr);
        } else {
            // GET /api/friends - Vrienden ophalen
            $stmt = $friend->getFriends($current_user['id']);
            $num = $stmt->rowCount();
            
            $friends_arr = [];
            $friends_arr["records"] = [];
            
            while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                extract($row);
                
                $friend_item = [
                    "id" => $id,
                    "username" => $username,
                    "profile_picture" => $profile_picture
                ];
                
                array_push($friends_arr["records"], $friend_item);
            }
            
            http_response_code(200);
            echo json_encode($friends_arr);
        }
        break;
        
    case 'POST':
        // POST /api/friends - Vriendschapsverzoek versturen
        // Lees de ingevoerde data
        $data = json_decode(file_get_contents("php://input"));
        
        if(!empty($data->receiver_id)) {
            // Controleren of ontvangende gebruiker bestaat
            $user->id = $data->receiver_id;
            if(!$user->readOne()) {
                http_response_code(404);
                echo json_encode(["message" => "User not found."]);
                exit;
            }
            
            // Controleren of gebruiker zichzelf niet als vriend toevoegt
            if($data->receiver_id == $current_user['id']) {
                http_response_code(400);
                echo json_encode(["message" => "You cannot send a friend request to yourself."]);
                exit;
            }
            
            // Controleren of de ontvangende gebruiker vriendschapsverzoeken accepteert
            $user_setting->user_id = $data->receiver_id;
            if(!$user_setting->wantsFriendRequests()) {
                http_response_code(403);
                echo json_encode(["message" => "This user does not accept friend requests."]);
                exit;
            }
            
            // Verstuur vriendschapsverzoek
            $friend->sender_id = $current_user['id'];
            $friend->receiver_id = $data->receiver_id;
            
            $request_id = $friend->sendRequest();
            
            if($request_id) {
                http_response_code(201);
                echo json_encode([
                    "message" => "Friend request sent successfully.",
                    "request_id" => $request_id
                ]);
            } else {
                http_response_code(503);
                echo json_encode(["message" => "Friend request could not be sent. You might already be friends or have a pending request."]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["message" => "Receiver ID is required."]);
        }
        break;
        
    case 'PUT':
        // PUT /api/friends/requests/{id} - Vriendschapsverzoek accepteren of weigeren
        if(isset($uri_segments[2]) && $uri_segments[2] === 'requests' && isset($uri_segments[3]) && is_numeric($uri_segments[3])) {
            $request_id = $uri_segments[3];
            $friend->id = $request_id;
            $friend->receiver_id = $current_user['id'];
            
            // Lees de ingevoerde data
            $data = json_decode(file_get_contents("php://input"));
            
            if(!empty($data->action)) {
                switch($data->action) {
                    case 'accept':
                        if($friend->acceptRequest()) {
                            http_response_code(200);
                            echo json_encode(["message" => "Friend request accepted successfully."]);
                        } else {
                            http_response_code(503);
                            echo json_encode(["message" => "Unable to accept friend request."]);
                        }
                        break;
                        
                    case 'decline':
                        if($friend->declineRequest()) {
                            http_response_code(200);
                            echo json_encode(["message" => "Friend request declined."]);
                        } else {
                            http_response_code(503);
                            echo json_encode(["message" => "Unable to decline friend request."]);
                        }
                        break;
                        
                    default:
                        http_response_code(400);
                        echo json_encode(["message" => "Invalid action. Use 'accept' or 'decline'."]);
                        break;
                }
            } else {
                http_response_code(400);
                echo json_encode(["message" => "Action is required."]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["message" => "Invalid request ID."]);
        }
        break;
        
    case 'DELETE':
        // DELETE /api/friends/{user_id} - Vriendschap verwijderen
        if(isset($uri_segments[2]) && is_numeric($uri_segments[2])) {
            $other_user_id = $uri_segments[2];
            
            // Controleren of de andere gebruiker bestaat
            $user->id = $other_user_id;
            if(!$user->readOne()) {
                http_response_code(404);
                echo json_encode(["message" => "User not found."]);
                exit;
            }
            
            // Vriendschap verwijderen
            if($friend->removeFriend($current_user['id'], $other_user_id)) {
                http_response_code(200);
                echo json_encode(["message" => "Friendship removed successfully."]);
            } else {
                http_response_code(503);
                echo json_encode(["message" => "Unable to remove friendship."]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["message" => "Invalid user ID."]);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(["message" => "Method not allowed."]);
        break;
}
?> 