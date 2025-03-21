<?php
// Database configuratie
$db_config = [
    'host' => 'localhost',
    'dbname' => 'portfolio_db',
    'user' => '100907-6',
    'password' => 'Thierry11.99', 
    'options' => [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]
];

// Functie om een database verbinding te maken
function getDbConnection() {
    global $db_config;
    
    try {
        $dsn = "mysql:host={$db_config['host']};dbname={$db_config['dbname']}";
        $pdo = new PDO($dsn, $db_config['user'], $db_config['password'], $db_config['options']);
        return $pdo;
    } catch (PDOException $e) {
        // Log de fout in plaats van deze te tonen (in productie)
        error_log("Database Connection Error: " . $e->getMessage());
        return null;
    }
} 