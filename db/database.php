<?php
class DatabaseHelper {
    private $db;

    public function __construct($servername, $username, $password, $dbname, $port){
        $this->db = new mysqli($servername, $username, $password, $dbname, $port);
        if ($this->db->connect_error) {
            die("Connection failed: " . $this->db->connect_error);
        }        
    }

    /*
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
    }*/

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

    /* register a new user. All fields must be validated before calling this function
    role = 1 registers a new client, role = 0 registers a new vendor */
    public function registerUser($name, $surname, $address, $email, $username, $encrPass, $role = 1) {
        $query = "INSERT INTO users (first_name, last_name, address, email, username, password_hash, role) 
            VALUES (?, ?, ?, ?, ?, ?, ?);";
        $stmt = $this->db->prepare($query);
        $stmt->bind_param('ssssssi', $name, $surname, $address, $email, $username, $encrPass, $role);
        $stmt->execute();
    }

    public function getUserInfo($email) {
        $query = "SELECT id, first_name, last_name, address, username, email, password_hash, role FROM users WHERE email = ?";
        $stmt = $this->db->prepare($query);
        $stmt->bind_param('s', $email);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        return $result;
    }

    public function getCategories() {
        $stmt = $this->db->prepare("SELECT id, name FROM categories");
        $stmt->execute();
        $result = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        return $result;
    }

    public function filterProducts($options) {
        $query = "SELECT DISTINCT p.id, p.title, p.description, p.price, p.discount_price, p.image_name, 
        p.sold_count, p.quantity_available FROM products p";
        // Categories selected. Inner joins to access categories data
        if (isset($options["categories"])) {
            $query .= " JOIN product_categories pc ON p.id = pc.product_id";
        }
        $query .= " WHERE p.price BETWEEN ? AND ?";

        if (isset($options["onlyOffers"])) {
            $query .= " AND p.discount_price IS NOT NULL";
        }

        if (isset($options["categories"])) {
            // adds a "?" inside brackets for each category
            $query .= " AND pc.category_id IN (" . implode(',', array_fill(0, count($options["categories"]), '?')) . ")";
        }

        // search box not empty
        if (isset($options["search"])) {
            $query .= " AND (p.title LIKE ? OR p.description LIKE ?)";
        }

        // result ordering
        switch ($options["orderBy"]) {
            case "decreasingPrice":
                $query .= " ORDER BY p.price DESC";
                break;
            case "increasingPrice":
                $query .= " ORDER BY p.price ASC";
                break;
            case "random":
                $query .= " ORDER BY RAND()";
                break;
            default:
                $query .= " ORDER BY p.sold_count DESC";
        }

        $query .= " LIMIT ?, ?";

        // Puts parameters in the correct order and format
        $pType = "dd";
        $params = array($options["minPrice"], $options["maxPrice"]);

        if (isset($options["categories"])) {
            $pType .= str_repeat("i", count($options["categories"]));
            $params = array_merge($params, $options["categories"]);
        }

        if (isset($options["search"])) {
            $pType .= "ss";
            array_push($params, "%" . $options["search"] . "%");
            array_push($params, "%" . $options["search"] . "%");
        }

        $pType .= "ii";
        array_push($params, $options["from"]);
        array_push($params, $options["howMany"]);

        // query execution
        $stmt = $this->db->prepare($query);
        $stmt->bind_param($pType, ...$params);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

        return $result;
    }

    public function countTotalFilteredProducts($options) {
        $query = "SELECT DISTINCT COUNT(*) as count FROM products p";
        // Categories selected. Inner joins to access categories data
        if (isset($options["categories"])) {
            $query .= " JOIN product_categories pc ON p.id = pc.product_id";
        }
        $query .= " WHERE p.price BETWEEN ? AND ?";

        if (isset($options["onlyOffers"])) {
            $query .= " AND p.discount_price IS NOT NULL";
        }

        if (isset($options["categories"])) {
            // adds a "?" inside brackets for each category
            $query .= " AND pc.category_id IN (" . implode(',', array_fill(0, count($options["categories"]), '?')) . ")";
        }

        // search box not empty
        if (isset($options["search"])) {
            $query .= " AND (p.title LIKE ? OR p.description LIKE ?)";
        }

        // Puts parameters in the correct order and format
        $pType = "dd";
        $params = array($options["minPrice"], $options["maxPrice"]);

        if (isset($options["categories"])) {
            $pType .= str_repeat("i", count($options["categories"]));
            $params = array_merge($params, $options["categories"]);
        }

        if (isset($options["search"])) {
            $pType .= "ss";
            array_push($params, "%" . $options["search"] . "%");
            array_push($params, "%" . $options["search"] . "%");
        }

        // query execution
        $stmt = $this->db->prepare($query);
        $stmt->bind_param($pType, ...$params);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

        return $result;
    }

    public function addProduct(
        $title,
        $description,
        $price,
        $discountPrice,
        $categoriesIds,
        $quantity,
        $imageName
    ) {
        $query = "INSERT INTO products (title, description, quantity_available, price, discount_price, image_name) 
        VALUES (?, ?, ?, ?, ?, ?)";
        $stmt = $this->db->prepare($query);
        $stmt->bind_param("ssidds",
            $title,
            $description,
            $quantity,
            $price,
            $discountPrice,
            $imageName
        );
        $stmt->execute();

        // the id of the product:
        $productID = $this->db->insert_id;
        $this->addCategoriesToProductById($categoriesIds, $productID);
    }

    public function addCategoriesToProductById($categoriesIds, $productID) {
        // associates the product with all the categories
        $query = "INSERT INTO product_categories (product_id, category_id) VALUES";
        for ($i = 0; $i < count($categoriesIds); $i++) {
            $query .= " (" . $productID . ", ?)" . ($i < count($categoriesIds) - 1 ? "," : "");
        }

        $pType = str_repeat("i", count($categoriesIds));
        $stmt = $this->db->prepare($query);
        $stmt->bind_param($pType, ...$categoriesIds);
        $stmt->execute();
    }

    /* adds all the category names in the array $categories to the database
    and returns the ids of the newly created categories */
    public function addCategoriesAndGetIds($categories) {
        $query = "INSERT INTO categories (name) VALUES";

        for ($i = 0; $i < count($categories); $i++) {
            $query .= " (?)" . ($i < count($categories) - 1 ? "," : "");
        }
 
        $pType = str_repeat("s", count($categories));
        $stmt = $this->db->prepare($query);
        $stmt->bind_param($pType, ...$categories);
        $stmt->execute();

        $result = $this->getCategoriesIdsByNames($categories);

        $newIds = array();
        foreach ($result as $category) {
            array_push($newIds, $category["id"]);
        }

        return $newIds;
    }

    public function getCategoriesIdsByNames($categories) {
        // Return the new categories ids
        $query = "SELECT id, name FROM categories WHERE name IN ("
        . implode(",", array_fill(0, count($categories), "?")). ")";

        $pType = str_repeat("s", count($categories));

        $stmt = $this->db->prepare($query);
        $stmt->bind_param($pType, ...$categories);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        return $result;
    }

    public function getProductByID($id) {
        $query = "SELECT p.id, p.title, p.description, p.quantity_available, p.sold_count, p.price, p.discount_price, p.image_name, 
        GROUP_CONCAT(c.id ORDER BY c.id SEPARATOR ', ') AS category_ids
        FROM products p
        LEFT JOIN product_categories pc ON p.id = pc.product_id
        LEFT JOIN categories c ON pc.category_id = c.id
        WHERE p.id = ?
        GROUP BY p.id";

        $stmt = $this->db->prepare($query);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        return $result;
    }

    public function updateProductById(
        $id,
        $title,
        $description,
        $price,
        $discountPrice,
        $categoriesIds,
        $quantity,
        $imageName = null) {
        
        $query = "UPDATE products SET title = ?, description = ?, quantity_available = ?, price = ?, discount_price = ?";

        $pType = "ssidd";
        if ($imageName != null) {
            $pType .= "s";
            $query .= ", image_name = ?";
        }
        $query .= " WHERE id = ?";
        $pType .= "i";

        $stmt = $this->db->prepare($query);
        if ($imageName != null) {
            $stmt->bind_param($pType, $title, $description, $quantity, $price, $discountPrice, $imageName, $id);
        } else {
            $stmt->bind_param($pType, $title, $description, $quantity, $price, $discountPrice, $id);
        }
        $stmt->execute();

        /* Updates the categories associated with this product. */
        $this->deleteProductCategoriesById($id);
        $this->addCategoriesToProductById($categoriesIds, $id);
    }

    public function deleteProductCategoriesById($productID) {
        $query = "DELETE FROM product_categories WHERE product_id = ?";
        $stmt = $this->db->prepare($query);
        $stmt->bind_param("i", $productID);
        $stmt->execute();
    }

    // deletes all categories that are not associated with any product
    public function deleteUnusedCategories() {
        $query = "DELETE FROM categories WHERE id NOT IN (SELECT DISTINCT category_id FROM product_categories)";
        $stmt = $this->db->prepare($query);
        $stmt->execute();
    }

    public function deleteProductById($id) {
        $query = "DELETE FROM products WHERE id = ?";
        $stmt = $this->db->prepare($query);
        $stmt->bind_param("i", $id);
        $stmt->execute();
    }
}
?>