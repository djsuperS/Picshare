<?php
class Auth {
    private $conn;
    private $table_name = "users";
    
    private $secret_key = "your_secret_key_here";
    
    public function __construct($db) {
        $this->conn = $db;
    }
    
    // Login functie
    public function login($email, $password) {
        // SQL query om gebruiker op basis van email te vinden
        $query = "SELECT id, username, email, password_hash, profile_picture FROM " . $this->table_name . " WHERE email = ? LIMIT 0,1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $email);
        $stmt->execute();
        
        if($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Controleer password
            if(password_verify($password, $row['password_hash'])) {
                return $this->generateToken($row);
            }
        }
        
        return false;
    }
    
    // Registratie functie
    public function register($username, $email, $password, $phone = null, $profile_picture = null) {
        // Controleer of email al bestaat
        $email_check_query = "SELECT id FROM " . $this->table_name . " WHERE email = ? LIMIT 0,1";
        $email_check_stmt = $this->conn->prepare($email_check_query);
        $email_check_stmt->bindParam(1, $email);
        $email_check_stmt->execute();
        
        if($email_check_stmt->rowCount() > 0) {
            return [
                "success" => false,
                "message" => "Email is already in use."
            ];
        }
        
        // Controleer of username al bestaat
        $username_check_query = "SELECT id FROM " . $this->table_name . " WHERE username = ? LIMIT 0,1";
        $username_check_stmt = $this->conn->prepare($username_check_query);
        $username_check_stmt->bindParam(1, $username);
        $username_check_stmt->execute();
        
        if($username_check_stmt->rowCount() > 0) {
            return [
                "success" => false,
                "message" => "Username is already taken."
            ];
        }
        
        // Hash het wachtwoord
        $password_hash = password_hash($password, PASSWORD_BCRYPT);
        
        // Query voor gebruiker aanmaken
        $query = "INSERT INTO " . $this->table_name . " 
                  SET username = :username, 
                      email = :email, 
                      password_hash = :password_hash,
                      phone = :phone,
                      profile_picture = :profile_picture";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize input
        $username = htmlspecialchars(strip_tags($username));
        $email = htmlspecialchars(strip_tags($email));
        $phone = htmlspecialchars(strip_tags($phone));
        $profile_picture = htmlspecialchars(strip_tags($profile_picture));
        
        // Bind values
        $stmt->bindParam(":username", $username);
        $stmt->bindParam(":email", $email);
        $stmt->bindParam(":password_hash", $password_hash);
        $stmt->bindParam(":phone", $phone);
        $stmt->bindParam(":profile_picture", $profile_picture);
        
        if($stmt->execute()) {
            $user_id = $this->conn->lastInsertId();
            
            // Standaard instellingen aanmaken voor nieuwe gebruiker
            include_once 'UserSetting.php';
            $userSetting = new UserSetting($this->conn);
            $userSetting->user_id = $user_id;
            $userSetting->createDefault();
            
            // Genereer token en return gebruikersdata
            return [
                "success" => true,
                "user_id" => $user_id,
                "username" => $username,
                "email" => $email,
                "token" => $this->generateJWT($user_id)
            ];
        }
        
        return [
            "success" => false,
            "message" => "Unable to register user."
        ];
    }
    
    // Methode om gebruikersdata met token te genereren
    private function generateToken($user) {
        return [
            "success" => true,
            "user_id" => $user['id'],
            "username" => $user['username'],
            "email" => $user['email'],
            "profile_picture" => $user['profile_picture'],
            "token" => $this->generateJWT($user['id'])
        ];
    }
    
    // JWT token genereren
    private function generateJWT($user_id) {
        $issued_at = time();
        $expiration = $issued_at + (60 * 60 * 24); // Token geldig voor 24 uur
        
        $payload = [
            "iat" => $issued_at,
            "exp" => $expiration,
            "user_id" => $user_id
        ];
        
        return $this->encode($payload);
    }
    
    // Simpele JWT encoder
    private function encode($payload) {
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $header = $this->base64UrlEncode($header);
        
        $payload = json_encode($payload);
        $payload = $this->base64UrlEncode($payload);
        
        $signature = hash_hmac('sha256', "$header.$payload", $this->secret_key, true);
        $signature = $this->base64UrlEncode($signature);
        
        return "$header.$payload.$signature";
    }
    
    // Base64Url encoding
    private function base64UrlEncode($data) {
        $base64 = base64_encode($data);
        $base64Url = strtr($base64, '+/', '-_');
        return rtrim($base64Url, '=');
    }
    
    // Token valideren
    public function validateToken($token) {
        if(empty($token)) {
            return false;
        }
        
        $parts = explode('.', $token);
        if(count($parts) != 3) {
            return false;
        }
        
        list($header, $payload, $signature) = $parts;
        
        $valid_signature = hash_hmac('sha256', "$header.$payload", $this->secret_key, true);
        $valid_signature_encoded = $this->base64UrlEncode($valid_signature);
        
        if($signature !== $valid_signature_encoded) {
            return false;
        }
        
        $payload_data = json_decode(base64_decode(strtr($payload, '-_', '+/')), true);
        
        if(isset($payload_data['exp']) && $payload_data['exp'] < time()) {
            return false; // Token is verlopen
        }
        
        return $payload_data;
    }
    
    // Gebruiker opalen via token
    public function getUserFromToken($token) {
        $payload = $this->validateToken($token);
        
        if(!$payload || !isset($payload['user_id'])) {
            return false;
        }
        
        $user_id = $payload['user_id'];
        
        $query = "SELECT id, username, email, profile_picture FROM " . $this->table_name . " WHERE id = ? LIMIT 0,1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $user_id);
        $stmt->execute();
        
        if($stmt->rowCount() > 0) {
            return $stmt->fetch(PDO::FETCH_ASSOC);
        }
        
        return false;
    }
}
?> 