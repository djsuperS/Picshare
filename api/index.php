<?php
// Headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// OPTIONS request afhandelen voor CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Verkrijg het request pad
$request_uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri_segments = explode('/', trim($request_uri, '/'));

// Controleer of we in de API zijn
if(isset($uri_segments[0]) && $uri_segments[0] === 'api') {
    // Bepaal welk endpoint wordt aangeroepen
    if(isset($uri_segments[1])) {
        switch($uri_segments[1]) {
            case 'auth':
                require_once 'auth.php';
                break;
                
            case 'users':
                require_once 'users.php';
                break;
                
            case 'albums':
                require_once 'albums.php';
                break;
                
            case 'album_permissions':
                require_once 'album_permissions.php';
                break;
                
            case 'photos':
                require_once 'photos.php';
                break;
                
            case 'friends':
                require_once 'friends.php';
                break;
                
            default:
                // Onbekend eindpunt
                http_response_code(404);
                echo json_encode(["message" => "Endpoint not found."]);
                break;
        }
    } else {
        // Geen specifiek eindpunt opgegeven
        http_response_code(200);
        echo json_encode([
            "message" => "Welcome to the Picshare API",
            "available_endpoints" => [
                "auth" => "Authentication endpoints (login, register, verify token)",
                "users" => "User management",
                "albums" => "Album management",
                "album_permissions" => "Album sharing and permissions",
                "photos" => "Photo management",
                "friends" => "Friendship management"
            ],
            "version" => "1.0.0"
        ]);
    }
} else {
    // Niet in de API
    http_response_code(404);
    echo json_encode(["message" => "API endpoint not found."]);
}
?> 