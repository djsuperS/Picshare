<?php
// Headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Database en model classes
include_once '../config/database.php';
include_once '../models/User.php';
include_once '../models/Auth.php';
include_once '../models/UserSetting.php';

// Database connectie
$database = new Database();
$db = $database->getConnection();

// User object
$user = new User($db);
$auth = new Auth($db);
$user_setting = new UserSetting($db);

// Request method en URI
$request_method = $_SERVER["REQUEST_METHOD"];
$request_uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri_segments = explode('/', trim($request_uri, '/'));

// Haal de token uit de header
$headers = getallheaders();
$token = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : null;

// Authenticatie check
$current_user = null;
if($token) {
    $current_user = $auth->getUserFromToken($token);
    if(!$current_user) {
        http_response_code(401);
        echo json_encode(["message" => "Invalid or expired token."]);
        exit;
    }
}

// Route verwerken
switch($request_method) {
    case 'GET':
        if(isset($uri_segments[2]) && is_numeric($uri_segments[2])) {
            // GET /api/users/{id} - Haal gebruiker op
            $user->id = $uri_segments[2];
            if($user->readOne()) {
                // Standaard alleen basisgegevens tonen
                $user_data = [
                    "id" => $user->id,
                    "username" => $user->username,
                    "profile_picture" => $user->profile_picture
                ];
                
                // Als het de ingelogde gebruiker is of een admin, toon meer details
                if($current_user && ($current_user['id'] == $user->id)) {
                    $user_data["email"] = $user->email;
                    $user_data["phone"] = $user->phone;
                    $user_data["created_at"] = $user->created_at;
                    
                    // Ook user settings ophalen
                    $user_setting->user_id = $user->id;
                    if($user_setting->read()) {
                        $user_data["settings"] = [
                            "receive_notifications" => (bool)$user_setting->receive_notifications,
                            "receive_friend_requests" => (bool)$user_setting->receive_friend_requests,
                            "receive_email_notifications" => (bool)$user_setting->receive_email_notifications,
                            "profile_visibility" => $user_setting->profile_visibility,
                            "theme" => $user_setting->theme
                        ];
                    }
                }
                
                http_response_code(200);
                echo json_encode($user_data);
            } else {
                http_response_code(404);
                echo json_encode(["message" => "User not found."]);
            }
        } else {
            // GET /api/users - Lijst van gebruikers
            // Alleen beschikbaar voor beheerders of met een filter voor vrienden
            if(!$current_user) {
                http_response_code(401);
                echo json_encode(["message" => "Authentication required."]);
                exit;
            }
            
            // Gebruikers ophalen
            $stmt = $user->read();
            $num = $stmt->rowCount();
            
            if($num > 0) {
                $users_arr = [];
                $users_arr["records"] = [];
                
                while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                    extract($row);
                    
                    $user_item = [
                        "id" => $id,
                        "username" => $username,
                        "profile_picture" => $profile_picture
                    ];
                    
                    array_push($users_arr["records"], $user_item);
                }
                
                http_response_code(200);
                echo json_encode($users_arr);
            } else {
                http_response_code(200);
                echo json_encode(["message" => "No users found."]);
            }
        }
        break;
        
    case 'PUT':
        // PUT /api/users/{id} - Gebruiker bijwerken
        // Authenticatie is vereist en alleen je eigen profiel kun je bijwerken
        if(!$current_user) {
            http_response_code(401);
            echo json_encode(["message" => "Authentication required."]);
            exit;
        }
        
        if(isset($uri_segments[2]) && is_numeric($uri_segments[2])) {
            $user->id = $uri_segments[2];
            
            // Alleen je eigen profiel bijwerken
            if($current_user['id'] != $user->id) {
                http_response_code(403);
                echo json_encode(["message" => "Access denied. You can only update your own profile."]);
                exit;
            }
            
            // Lees de ingevoerde data
            $data = json_decode(file_get_contents("php://input"));
            
            if(isset($data->username)) $user->username = $data->username;
            if(isset($data->email)) $user->email = $data->email;
            if(isset($data->phone)) $user->phone = $data->phone;
            if(isset($data->profile_picture)) $user->profile_picture = $data->profile_picture;
            
            // Bijwerken van gebruikersgegevens
            if($user->update()) {
                // Indien er instellingen zijn meegegeven, ook deze bijwerken
                if(isset($data->settings)) {
                    $user_setting->user_id = $user->id;
                    
                    if(isset($data->settings->receive_notifications)) 
                        $user_setting->receive_notifications = $data->settings->receive_notifications;
                        
                    if(isset($data->settings->receive_friend_requests)) 
                        $user_setting->receive_friend_requests = $data->settings->receive_friend_requests;
                        
                    if(isset($data->settings->receive_email_notifications)) 
                        $user_setting->receive_email_notifications = $data->settings->receive_email_notifications;
                        
                    if(isset($data->settings->profile_visibility)) 
                        $user_setting->profile_visibility = $data->settings->profile_visibility;
                        
                    if(isset($data->settings->theme)) 
                        $user_setting->theme = $data->settings->theme;
                    
                    $user_setting->update();
                }
                
                http_response_code(200);
                echo json_encode(["message" => "User updated successfully."]);
            } else {
                http_response_code(500);
                echo json_encode(["message" => "Unable to update user."]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["message" => "Invalid user ID."]);
        }
        break;
        
    case 'DELETE':
        // DELETE /api/users/{id} - Gebruiker verwijderen
        // Authenticatie is vereist en alleen je eigen account kun je verwijderen
        if(!$current_user) {
            http_response_code(401);
            echo json_encode(["message" => "Authentication required."]);
            exit;
        }
        
        if(isset($uri_segments[2]) && is_numeric($uri_segments[2])) {
            $user->id = $uri_segments[2];
            
            // Alleen je eigen account verwijderen
            if($current_user['id'] != $user->id) {
                http_response_code(403);
                echo json_encode(["message" => "Access denied. You can only delete your own account."]);
                exit;
            }
            
            if($user->delete()) {
                http_response_code(200);
                echo json_encode(["message" => "User deleted successfully."]);
            } else {
                http_response_code(500);
                echo json_encode(["message" => "Unable to delete user."]);
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