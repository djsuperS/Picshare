<?php
// CORS headers - API toegankelijk maken vanaf frontend
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

// Preflight request afhandelen
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Database configuratie laden
require_once 'config.php';

// Request path ophalen (bijv. /albums, /users)
$request_uri = $_SERVER['REQUEST_URI'];
$uri_parts = explode('/', trim(parse_url($request_uri, PHP_URL_PATH), '/'));
$api_endpoint = end($uri_parts);

// Query parameters ophalen
$query_parts = [];
if (isset($_SERVER['QUERY_STRING'])) {
    parse_str($_SERVER['QUERY_STRING'], $query_parts);
}

// Bepaal het API endpoint uit de query parameters (bijv. ?albums of ?photos)
foreach (array_keys($query_parts) as $key) {
    if (in_array($key, ['albums', 'users', 'login', 'photos'])) {
        $api_endpoint = $key;
        break;
    }
}

// Database verbinding maken
$pdo = getDbConnection();
if (!$pdo) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

// API endpoints
switch ($api_endpoint) {
    // GET /api/albums - alle albums ophalen
    // GET /api/albums?userId=1 - albums van een specifieke gebruiker ophalen
    // GET /api/albums?id=1 - een specifiek album ophalen
    case 'albums':
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            try {
                // Controleren of er een id parameter is (voor een specifiek album)
                $albumId = isset($_GET['id']) ? (int)$_GET['id'] : null;
                
                if ($albumId) {
                    // Specifiek album ophalen
                    $stmt = $pdo->prepare("
                        SELECT a.* 
                        FROM albums a
                        WHERE a.id = :albumId
                    ");
                    $stmt->execute(['albumId' => $albumId]);
                    $album = $stmt->fetch();
                    
                    if ($album) {
                        echo json_encode($album);
                    } else {
                        http_response_code(404);
                        echo json_encode(['error' => 'Album not found']);
                    }
                    exit;
                }
                
                // Controleren of er een userId parameter is
                $userId = isset($_GET['userId']) ? (int)$_GET['userId'] : null;
                
                if ($userId) {
                    // Albums van een specifieke gebruiker ophalen
                    $stmt = $pdo->prepare("
                        SELECT a.* 
                        FROM albums a
                        WHERE a.created_by = :userId
                        ORDER BY a.created_at DESC
                    ");
                    $stmt->execute(['userId' => $userId]);
                } else {
                    // Alle albums ophalen
                    $stmt = $pdo->query("
                        SELECT a.*, u.username as creator_name
                        FROM albums a
                        JOIN users u ON a.created_by = u.id
                        ORDER BY a.created_at DESC
                    ");
                }
                
                $albums = $stmt->fetchAll();
                echo json_encode($albums);
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
            }
        } 
        // POST /api/albums - nieuw album aanmaken
        else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            try {
                // Controleren of er een multipart form is verzonden
                if (!empty($_POST)) {
                    $name = $_POST['name'] ?? '';
                    $description = $_POST['description'] ?? '';
                    $userId = (int)($_POST['userId'] ?? 0);
                    
                    // Validatie
                    if (empty($name) || empty($description) || $userId <= 0) {
                        http_response_code(400);
                        echo json_encode(['error' => 'Invalid input data']);
                        exit;
                    }
                    
                    // Thumbnail verwerking
                    $thumbnailPath = null;
                    if (isset($_FILES['thumbnail']) && $_FILES['thumbnail']['error'] === UPLOAD_ERR_OK) {
                        $uploadDir = 'uploads/';
                        if (!is_dir($uploadDir)) {
                            mkdir($uploadDir, 0755, true);
                        }
                        
                        $filename = uniqid() . '_' . basename($_FILES['thumbnail']['name']);
                        $uploadFile = $uploadDir . $filename;
                        
                        if (move_uploaded_file($_FILES['thumbnail']['tmp_name'], $uploadFile)) {
                            $thumbnailPath = '/' . $uploadFile;
                        }
                    }
                    
                    // Album toevoegen aan database
                    $stmt = $pdo->prepare("
                        INSERT INTO albums (album_name, description, created_by, thumbnail)
                        VALUES (:name, :description, :userId, :thumbnail)
                    ");
                    
                    $stmt->execute([
                        'name' => $name,
                        'description' => $description,
                        'userId' => $userId,
                        'thumbnail' => $thumbnailPath
                    ]);
                    
                    $albumId = $pdo->lastInsertId();
                    
                    // Nieuw album ophalen om terug te sturen
                    $stmt = $pdo->prepare("
                        SELECT a.*, u.username as creator_name
                        FROM albums a
                        JOIN users u ON a.created_by = u.id
                        WHERE a.id = :albumId
                    ");
                    $stmt->execute(['albumId' => $albumId]);
                    $album = $stmt->fetch();
                    
                    http_response_code(201);
                    echo json_encode($album);
                } else {
                    // JSON data verwerken als geen multipart form
                    $data = json_decode(file_get_contents('php://input'), true);
                    
                    if (!$data || !isset($data['name']) || !isset($data['description']) || !isset($data['userId'])) {
                        http_response_code(400);
                        echo json_encode(['error' => 'Invalid JSON data']);
                        exit;
                    }
                    
                    $stmt = $pdo->prepare("
                        INSERT INTO albums (album_name, description, created_by, thumbnail)
                        VALUES (:name, :description, :userId, :thumbnail)
                    ");
                    
                    $stmt->execute([
                        'name' => $data['name'],
                        'description' => $data['description'],
                        'userId' => (int)$data['userId'],
                        'thumbnail' => $data['thumbnail'] ?? null
                    ]);
                    
                    $albumId = $pdo->lastInsertId();
                    
                    // Nieuw album ophalen om terug te sturen
                    $stmt = $pdo->prepare("
                        SELECT a.*, u.username as creator_name
                        FROM albums a
                        JOIN users u ON a.created_by = u.id
                        WHERE a.id = :albumId
                    ");
                    $stmt->execute(['albumId' => $albumId]);
                    $album = $stmt->fetch();
                    
                    http_response_code(201);
                    echo json_encode($album);
                }
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
            }
        } else {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
        }
        break;
        
    // GET /api/photos?albumId=1 - foto's van een album ophalen
    // POST /api/photos - foto's uploaden naar een album
    case 'photos':
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            try {
                // Controleer of er een albumId parameter is
                $albumId = isset($_GET['albumId']) ? (int)$_GET['albumId'] : null;
                
                if (!$albumId) {
                    http_response_code(400);
                    echo json_encode(['error' => 'albumId parameter is required']);
                    exit;
                }
                
                // Haal alle foto's op voor het gegeven album
                $stmt = $pdo->prepare("
                    SELECT p.*, u.username as uploader_name
                    FROM album_photos p
                    JOIN users u ON p.uploaded_by = u.id
                    WHERE p.album_id = :albumId
                    ORDER BY p.uploaded_at DESC
                ");
                $stmt->execute(['albumId' => $albumId]);
                $photos = $stmt->fetchAll();
                
                echo json_encode($photos);
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
            }
        }
        // POST /api/photos - foto's toevoegen aan een album
        else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            try {
                // Controleer de benodigde parameters
                $albumId = isset($_POST['albumId']) ? (int)$_POST['albumId'] : null;
                $userId = isset($_POST['userId']) ? (int)$_POST['userId'] : null;
                $caption = $_POST['caption'] ?? '';
                
                if (!$albumId || !$userId) {
                    http_response_code(400);
                    echo json_encode(['error' => 'albumId and userId parameters are required']);
                    exit;
                }
                
                // Controleer of het album bestaat
                $stmt = $pdo->prepare("SELECT id FROM albums WHERE id = :albumId");
                $stmt->execute(['albumId' => $albumId]);
                if (!$stmt->fetch()) {
                    http_response_code(404);
                    echo json_encode(['error' => 'Album not found']);
                    exit;
                }
                
                // Upload directory
                $uploadDir = 'uploads/';
                if (!is_dir($uploadDir)) {
                    mkdir($uploadDir, 0755, true);
                }
                
                // Verzamelen van geüploade foto's
                $uploadedPhotos = [];
                
                // Zoek naar alle foto's in de FILES array
                foreach ($_FILES as $key => $file) {
                    if (strpos($key, 'photo_') === 0 && $file['error'] === UPLOAD_ERR_OK) {
                        $filename = uniqid() . '_' . basename($file['name']);
                        $uploadFile = $uploadDir . $filename;
                        
                        if (move_uploaded_file($file['tmp_name'], $uploadFile)) {
                            // Foto toevoegen aan database
                            $stmt = $pdo->prepare("
                                INSERT INTO album_photos (album_id, photo_url, title, description, uploaded_by)
                                VALUES (:album_id, :photo_url, :title, :description, :uploaded_by)
                            ");
                            
                            $stmt->execute([
                                'album_id' => $albumId,
                                'photo_url' => '/' . $uploadFile,
                                'title' => $caption,
                                'description' => $caption,
                                'uploaded_by' => $userId
                            ]);
                            
                            $photoId = $pdo->lastInsertId();
                            
                            // Foto ophalen om terug te sturen
                            $stmt = $pdo->prepare("
                                SELECT p.*, u.username as uploader_name
                                FROM album_photos p
                                JOIN users u ON p.uploaded_by = u.id
                                WHERE p.id = :photoId
                            ");
                            $stmt->execute(['photoId' => $photoId]);
                            $photo = $stmt->fetch();
                            
                            $uploadedPhotos[] = $photo;
                        }
                    }
                }
                
                if (empty($uploadedPhotos)) {
                    http_response_code(400);
                    echo json_encode(['error' => 'No photos were uploaded successfully']);
                    exit;
                }
                
                http_response_code(201);
                echo json_encode($uploadedPhotos);
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
            }
        } else {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
        }
        break;
        
    // GET /api/users - alle gebruikers ophalen
    // GET /api/users?id=1 - een specifieke gebruiker ophalen
    case 'users':
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            try {
                // Controleren of er een id parameter is
                $userId = isset($_GET['id']) ? (int)$_GET['id'] : null;
                
                if ($userId) {
                    // Specifieke gebruiker ophalen
                    $stmt = $pdo->prepare("
                        SELECT id, username, email, phone, profile_picture, age, created_at 
                        FROM users 
                        WHERE id = :userId
                    ");
                    $stmt->execute(['userId' => $userId]);
                    $user = $stmt->fetch();
                    
                    if ($user) {
                        echo json_encode($user);
                    } else {
                        http_response_code(404);
                        echo json_encode(['error' => 'User not found']);
                    }
                } else {
                    // Alle gebruikers ophalen (zonder wachtwoord)
                    $stmt = $pdo->query("
                        SELECT id, username, email, phone, profile_picture, age, created_at 
                        FROM users
                        ORDER BY username
                    ");
                    
                    $users = $stmt->fetchAll();
                    echo json_encode($users);
                }
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
            }
        } else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            // Gebruiker registratie logica hier
            try {
                $data = json_decode(file_get_contents('php://input'), true);
                
                if (!$data || !isset($data['username']) || !isset($data['email']) || !isset($data['password']) || !isset($data['age'])) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Invalid user data']);
                    exit;
                }
                
                // Controleren of username of email al bestaat
                $stmt = $pdo->prepare("
                    SELECT id FROM users WHERE username = :username OR email = :email
                ");
                $stmt->execute([
                    'username' => $data['username'],
                    'email' => $data['email']
                ]);
                
                if ($stmt->rowCount() > 0) {
                    http_response_code(409);
                    echo json_encode(['error' => 'Username or email already exists']);
                    exit;
                }
                
                // Wachtwoord hashen
                $passwordHash = password_hash($data['password'], PASSWORD_DEFAULT);
                
                // Gebruiker toevoegen
                $stmt = $pdo->prepare("
                    INSERT INTO users (username, email, password_hash, phone, profile_picture, age)
                    VALUES (:username, :email, :password_hash, :phone, :profile_picture, :age)
                ");
                
                $stmt->execute([
                    'username' => $data['username'],
                    'email' => $data['email'],
                    'password_hash' => $passwordHash,
                    'phone' => $data['phone'] ?? null,
                    'profile_picture' => $data['profile_picture'] ?? null,
                    'age' => (int)$data['age']
                ]);
                
                $userId = $pdo->lastInsertId();
                
                // Nieuwe gebruiker ophalen (zonder wachtwoord)
                $stmt = $pdo->prepare("
                    SELECT id, username, email, phone, profile_picture, age, created_at 
                    FROM users 
                    WHERE id = :userId
                ");
                $stmt->execute(['userId' => $userId]);
                $user = $stmt->fetch();
                
                http_response_code(201);
                echo json_encode($user);
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
            }
        } else {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
        }
        break;
        
    // GET /api/login - gebruiker inloggen
    case 'login':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            try {
                $data = json_decode(file_get_contents('php://input'), true);
                
                if (!$data || !isset($data['email']) || !isset($data['password'])) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Invalid login data']);
                    exit;
                }
                
                // Gebruiker zoeken op email
                $stmt = $pdo->prepare("
                    SELECT id, username, email, password_hash, phone, profile_picture, age, created_at 
                    FROM users 
                    WHERE email = :email
                ");
                $stmt->execute(['email' => $data['email']]);
                $user = $stmt->fetch();
                
                if (!$user || !password_verify($data['password'], $user['password_hash'])) {
                    http_response_code(401);
                    echo json_encode(['error' => 'Invalid email or password']);
                    exit;
                }
                
                // Wachtwoord verwijderen uit response
                unset($user['password_hash']);
                
                echo json_encode($user);
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
            }
        } else {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
        }
        break;

    // API endpoint niet gevonden
    default:
        http_response_code(404);
        echo json_encode(['error' => 'API endpoint not found']);
        break;
} 