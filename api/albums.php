<?php
// Headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Database en model classes
include_once '../config/database.php';
include_once '../models/Album.php';
include_once '../models/Auth.php';
include_once '../models/AlbumPermission.php';

// Database connectie
$database = new Database();
$db = $database->getConnection();

// Objecten
$album = new Album($db);
$auth = new Auth($db);
$album_permission = new AlbumPermission($db);

// Request method en URI
$request_method = $_SERVER["REQUEST_METHOD"];
$request_uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri_segments = explode('/', trim($request_uri, '/'));

// Haal de token uit de header
$headers = getallheaders();
$token = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : null;

// Authenticatie check - voor albums is inloggen vereist
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
        if(isset($uri_segments[2]) && is_numeric($uri_segments[2])) {
            // GET /api/albums/{id} - Haal album op
            $album->id = $uri_segments[2];
            if($album->readOne()) {
                $album_data = [
                    "id" => $album->id,
                    "album_name" => $album->album_name,
                    "created_by" => $album->created_by,
                    "created_at" => $album->created_at,
                    "thumbnail" => $album->thumbnail
                ];
                
                // Machtigingen checken
                $is_owner = ($album->created_by == $current_user['id']);
                
                // Als het niet je eigen album is, controleer of je toegang hebt
                if(!$is_owner) {
                    $album_permission->album_id = $album->id;
                    $album_permission->user_id = $current_user['id'];
                    $album_permission->read();
                }
                
                // Permissies toevoegen aan response
                $album_data["permissions"] = [
                    "is_owner" => $is_owner,
                    "can_add_photos" => $is_owner || $album_permission->canAddPhotos(),
                    "can_delete_photos" => $is_owner || $album_permission->canDeletePhotos()
                ];
                
                http_response_code(200);
                echo json_encode($album_data);
            } else {
                http_response_code(404);
                echo json_encode(["message" => "Album not found."]);
            }
        } else {
            // GET /api/albums - Lijst van albums voor de ingelogde gebruiker
            // Dit kan eigen albums zijn of albums waar toegang voor is verleend
            $albums_arr = [];
            $albums_arr["records"] = [];
            
            // Eigen albums ophalen
            $stmt = $album->readByUser($current_user['id']);
            
            while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                extract($row);
                
                $album_item = [
                    "id" => $id,
                    "album_name" => $album_name,
                    "created_by" => $created_by,
                    "creator_name" => $creator_name,
                    "created_at" => $created_at,
                    "thumbnail" => $thumbnail,
                    "is_owner" => true
                ];
                
                array_push($albums_arr["records"], $album_item);
            }
            
            // Albums ophalen waar toegang voor is verleend
            $stmt = $album->readUserAccessible($current_user['id']);
            
            while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                extract($row);
                
                // Alleen toevoegen als het niet al in de lijst staat (dus geen eigen album is)
                if($created_by != $current_user['id']) {
                    $album_item = [
                        "id" => $id,
                        "album_name" => $album_name,
                        "created_by" => $created_by,
                        "creator_name" => $creator_name,
                        "created_at" => $created_at,
                        "thumbnail" => $thumbnail,
                        "is_owner" => false
                    ];
                    
                    array_push($albums_arr["records"], $album_item);
                }
            }
            
            http_response_code(200);
            echo json_encode($albums_arr);
        }
        break;
        
    case 'POST':
        // POST /api/albums - Nieuw album aanmaken
        // Lees de ingevoerde data
        $data = json_decode(file_get_contents("php://input"));
        
        if(!empty($data->album_name)) {
            // Waarden instellen
            $album->album_name = $data->album_name;
            $album->created_by = $current_user['id'];
            $album->thumbnail = !empty($data->thumbnail) ? $data->thumbnail : null;
            
            // Album aanmaken
            $album_id = $album->create();
            
            if($album_id) {
                http_response_code(201);
                echo json_encode([
                    "message" => "Album created successfully.",
                    "album_id" => $album_id
                ]);
            } else {
                http_response_code(503);
                echo json_encode(["message" => "Unable to create album."]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["message" => "Album name is required."]);
        }
        break;
        
    case 'PUT':
        // PUT /api/albums/{id} - Album bijwerken
        if(isset($uri_segments[2]) && is_numeric($uri_segments[2])) {
            $album->id = $uri_segments[2];
            
            // Controleren of het album bestaat en of de gebruiker de eigenaar is
            if($album->readOne()) {
                if($album->created_by != $current_user['id']) {
                    http_response_code(403);
                    echo json_encode(["message" => "Access denied. You can only update your own albums."]);
                    exit;
                }
                
                // Lees de ingevoerde data
                $data = json_decode(file_get_contents("php://input"));
                
                // Waarden bijwerken
                if(isset($data->album_name)) $album->album_name = $data->album_name;
                if(isset($data->thumbnail)) $album->thumbnail = $data->thumbnail;
                
                // Album updaten
                if($album->update()) {
                    http_response_code(200);
                    echo json_encode(["message" => "Album updated successfully."]);
                } else {
                    http_response_code(503);
                    echo json_encode(["message" => "Unable to update album."]);
                }
            } else {
                http_response_code(404);
                echo json_encode(["message" => "Album not found."]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["message" => "Invalid album ID."]);
        }
        break;
        
    case 'DELETE':
        // DELETE /api/albums/{id} - Album verwijderen
        if(isset($uri_segments[2]) && is_numeric($uri_segments[2])) {
            $album->id = $uri_segments[2];
            
            // Controleren of het album bestaat
            if($album->readOne()) {
                // Alleen de eigenaar kan het album verwijderen
                if($album->created_by != $current_user['id']) {
                    http_response_code(403);
                    echo json_encode(["message" => "Access denied. You can only delete your own albums."]);
                    exit;
                }
                
                // Album verwijderen
                $album->created_by = $current_user['id']; // Extra beveiliging
                if($album->delete()) {
                    http_response_code(200);
                    echo json_encode(["message" => "Album deleted successfully."]);
                } else {
                    http_response_code(503);
                    echo json_encode(["message" => "Unable to delete album."]);
                }
            } else {
                http_response_code(404);
                echo json_encode(["message" => "Album not found."]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["message" => "Invalid album ID."]);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(["message" => "Method not allowed."]);
        break;
}
?> 