<?php
// Headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Database en model classes
include_once '../config/database.php';
include_once '../models/AlbumPermission.php';
include_once '../models/Album.php';
include_once '../models/Auth.php';
include_once '../models/Friend.php';
include_once '../models/User.php';

// Database connectie
$database = new Database();
$db = $database->getConnection();

// Objecten
$album_permission = new AlbumPermission($db);
$album = new Album($db);
$auth = new Auth($db);
$friend = new Friend($db);
$user = new User($db);

// Request method en URI
$request_method = $_SERVER["REQUEST_METHOD"];
$request_uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri_segments = explode('/', trim($request_uri, '/'));

// Haal de token uit de header
$headers = getallheaders();
$token = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : null;

// Authenticatie check - voor album permissies is inloggen vereist
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
        // GET /api/album_permissions/{album_id} - Permissies voor een album ophalen
        if(isset($uri_segments[2]) && is_numeric($uri_segments[2])) {
            $album_id = $uri_segments[2];
            
            // Controleren of het album bestaat en of de gebruiker er toegang toe heeft
            $album->id = $album_id;
            if($album->readOne()) {
                // Alleen de eigenaar kan permissies bekijken
                if($album->created_by != $current_user['id']) {
                    http_response_code(403);
                    echo json_encode(["message" => "Access denied. Only the album owner can view permissions."]);
                    exit;
                }
                
                $album_permission->album_id = $album_id;
                $stmt = $album_permission->readByAlbum();
                $num = $stmt->rowCount();
                
                $permissions_arr = [];
                $permissions_arr["records"] = [];
                
                while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                    extract($row);
                    
                    $permission_item = [
                        "id" => $id,
                        "user_id" => $user_id,
                        "username" => $username,
                        "profile_picture" => $profile_picture,
                        "can_add_photos" => (bool)$can_add_photos,
                        "can_delete_photos" => (bool)$can_delete_photos
                    ];
                    
                    array_push($permissions_arr["records"], $permission_item);
                }
                
                http_response_code(200);
                echo json_encode($permissions_arr);
            } else {
                http_response_code(404);
                echo json_encode(["message" => "Album not found."]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["message" => "Invalid album ID."]);
        }
        break;
        
    case 'POST':
        // POST /api/album_permissions - Nieuwe permissie toevoegen
        // Lees de ingevoerde data
        $data = json_decode(file_get_contents("php://input"));
        
        if(!empty($data->album_id) && !empty($data->user_id)) {
            // Controleren of het album bestaat en of de gebruiker de eigenaar is
            $album->id = $data->album_id;
            if(!$album->readOne() || $album->created_by != $current_user['id']) {
                http_response_code(403);
                echo json_encode(["message" => "Access denied. Only the album owner can add permissions."]);
                exit;
            }
            
            // Controleren of de doelgebruiker bestaat
            $user->id = $data->user_id;
            if(!$user->readOne()) {
                http_response_code(404);
                echo json_encode(["message" => "Target user not found."]);
                exit;
            }
            
            // Controleren of de gebruikers vrienden zijn
            if(!$friend->areFriends($current_user['id'], $user->id)) {
                http_response_code(403);
                echo json_encode(["message" => "You can only share albums with friends."]);
                exit;
            }
            
            // Waarden instellen
            $album_permission->album_id = $data->album_id;
            $album_permission->user_id = $data->user_id;
            $album_permission->can_add_photos = isset($data->can_add_photos) ? $data->can_add_photos : false;
            $album_permission->can_delete_photos = isset($data->can_delete_photos) ? $data->can_delete_photos : false;
            
            // Permissie aanmaken of bijwerken
            if($album_permission->createOrUpdate()) {
                http_response_code(201);
                echo json_encode(["message" => "Permission added successfully."]);
            } else {
                http_response_code(503);
                echo json_encode(["message" => "Unable to add permission."]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["message" => "Album ID and user ID are required."]);
        }
        break;
        
    case 'PUT':
        // PUT /api/album_permissions/{id} - Permissie bijwerken
        if(isset($uri_segments[2]) && is_numeric($uri_segments[2])) {
            $album_permission->id = $uri_segments[2];
            
            // Permissie ophalen om album_id te krijgen
            $album_permission->read();
            
            // Controleren of het album bestaat en of de gebruiker de eigenaar is
            $album->id = $album_permission->album_id;
            if(!$album->readOne() || $album->created_by != $current_user['id']) {
                http_response_code(403);
                echo json_encode(["message" => "Access denied. Only the album owner can update permissions."]);
                exit;
            }
            
            // Lees de ingevoerde data
            $data = json_decode(file_get_contents("php://input"));
            
            // Waarden bijwerken
            if(isset($data->can_add_photos)) $album_permission->can_add_photos = $data->can_add_photos;
            if(isset($data->can_delete_photos)) $album_permission->can_delete_photos = $data->can_delete_photos;
            
            // Permissie bijwerken
            if($album_permission->update()) {
                http_response_code(200);
                echo json_encode(["message" => "Permission updated successfully."]);
            } else {
                http_response_code(503);
                echo json_encode(["message" => "Unable to update permission."]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["message" => "Invalid permission ID."]);
        }
        break;
        
    case 'DELETE':
        // DELETE /api/album_permissions/{id} - Permissie verwijderen
        if(isset($uri_segments[2]) && is_numeric($uri_segments[2])) {
            $album_permission->id = $uri_segments[2];
            
            // Permissie ophalen om album_id te krijgen
            $album_permission->read();
            
            // Controleren of het album bestaat en of de gebruiker de eigenaar is
            $album->id = $album_permission->album_id;
            if(!$album->readOne() || $album->created_by != $current_user['id']) {
                http_response_code(403);
                echo json_encode(["message" => "Access denied. Only the album owner can delete permissions."]);
                exit;
            }
            
            // Permissie verwijderen
            if($album_permission->delete()) {
                http_response_code(200);
                echo json_encode(["message" => "Permission deleted successfully."]);
            } else {
                http_response_code(503);
                echo json_encode(["message" => "Unable to delete permission."]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["message" => "Invalid permission ID."]);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(["message" => "Method not allowed."]);
        break;
}
?> 