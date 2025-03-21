<?php
// Headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Database en model classes
include_once '../config/database.php';
include_once '../models/Photo.php';
include_once '../models/Album.php';
include_once '../models/Auth.php';
include_once '../models/AlbumPermission.php';

// Database connectie
$database = new Database();
$db = $database->getConnection();

// Objecten
$photo = new Photo($db);
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

// Authenticatie check - voor foto's is inloggen vereist
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
        if(isset($uri_segments[2]) && $uri_segments[2] === 'album' && isset($uri_segments[3]) && is_numeric($uri_segments[3])) {
            // GET /api/photos/album/{album_id} - Foto's van een album ophalen
            $album_id = $uri_segments[3];
            
            // Controleren of het album bestaat
            $album->id = $album_id;
            if($album->readOne()) {
                // Controleren of de gebruiker toegang heeft tot het album
                $is_owner = ($album->created_by == $current_user['id']);
                
                if(!$is_owner) {
                    // Controleren of de gebruiker permissies heeft voor dit album
                    $album_permission->album_id = $album_id;
                    $album_permission->user_id = $current_user['id'];
                    if(!$album_permission->read()) {
                        http_response_code(403);
                        echo json_encode(["message" => "Access denied. You don't have permission for this album."]);
                        exit;
                    }
                }
                
                // Foto's ophalen
                $photo->album_id = $album_id;
                $stmt = $photo->readByAlbum();
                $num = $stmt->rowCount();
                
                $photos_arr = [];
                $photos_arr["records"] = [];
                
                while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                    extract($row);
                    
                    $photo_item = [
                        "id" => $id,
                        "album_id" => $album_id,
                        "photo_url" => $photo_url,
                        "uploaded_by" => $uploaded_by,
                        "uploader_name" => $uploader_name,
                        "uploaded_at" => $uploaded_at
                    ];
                    
                    array_push($photos_arr["records"], $photo_item);
                }
                
                http_response_code(200);
                echo json_encode($photos_arr);
            } else {
                http_response_code(404);
                echo json_encode(["message" => "Album not found."]);
            }
        } elseif(isset($uri_segments[2]) && is_numeric($uri_segments[2])) {
            // GET /api/photos/{id} - Specifieke foto ophalen
            $photo->id = $uri_segments[2];
            if($photo->readOne()) {
                // Controleren of de gebruiker toegang heeft tot het album
                $album->id = $photo->album_id;
                $album->readOne();
                $is_owner = ($album->created_by == $current_user['id']);
                
                if(!$is_owner) {
                    // Controleren of de gebruiker permissies heeft voor dit album
                    $album_permission->album_id = $photo->album_id;
                    $album_permission->user_id = $current_user['id'];
                    if(!$album_permission->read()) {
                        http_response_code(403);
                        echo json_encode(["message" => "Access denied. You don't have permission for this album."]);
                        exit;
                    }
                }
                
                $photo_data = [
                    "id" => $photo->id,
                    "album_id" => $photo->album_id,
                    "photo_url" => $photo->photo_url,
                    "uploaded_by" => $photo->uploaded_by,
                    "uploaded_at" => $photo->uploaded_at
                ];
                
                http_response_code(200);
                echo json_encode($photo_data);
            } else {
                http_response_code(404);
                echo json_encode(["message" => "Photo not found."]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["message" => "Invalid photo or album ID."]);
        }
        break;
        
    case 'POST':
        // POST /api/photos - Nieuwe foto toevoegen
        // Lees de ingevoerde data
        $data = json_decode(file_get_contents("php://input"));
        
        if(!empty($data->album_id) && !empty($data->photo_url)) {
            $album_id = $data->album_id;
            
            // Controleren of het album bestaat
            $album->id = $album_id;
            if($album->readOne()) {
                // Controleren of de gebruiker rechten heeft om foto's toe te voegen
                $is_owner = ($album->created_by == $current_user['id']);
                
                if(!$is_owner) {
                    // Controleren of de gebruiker permissies heeft om foto's toe te voegen
                    if(!$photo->canAddPhoto($current_user['id'], $album_id)) {
                        http_response_code(403);
                        echo json_encode(["message" => "Access denied. You don't have permission to add photos to this album."]);
                        exit;
                    }
                }
                
                // Foto toevoegen
                $photo->album_id = $album_id;
                $photo->photo_url = $data->photo_url;
                $photo->uploaded_by = $current_user['id'];
                
                $photo_id = $photo->create();
                
                if($photo_id) {
                    // Als dit de eerste foto is en het album nog geen thumbnail heeft, deze als thumbnail instellen
                    if(empty($album->thumbnail)) {
                        $album->thumbnail = $data->photo_url;
                        $album->update();
                    }
                    
                    http_response_code(201);
                    echo json_encode([
                        "message" => "Photo added successfully.",
                        "photo_id" => $photo_id
                    ]);
                } else {
                    http_response_code(503);
                    echo json_encode(["message" => "Unable to add photo."]);
                }
            } else {
                http_response_code(404);
                echo json_encode(["message" => "Album not found."]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["message" => "Album ID and photo URL are required."]);
        }
        break;
        
    case 'DELETE':
        // DELETE /api/photos/{id} - Foto verwijderen
        if(isset($uri_segments[2]) && is_numeric($uri_segments[2])) {
            $photo->id = $uri_segments[2];
            
            // Foto ophalen om album en uploader te controleren
            if($photo->readOne()) {
                // Controleren of de gebruiker rechten heeft om deze foto te verwijderen
                $album->id = $photo->album_id;
                $album->readOne();
                
                $is_owner = ($album->created_by == $current_user['id']);
                $is_uploader = ($photo->uploaded_by == $current_user['id']);
                
                if(!$is_owner && !$is_uploader) {
                    // Controleren of de gebruiker permissies heeft om foto's te verwijderen
                    $album_permission->album_id = $photo->album_id;
                    $album_permission->user_id = $current_user['id'];
                    
                    if(!$album_permission->canDeletePhotos()) {
                        http_response_code(403);
                        echo json_encode(["message" => "Access denied. You don't have permission to delete photos from this album."]);
                        exit;
                    }
                }
                
                // Foto verwijderen
                $photo->uploaded_by = $current_user['id']; // Voor controle in het model
                if($photo->delete()) {
                    http_response_code(200);
                    echo json_encode(["message" => "Photo deleted successfully."]);
                } else {
                    http_response_code(503);
                    echo json_encode(["message" => "Unable to delete photo."]);
                }
            } else {
                http_response_code(404);
                echo json_encode(["message" => "Photo not found."]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["message" => "Invalid photo ID."]);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(["message" => "Method not allowed."]);
        break;
}
?> 