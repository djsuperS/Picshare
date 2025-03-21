<?php
// Database configuratie laden
require_once 'config.php';

// Verbinding maken met database
$pdo = getDbConnection();
if (!$pdo) {
    die("Database connection failed");
}

// Controleren of er al gebruikers zijn in de database
$stmt = $pdo->query("SELECT COUNT(*) as count FROM users");
$count = $stmt->fetch()['count'];

if ($count > 0) {
    echo "Database is al gevuld met gegevens. Seed overgeslagen.<br>";
    echo "Als je de seed toch wilt uitvoeren, leeg dan eerst de tabellen.<br>";
    exit;
}

// Voorbeeld gebruikers toevoegen
$users = [
    [
        'username' => 'johndoe',
        'email' => 'john@example.com',
        'password' => 'password123',
        'age' => 28,
        'phone' => '0612345678',
        'profile_picture' => 'https://randomuser.me/api/portraits/men/1.jpg'
    ],
    [
        'username' => 'janedoe',
        'email' => 'jane@example.com',
        'password' => 'password123',
        'age' => 25,
        'phone' => '0687654321',
        'profile_picture' => 'https://randomuser.me/api/portraits/women/1.jpg'
    ],
    [
        'username' => 'marksmith',
        'email' => 'mark@example.com',
        'password' => 'password123',
        'age' => 32,
        'phone' => '0698765432',
        'profile_picture' => 'https://randomuser.me/api/portraits/men/2.jpg'
    ]
];

$userIds = [];

try {
    $pdo->beginTransaction();
    
    // Gebruikers toevoegen
    $stmt = $pdo->prepare("
        INSERT INTO users (username, email, password_hash, phone, profile_picture, age)
        VALUES (:username, :email, :password_hash, :phone, :profile_picture, :age)
    ");
    
    foreach ($users as $user) {
        $stmt->execute([
            'username' => $user['username'],
            'email' => $user['email'],
            'password_hash' => password_hash($user['password'], PASSWORD_DEFAULT),
            'phone' => $user['phone'],
            'profile_picture' => $user['profile_picture'],
            'age' => $user['age']
        ]);
        
        $userIds[] = $pdo->lastInsertId();
    }
    
    // Voorbeeldalbums toevoegen
    $albums = [
        [
            'name' => 'Vakantie 2023',
            'description' => 'Mooie foto\'s van onze zomervakantie',
            'created_by' => $userIds[0],
            'thumbnail' => 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
        ],
        [
            'name' => 'Familiereünie',
            'description' => 'Foto\'s van de familiebijeenkomst vorige maand',
            'created_by' => $userIds[0],
            'thumbnail' => 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
        ],
        [
            'name' => 'Natuurfotografie',
            'description' => 'Mijn collectie natuurfoto\'s',
            'created_by' => $userIds[1],
            'thumbnail' => 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
        ],
        [
            'name' => 'Stedentrip Parijs',
            'description' => 'Foto\'s van mijn reis naar Parijs',
            'created_by' => $userIds[2],
            'thumbnail' => 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
        ],
    ];
    
    $albumIds = [];
    
    $stmt = $pdo->prepare("
        INSERT INTO albums (album_name, description, created_by, thumbnail)
        VALUES (:name, :description, :created_by, :thumbnail)
    ");
    
    foreach ($albums as $album) {
        $stmt->execute([
            'name' => $album['name'],
            'description' => $album['description'],
            'created_by' => $album['created_by'],
            'thumbnail' => $album['thumbnail']
        ]);
        
        $albumIds[] = $pdo->lastInsertId();
    }
    
    // Voorbeeldfoto's toevoegen aan albums
    $photos = [
        [
            'album_id' => $albumIds[0],
            'photo_url' => 'https://images.unsplash.com/photo-1594717527389-a590b56e8d0a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
            'title' => 'Strand',
            'description' => 'Mooie dag op het strand',
            'uploaded_by' => $userIds[0]
        ],
        [
            'album_id' => $albumIds[0],
            'photo_url' => 'https://images.unsplash.com/photo-1602002418082-dd4a9fd8a0a9?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
            'title' => 'Zwembad',
            'description' => 'Relaxen bij het zwembad',
            'uploaded_by' => $userIds[0]
        ],
        [
            'album_id' => $albumIds[1],
            'photo_url' => 'https://images.unsplash.com/photo-1541515929569-1771522cbaa9?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
            'title' => 'Familie',
            'description' => 'De hele familie bij elkaar',
            'uploaded_by' => $userIds[0]
        ],
        [
            'album_id' => $albumIds[2],
            'photo_url' => 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
            'title' => 'Bergen',
            'description' => 'Prachtig berglandschap',
            'uploaded_by' => $userIds[1]
        ],
        [
            'album_id' => $albumIds[2],
            'photo_url' => 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
            'title' => 'Bos',
            'description' => 'Een rustig bos in de herfst',
            'uploaded_by' => $userIds[1]
        ],
        [
            'album_id' => $albumIds[3],
            'photo_url' => 'https://images.unsplash.com/photo-1509439581779-6298f75bf6e5?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
            'title' => 'Eiffeltoren',
            'description' => 'Uitzicht op de Eiffeltoren',
            'uploaded_by' => $userIds[2]
        ]
    ];
    
    $stmt = $pdo->prepare("
        INSERT INTO album_photos (album_id, photo_url, title, description, uploaded_by)
        VALUES (:album_id, :photo_url, :title, :description, :uploaded_by)
    ");
    
    foreach ($photos as $photo) {
        $stmt->execute([
            'album_id' => $photo['album_id'],
            'photo_url' => $photo['photo_url'],
            'title' => $photo['title'],
            'description' => $photo['description'],
            'uploaded_by' => $photo['uploaded_by']
        ]);
    }
    
    // Vriendschappen toevoegen
    $stmt = $pdo->prepare("
        INSERT INTO friends (user1_id, user2_id)
        VALUES (:user1_id, :user2_id)
    ");
    
    // John en Jane zijn vrienden
    $stmt->execute([
        'user1_id' => $userIds[0],
        'user2_id' => $userIds[1]
    ]);
    
    // John en Mark zijn vrienden
    $stmt->execute([
        'user1_id' => $userIds[0],
        'user2_id' => $userIds[2]
    ]);
    
    // Gebruikersinstellingen toevoegen
    $stmt = $pdo->prepare("
        INSERT INTO user_settings (user_id, profile_visibility, theme)
        VALUES (:user_id, :profile_visibility, :theme)
    ");
    
    foreach ($userIds as $userId) {
        $stmt->execute([
            'user_id' => $userId,
            'profile_visibility' => 'public',
            'theme' => 'light'
        ]);
    }
    
    // Notificaties toevoegen
    $stmt = $pdo->prepare("
        INSERT INTO notifications (user_id, type, message)
        VALUES (:user_id, :type, :message)
    ");
    
    $stmt->execute([
        'user_id' => $userIds[0],
        'type' => 'album_invite',
        'message' => 'Jane heeft je uitgenodigd voor het album "Natuurfotografie"'
    ]);
    
    $stmt->execute([
        'user_id' => $userIds[1],
        'type' => 'photo_comment',
        'message' => 'John heeft gereageerd op je foto "Bergen"'
    ]);
    
    $pdo->commit();
    
    echo "Seed succesvol uitgevoerd!<br>";
    echo "Toegevoegde gebruikers:<br>";
    foreach ($users as $user) {
        echo "- {$user['username']} (email: {$user['email']}, wachtwoord: {$user['password']})<br>";
    }
    
} catch (PDOException $e) {
    $pdo->rollBack();
    die("Seed error: " . $e->getMessage());
} 