<?php
class Friend {
    private $conn;
    private $friends_table = "friends";
    private $requests_table = "friend_requests";

    public $id;
    public $sender_id;
    public $receiver_id;
    public $status;
    public $created_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Vriendschapsverzoek sturen
    public function sendRequest() {
        // Controleren of er al een verzoek is
        $check_query = "SELECT id, status FROM " . $this->requests_table . " 
                    WHERE (sender_id = ? AND receiver_id = ?) 
                    OR (sender_id = ? AND receiver_id = ?)";
        
        $check_stmt = $this->conn->prepare($check_query);
        $check_stmt->bindParam(1, $this->sender_id);
        $check_stmt->bindParam(2, $this->receiver_id);
        $check_stmt->bindParam(3, $this->receiver_id);
        $check_stmt->bindParam(4, $this->sender_id);
        $check_stmt->execute();
        
        if($check_stmt->rowCount() > 0) {
            // Er bestaat al een verzoek
            return false;
        }
        
        // Controleren of ze al vrienden zijn
        $friends_check_query = "SELECT * FROM " . $this->friends_table . " 
                            WHERE (user1_id = ? AND user2_id = ?) 
                            OR (user1_id = ? AND user2_id = ?)";
        
        $friends_check_stmt = $this->conn->prepare($friends_check_query);
        $friends_check_stmt->bindParam(1, $this->sender_id);
        $friends_check_stmt->bindParam(2, $this->receiver_id);
        $friends_check_stmt->bindParam(3, $this->receiver_id);
        $friends_check_stmt->bindParam(4, $this->sender_id);
        $friends_check_stmt->execute();
        
        if($friends_check_stmt->rowCount() > 0) {
            // Ze zijn al vrienden
            return false;
        }
        
        // Nieuw vriendschapsverzoek maken
        $query = "INSERT INTO " . $this->requests_table . " 
                SET sender_id=:sender_id, receiver_id=:receiver_id, status='pending'";

        $stmt = $this->conn->prepare($query);

        // Sanitize input
        $this->sender_id = htmlspecialchars(strip_tags($this->sender_id));
        $this->receiver_id = htmlspecialchars(strip_tags($this->receiver_id));

        // Bind values
        $stmt->bindParam(":sender_id", $this->sender_id);
        $stmt->bindParam(":receiver_id", $this->receiver_id);

        // Execute query
        if($stmt->execute()) {
            return $this->conn->lastInsertId();
        }
        return false;
    }

    // Vriendschapsverzoek accepteren
    public function acceptRequest() {
        // Eerst verzoek ophalen en controleren
        $check_query = "SELECT * FROM " . $this->requests_table . " WHERE id = ? AND receiver_id = ? AND status = 'pending'";
        $check_stmt = $this->conn->prepare($check_query);
        $check_stmt->bindParam(1, $this->id);
        $check_stmt->bindParam(2, $this->receiver_id);
        $check_stmt->execute();
        
        if($check_stmt->rowCount() == 0) {
            // Verzoek niet gevonden of al afgehandeld
            return false;
        }
        
        $request = $check_stmt->fetch(PDO::FETCH_ASSOC);
        
        // Beginnen met een transactie
        $this->conn->beginTransaction();
        
        try {
            // Verzoek accepteren
            $update_query = "UPDATE " . $this->requests_table . " SET status = 'accepted' WHERE id = ?";
            $update_stmt = $this->conn->prepare($update_query);
            $update_stmt->bindParam(1, $this->id);
            $update_stmt->execute();
            
            // Vriendschap toevoegen in beide richtingen
            $add_friend1 = "INSERT INTO " . $this->friends_table . " (user1_id, user2_id) VALUES (?, ?)";
            $add_friend2 = "INSERT INTO " . $this->friends_table . " (user1_id, user2_id) VALUES (?, ?)";
            
            $stmt1 = $this->conn->prepare($add_friend1);
            $stmt2 = $this->conn->prepare($add_friend2);
            
            $stmt1->bindParam(1, $request['sender_id']);
            $stmt1->bindParam(2, $request['receiver_id']);
            
            $stmt2->bindParam(1, $request['receiver_id']);
            $stmt2->bindParam(2, $request['sender_id']);
            
            $stmt1->execute();
            $stmt2->execute();
            
            $this->conn->commit();
            return true;
        } catch (Exception $e) {
            $this->conn->rollBack();
            return false;
        }
    }

    // Vriendschapsverzoek weigeren
    public function declineRequest() {
        $query = "UPDATE " . $this->requests_table . " SET status = 'declined' WHERE id = ? AND receiver_id = ? AND status = 'pending'";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        $stmt->bindParam(2, $this->receiver_id);
        
        if($stmt->execute() && $stmt->rowCount() > 0) {
            return true;
        }
        return false;
    }

    // Vriendschap verwijderen
    public function removeFriend($user1_id, $user2_id) {
        $this->conn->beginTransaction();
        
        try {
            $query1 = "DELETE FROM " . $this->friends_table . " WHERE user1_id = ? AND user2_id = ?";
            $query2 = "DELETE FROM " . $this->friends_table . " WHERE user1_id = ? AND user2_id = ?";
            
            $stmt1 = $this->conn->prepare($query1);
            $stmt2 = $this->conn->prepare($query2);
            
            $stmt1->bindParam(1, $user1_id);
            $stmt1->bindParam(2, $user2_id);
            
            $stmt2->bindParam(1, $user2_id);
            $stmt2->bindParam(2, $user1_id);
            
            $stmt1->execute();
            $stmt2->execute();
            
            $this->conn->commit();
            return true;
        } catch (Exception $e) {
            $this->conn->rollBack();
            return false;
        }
    }

    // Alle vrienden van een gebruiker ophalen
    public function getFriends($user_id) {
        $query = "SELECT u.* FROM users u
                JOIN " . $this->friends_table . " f ON u.id = f.user2_id
                WHERE f.user1_id = ?";
                
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $user_id);
        $stmt->execute();
        return $stmt;
    }

    // Alle vriendschapsverzoeken ophalen voor een gebruiker
    public function getPendingRequests($user_id) {
        $query = "SELECT fr.*, u.username as sender_name, u.profile_picture as sender_picture 
                FROM " . $this->requests_table . " fr
                JOIN users u ON fr.sender_id = u.id
                WHERE fr.receiver_id = ? AND fr.status = 'pending'";
                
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $user_id);
        $stmt->execute();
        return $stmt;
    }

    // Controleren of twee gebruikers vrienden zijn
    public function areFriends($user1_id, $user2_id) {
        $query = "SELECT * FROM " . $this->friends_table . " 
                WHERE (user1_id = ? AND user2_id = ?)";
                
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $user1_id);
        $stmt->bindParam(2, $user2_id);
        $stmt->execute();
        
        return ($stmt->rowCount() > 0);
    }
}
?> 