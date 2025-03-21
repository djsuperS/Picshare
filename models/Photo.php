<?php
class Photo {
    private $conn;
    private $table_name = "album_photos";

    public $id;
    public $album_id;
    public $photo_url;
    public $uploaded_by;
    public $uploaded_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Nieuwe foto uploaden
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                SET album_id=:album_id, photo_url=:photo_url, uploaded_by=:uploaded_by";

        $stmt = $this->conn->prepare($query);

        // Sanitize input
        $this->album_id = htmlspecialchars(strip_tags($this->album_id));
        $this->photo_url = htmlspecialchars(strip_tags($this->photo_url));
        $this->uploaded_by = htmlspecialchars(strip_tags($this->uploaded_by));

        // Bind values
        $stmt->bindParam(":album_id", $this->album_id);
        $stmt->bindParam(":photo_url", $this->photo_url);
        $stmt->bindParam(":uploaded_by", $this->uploaded_by);

        // Execute query
        if($stmt->execute()) {
            return $this->conn->lastInsertId();
        }
        return false;
    }

    // Alle foto's van een album ophalen
    public function readByAlbum() {
        $query = "SELECT p.*, u.username as uploader_name 
                FROM " . $this->table_name . " p
                LEFT JOIN users u ON p.uploaded_by = u.id
                WHERE p.album_id = ?
                ORDER BY p.uploaded_at DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->album_id);
        $stmt->execute();
        return $stmt;
    }

    // Specifieke foto ophalen
    public function readOne() {
        $query = "SELECT p.*, u.username as uploader_name, a.album_name
                FROM " . $this->table_name . " p
                LEFT JOIN users u ON p.uploaded_by = u.id
                LEFT JOIN albums a ON p.album_id = a.id
                WHERE p.id = ? LIMIT 0,1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if($row) {
            $this->id = $row['id'];
            $this->album_id = $row['album_id'];
            $this->photo_url = $row['photo_url'];
            $this->uploaded_by = $row['uploaded_by'];
            $this->uploaded_at = $row['uploaded_at'];
            return true;
        }
        return false;
    }

    // Foto verwijderen
    public function delete() {
        // Eerst controleren of de gebruiker toestemming heeft om de foto te verwijderen
        $query = "SELECT p.id, a.created_by, ap.can_delete_photos
                FROM " . $this->table_name . " p
                JOIN albums a ON p.album_id = a.id
                LEFT JOIN album_permissions ap ON (a.id = ap.album_id AND ap.user_id = ?)
                WHERE p.id = ?";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->uploaded_by);
        $stmt->bindParam(2, $this->id);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Alleen verwijderen als het de eigenaar van het album is, de uploader van de foto, of een gebruiker met verwijderrechten
        if($row && ($row['created_by'] == $this->uploaded_by || $this->uploaded_by == $this->uploaded_by || $row['can_delete_photos'])) {
            $query = "DELETE FROM " . $this->table_name . " WHERE id = ?";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(1, $this->id);

            if($stmt->execute()) {
                return true;
            }
        }
        return false;
    }

    // Controleren of een gebruiker rechten heeft om foto's toe te voegen aan een album
    public function canAddPhoto($user_id, $album_id) {
        $query = "SELECT a.created_by, ap.can_add_photos
                FROM albums a
                LEFT JOIN album_permissions ap ON (a.id = ap.album_id AND ap.user_id = ?)
                WHERE a.id = ?";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $user_id);
        $stmt->bindParam(2, $album_id);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // De eigenaar van het album of gebruikers met toevoegrechten kunnen foto's toevoegen
        return ($row && ($row['created_by'] == $user_id || $row['can_add_photos']));
    }
}
?> 