<?php
class AlbumPermission {
    private $conn;
    private $table_name = "album_permissions";

    public $id;
    public $album_id;
    public $user_id;
    public $can_add_photos;
    public $can_delete_photos;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Nieuwe permissie aanmaken of bijwerken
    public function createOrUpdate() {
        // Controleren of permissie al bestaat
        $check_query = "SELECT id FROM " . $this->table_name . " WHERE album_id = ? AND user_id = ?";
        $check_stmt = $this->conn->prepare($check_query);
        $check_stmt->bindParam(1, $this->album_id);
        $check_stmt->bindParam(2, $this->user_id);
        $check_stmt->execute();
        
        if($check_stmt->rowCount() > 0) {
            // Update bestaande permissie
            $row = $check_stmt->fetch(PDO::FETCH_ASSOC);
            $this->id = $row['id'];
            return $this->update();
        } else {
            // Maak nieuwe permissie
            return $this->create();
        }
    }

    // Nieuwe permissie aanmaken
    private function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                SET album_id=:album_id, user_id=:user_id, 
                    can_add_photos=:can_add_photos, can_delete_photos=:can_delete_photos";

        $stmt = $this->conn->prepare($query);

        // Sanitize input
        $this->album_id = htmlspecialchars(strip_tags($this->album_id));
        $this->user_id = htmlspecialchars(strip_tags($this->user_id));
        $this->can_add_photos = intval($this->can_add_photos);
        $this->can_delete_photos = intval($this->can_delete_photos);

        // Bind values
        $stmt->bindParam(":album_id", $this->album_id);
        $stmt->bindParam(":user_id", $this->user_id);
        $stmt->bindParam(":can_add_photos", $this->can_add_photos);
        $stmt->bindParam(":can_delete_photos", $this->can_delete_photos);

        // Execute query
        if($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }
        return false;
    }

    // Permissie bijwerken
    private function update() {
        $query = "UPDATE " . $this->table_name . "
                SET can_add_photos=:can_add_photos, can_delete_photos=:can_delete_photos
                WHERE id=:id";

        $stmt = $this->conn->prepare($query);

        // Sanitize input
        $this->can_add_photos = intval($this->can_add_photos);
        $this->can_delete_photos = intval($this->can_delete_photos);
        $this->id = htmlspecialchars(strip_tags($this->id));

        // Bind values
        $stmt->bindParam(":can_add_photos", $this->can_add_photos);
        $stmt->bindParam(":can_delete_photos", $this->can_delete_photos);
        $stmt->bindParam(":id", $this->id);

        // Execute query
        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Permissie verwijderen
    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Permissie verwijderen voor gebruiker en album
    public function deleteByUserAlbum() {
        $query = "DELETE FROM " . $this->table_name . " WHERE album_id = ? AND user_id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->album_id);
        $stmt->bindParam(2, $this->user_id);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Permissie ophalen
    public function read() {
        $query = "SELECT * FROM " . $this->table_name . " WHERE album_id = ? AND user_id = ? LIMIT 0,1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->album_id);
        $stmt->bindParam(2, $this->user_id);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if($row) {
            $this->id = $row['id'];
            $this->can_add_photos = $row['can_add_photos'];
            $this->can_delete_photos = $row['can_delete_photos'];
            return true;
        }
        return false;
    }

    // Permissies ophalen voor een album
    public function readByAlbum() {
        $query = "SELECT ap.*, u.username, u.profile_picture
                FROM " . $this->table_name . " ap
                JOIN users u ON ap.user_id = u.id
                WHERE ap.album_id = ?";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->album_id);
        $stmt->execute();
        return $stmt;
    }

    // Controleren of een gebruiker rechten heeft om foto's toe te voegen aan een album
    public function canAddPhotos() {
        if($this->read()) {
            return (bool)$this->can_add_photos;
        }
        return false;
    }

    // Controleren of een gebruiker rechten heeft om foto's te verwijderen uit een album
    public function canDeletePhotos() {
        if($this->read()) {
            return (bool)$this->can_delete_photos;
        }
        return false;
    }
}
?> 