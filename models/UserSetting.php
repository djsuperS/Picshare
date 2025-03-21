<?php
class UserSetting {
    private $conn;
    private $table_name = "user_settings";

    public $user_id;
    public $receive_notifications;
    public $receive_friend_requests;
    public $receive_email_notifications;
    public $profile_visibility;
    public $theme;
    public $created_at;
    public $updated_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Instellingen ophalen voor gebruiker
    public function read() {
        $query = "SELECT * FROM " . $this->table_name . " WHERE user_id = ? LIMIT 0,1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->user_id);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if($row) {
            $this->receive_notifications = $row['receive_notifications'];
            $this->receive_friend_requests = $row['receive_friend_requests'];
            $this->receive_email_notifications = $row['receive_email_notifications'];
            $this->profile_visibility = $row['profile_visibility'];
            $this->theme = $row['theme'];
            $this->created_at = $row['created_at'];
            $this->updated_at = $row['updated_at'];
            return true;
        }
        
        // Als er geen instellingen gevonden zijn, maak standaard instellingen
        return $this->createDefault();
    }

    // Standaard instellingen aanmaken voor een nieuwe gebruiker
    public function createDefault() {
        $query = "INSERT INTO " . $this->table_name . " 
                (user_id, receive_notifications, receive_friend_requests, 
                receive_email_notifications, profile_visibility, theme) 
                VALUES (?, 1, 1, 1, 'public', 'light')";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->user_id);

        if($stmt->execute()) {
            $this->receive_notifications = 1;
            $this->receive_friend_requests = 1;
            $this->receive_email_notifications = 1;
            $this->profile_visibility = 'public';
            $this->theme = 'light';
            return true;
        }
        return false;
    }

    // Instellingen bijwerken
    public function update() {
        // Controleren of instellingen bestaan
        $check_query = "SELECT user_id FROM " . $this->table_name . " WHERE user_id = ?";
        $check_stmt = $this->conn->prepare($check_query);
        $check_stmt->bindParam(1, $this->user_id);
        $check_stmt->execute();
        
        if($check_stmt->rowCount() == 0) {
            // Geen instellingen gevonden, maak nieuwe aan
            return $this->createDefault();
        }
        
        // Instellingen bijwerken
        $query = "UPDATE " . $this->table_name . " 
                SET receive_notifications = :receive_notifications, 
                    receive_friend_requests = :receive_friend_requests,
                    receive_email_notifications = :receive_email_notifications,
                    profile_visibility = :profile_visibility,
                    theme = :theme
                WHERE user_id = :user_id";

        $stmt = $this->conn->prepare($query);

        // Sanitize input
        $this->receive_notifications = intval($this->receive_notifications);
        $this->receive_friend_requests = intval($this->receive_friend_requests);
        $this->receive_email_notifications = intval($this->receive_email_notifications);
        $this->profile_visibility = htmlspecialchars(strip_tags($this->profile_visibility));
        $this->theme = htmlspecialchars(strip_tags($this->theme));
        $this->user_id = htmlspecialchars(strip_tags($this->user_id));

        // Bind values
        $stmt->bindParam(":receive_notifications", $this->receive_notifications);
        $stmt->bindParam(":receive_friend_requests", $this->receive_friend_requests);
        $stmt->bindParam(":receive_email_notifications", $this->receive_email_notifications);
        $stmt->bindParam(":profile_visibility", $this->profile_visibility);
        $stmt->bindParam(":theme", $this->theme);
        $stmt->bindParam(":user_id", $this->user_id);

        // Execute query
        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Controleren of een gebruiker berichten wil ontvangen
    public function wantsNotifications() {
        $this->read();
        return (bool)$this->receive_notifications;
    }

    // Controleren of een gebruiker vriendschapsverzoeken wil ontvangen
    public function wantsFriendRequests() {
        $this->read();
        return (bool)$this->receive_friend_requests;
    }

    // Controleren of een gebruiker e-mailnotificaties wil ontvangen
    public function wantsEmailNotifications() {
        $this->read();
        return (bool)$this->receive_email_notifications;
    }

    // Profielzichtbaarheid controleren
    public function getProfileVisibility() {
        $this->read();
        return $this->profile_visibility;
    }

    // Thema ophalen
    public function getTheme() {
        $this->read();
        return $this->theme;
    }
}
?> 