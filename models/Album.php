<?php
class Album {
    private $conn;
    private $table_name = "albums";

    public $id;
    public $album_name;
    public $created_by;
    public $created_at;
    public $thumbnail;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Nieuw album aanmaken
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                SET album_name=:album_name, created_by=:created_by, thumbnail=:thumbnail";

        $stmt = $this->conn->prepare($query);

        // Sanitize input
        $this->album_name = htmlspecialchars(strip_tags($this->album_name));
        $this->created_by = htmlspecialchars(strip_tags($this->created_by));
        $this->thumbnail = htmlspecialchars(strip_tags($this->thumbnail));

        // Bind values
        $stmt->bindParam(":album_name", $this->album_name);
        $stmt->bindParam(":created_by", $this->created_by);
        $stmt->bindParam(":thumbnail", $this->thumbnail);

        // Execute query
        if($stmt->execute()) {
            return $this->conn->lastInsertId();
        }
        return false;
    }

    // Alle albums ophalen
    public function read() {
        $query = "SELECT a.*, u.username as creator_name 
                FROM " . $this->table_name . " a
                LEFT JOIN users u ON a.created_by = u.id";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    // Albums ophalen van een specifieke gebruiker
    public function readByUser($user_id) {
        $query = "SELECT a.*, u.username as creator_name 
                FROM " . $this->table_name . " a
                LEFT JOIN users u ON a.created_by = u.id
                WHERE a.created_by = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $user_id);
        $stmt->execute();
        return $stmt;
    }

    // Albums ophalen waar gebruiker toegang tot heeft
    public function readUserAccessible($user_id) {
        $query = "SELECT DISTINCT a.*, u.username as creator_name 
                FROM " . $this->table_name . " a
                LEFT JOIN users u ON a.created_by = u.id
                LEFT JOIN album_permissions ap ON a.id = ap.album_id
                WHERE a.created_by = ? OR ap.user_id = ?";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $user_id);
        $stmt->bindParam(2, $user_id);
        $stmt->execute();
        return $stmt;
    }

    // Specifiek album ophalen
    public function readOne() {
        $query = "SELECT a.*, u.username as creator_name 
                FROM " . $this->table_name . " a
                LEFT JOIN users u ON a.created_by = u.id
                WHERE a.id = ? LIMIT 0,1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if($row) {
            $this->id = $row['id'];
            $this->album_name = $row['album_name'];
            $this->created_by = $row['created_by'];
            $this->created_at = $row['created_at'];
            $this->thumbnail = $row['thumbnail'];
            return true;
        }
        return false;
    }

    // Album bijwerken
    public function update() {
        $query = "UPDATE " . $this->table_name . "
                SET album_name=:album_name, thumbnail=:thumbnail
                WHERE id=:id AND created_by=:created_by";

        $stmt = $this->conn->prepare($query);

        // Sanitize input
        $this->album_name = htmlspecialchars(strip_tags($this->album_name));
        $this->thumbnail = htmlspecialchars(strip_tags($this->thumbnail));
        $this->id = htmlspecialchars(strip_tags($this->id));
        $this->created_by = htmlspecialchars(strip_tags($this->created_by));

        // Bind values
        $stmt->bindParam(":album_name", $this->album_name);
        $stmt->bindParam(":thumbnail", $this->thumbnail);
        $stmt->bindParam(":id", $this->id);
        $stmt->bindParam(":created_by", $this->created_by);

        // Execute query
        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Album verwijderen
    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = ? AND created_by = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        $stmt->bindParam(2, $this->created_by);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }
}
?> 