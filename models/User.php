<?php
class User {
    private $conn;
    private $table_name = "users";

    public $id;
    public $username;
    public $email;
    public $password_hash;
    public $phone;
    public $profile_picture;
    public $created_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Gebruiker aanmaken
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                SET username=:username, email=:email, password_hash=:password_hash, 
                phone=:phone, profile_picture=:profile_picture";

        $stmt = $this->conn->prepare($query);

        // Sanitize input
        $this->username = htmlspecialchars(strip_tags($this->username));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->password_hash = htmlspecialchars(strip_tags($this->password_hash));
        $this->phone = htmlspecialchars(strip_tags($this->phone));
        $this->profile_picture = htmlspecialchars(strip_tags($this->profile_picture));

        // Bind values
        $stmt->bindParam(":username", $this->username);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":password_hash", $this->password_hash);
        $stmt->bindParam(":phone", $this->phone);
        $stmt->bindParam(":profile_picture", $this->profile_picture);

        // Execute query
        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Alle gebruikers ophalen
    public function read() {
        $query = "SELECT * FROM " . $this->table_name;
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    // Specifieke gebruiker ophalen
    public function readOne() {
        $query = "SELECT * FROM " . $this->table_name . " WHERE id = ? LIMIT 0,1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if($row) {
            $this->username = $row['username'];
            $this->email = $row['email'];
            $this->password_hash = $row['password_hash'];
            $this->phone = $row['phone'];
            $this->profile_picture = $row['profile_picture'];
            $this->created_at = $row['created_at'];
            return true;
        }
        return false;
    }

    // Gebruiker bijwerken
    public function update() {
        $query = "UPDATE " . $this->table_name . "
                SET username=:username, email=:email, phone=:phone, profile_picture=:profile_picture
                WHERE id=:id";

        $stmt = $this->conn->prepare($query);

        // Sanitize input
        $this->username = htmlspecialchars(strip_tags($this->username));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->phone = htmlspecialchars(strip_tags($this->phone));
        $this->profile_picture = htmlspecialchars(strip_tags($this->profile_picture));
        $this->id = htmlspecialchars(strip_tags($this->id));

        // Bind values
        $stmt->bindParam(":username", $this->username);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":phone", $this->phone);
        $stmt->bindParam(":profile_picture", $this->profile_picture);
        $stmt->bindParam(":id", $this->id);

        // Execute query
        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Wachtwoord wijzigen
    public function updatePassword() {
        $query = "UPDATE " . $this->table_name . "
                SET password_hash=:password_hash
                WHERE id=:id";

        $stmt = $this->conn->prepare($query);

        // Sanitize input
        $this->password_hash = htmlspecialchars(strip_tags($this->password_hash));
        $this->id = htmlspecialchars(strip_tags($this->id));

        // Bind values
        $stmt->bindParam(":password_hash", $this->password_hash);
        $stmt->bindParam(":id", $this->id);

        // Execute query
        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Gebruiker verwijderen
    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Inloggen - gebruiker ophalen op basis van email
    public function getUserByEmail() {
        $query = "SELECT * FROM " . $this->table_name . " WHERE email = ? LIMIT 0,1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->email);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if($row) {
            $this->id = $row['id'];
            $this->username = $row['username'];
            $this->email = $row['email'];
            $this->password_hash = $row['password_hash'];
            $this->phone = $row['phone'];
            $this->profile_picture = $row['profile_picture'];
            $this->created_at = $row['created_at'];
            return true;
        }
        return false;
    }
}
?> 