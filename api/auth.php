<?php
// Headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Database en model classes
include_once '../config/database.php';
include_once '../models/Auth.php';

// Database connectie
$database = new Database();
$db = $database->getConnection();

// Auth object
$auth = new Auth($db);

// Verwerken van de request
$request_method = $_SERVER["REQUEST_METHOD"];

// Alleen POST requests
if($request_method === "POST") {
    // Lees de ingevoerde data
    $data = json_decode(file_get_contents("php://input"));

    // Route bepalen op basis van action parameter
    if(!empty($data->action)) {
        switch($data->action) {
            case 'login':
                handleLogin($auth, $data);
                break;
                
            case 'register':
                handleRegister($auth, $data);
                break;
                
            case 'verify_token':
                handleVerifyToken($auth, $data);
                break;
                
            default:
                // Ongeldige actie
                http_response_code(400);
                echo json_encode(["message" => "Invalid action."]);
                break;
        }
    } else {
        // Geen actie voorzien
        http_response_code(400);
        echo json_encode(["message" => "No action specified."]);
    }
} else {
    // Methode niet toegestaan
    http_response_code(405);
    echo json_encode(["message" => "Method not allowed."]);
}

// Login functie
function handleLogin($auth, $data) {
    // Vereiste velden controleren
    if(!empty($data->email) && !empty($data->password)) {
        // Probeer in te loggen
        $result = $auth->login($data->email, $data->password);
        
        if($result && $result["success"]) {
            // Succesvolle login
            http_response_code(200);
            echo json_encode($result);
        } else {
            // Login mislukt
            http_response_code(401);
            echo json_encode(["message" => "Invalid email or password."]);
        }
    } else {
        // Vereiste data ontbreekt
        http_response_code(400);
        echo json_encode(["message" => "Email and password are required."]);
    }
}

// Registratie functie
function handleRegister($auth, $data) {
    // Vereiste velden controleren
    if(!empty($data->username) && !empty($data->email) && !empty($data->password)) {
        // Probeer te registreren
        $result = $auth->register(
            $data->username, 
            $data->email, 
            $data->password, 
            $data->phone ?? null, 
            $data->profile_picture ?? null
        );
        
        if($result["success"]) {
            // Succesvolle registratie
            http_response_code(201);
            echo json_encode($result);
        } else {
            // Registratie mislukt
            http_response_code(400);
            echo json_encode($result);
        }
    } else {
        // Vereiste data ontbreekt
        http_response_code(400);
        echo json_encode(["message" => "Username, email and password are required."]);
    }
}

// Token verificatie functie
function handleVerifyToken($auth, $data) {
    // Controleer of token aanwezig is
    if(!empty($data->token)) {
        // Token valideren
        $user = $auth->getUserFromToken($data->token);
        
        if($user) {
            // Token is geldig, gebruikersgegevens teruggeven
            http_response_code(200);
            echo json_encode([
                "success" => true,
                "user_id" => $user["id"],
                "username" => $user["username"],
                "email" => $user["email"],
                "profile_picture" => $user["profile_picture"]
            ]);
        } else {
            // Ongeldige token
            http_response_code(401);
            echo json_encode(["message" => "Invalid or expired token."]);
        }
    } else {
        // Token ontbreekt
        http_response_code(400);
        echo json_encode(["message" => "Token is required."]);
    }
}
?> 