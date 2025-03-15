<?php
class DatabaseHelper {
    private $db;

    public function __construct($servername, $username, $password, $dbname, $port){
        $this->db = new mysqli($servername, $username, $password, $dbname, $port);
        if ($this->db->connect_error) {
            die("Connection failed: " . $this->db->connect_error);
        }        
    }

    public function getRandomDiscountedProducts($n=-1)
    {
        $query = "SELECT id, title, description, price, discount_price, image_name
                FROM products
                WHERE discount_price IS NOT NULL
                ORDER BY RAND()";
        // gets all of them by default
        if ($n > 0) {
            $query .= " LIMIT ?";
        }
        $stmt = $this->db->prepare($query);
        if ($n > 0) {
            $stmt->bind_param('i', $n);
        }
        $stmt->execute();
        $result = $stmt->get_result();

        return $result->fetch_all(MYSQLI_ASSOC);
    }

    public function getMostPurchasedProducts($n=-1)
    {
        $query = "SELECT id, title, description, price, discount_price, image_name, sold_count
                FROM products
                ORDER BY sold_count DESC";
        // gets all of them by default
        if ($n > 0) {
            $query .= " LIMIT ?";
        }
        $stmt = $this->db->prepare($query);
        if ($n > 0) {
            $stmt->bind_param('i', $n);
        }
        $stmt->execute();
        $result = $stmt->get_result();

        return $result->fetch_all(MYSQLI_ASSOC);
    }

    // returns true if the username is unique
    public function checkUsernameAvailability($username)
    {
        $stmt = $this->db->prepare("SELECT COUNT(*) AS count FROM users WHERE username = ?");
        $stmt->bind_param('s', $username);
        $stmt->execute();
        
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        return $row["count"] == 0;
    }

    // returns true if the username is unique
    public function checkEmailAvailability($email)
    {
        $stmt = $this->db->prepare("SELECT COUNT(*) AS count FROM users WHERE email = ?");
        $stmt->bind_param('s', $email);
        $stmt->execute();

        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        return $row["count"] == 0;
    }
}
?>