<?php
class DatabaseHelper {
    private $db;

    public function __construct($servername, $username, $password, $dbname, $port){
        $this->db = new mysqli($servername, $username, $password, $dbname, $port);
        if ($this->db->connect_error) {
            die("Connection failed: " . $this->db->connect_error);
        }        
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

    public function filterProducts($options, $hideOutOfStock) {
        $query = "SELECT DISTINCT p.id, p.title, p.description, p.price, p.discount_price, p.image_name, 
        p.sold_count, p.quantity_available FROM products p";
        // Categories selected. Inner joins to access categories data
        if (isset($options["categories"])) {
            $query .= " JOIN product_categories pc ON p.id = pc.product_id";
        }
        $query .= " WHERE p.price BETWEEN ? AND ?";

        if ($hideOutOfStock) {
            $query .= " AND p.quantity_available > 0";
        }

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

    public function addProductToCart($userID, $productID, $quantity) {
        $query = "INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)";
        $stmt = $this->db->prepare($query);
        $stmt->bind_param("iii", $userID, $productID, $quantity);
        $stmt->execute();
    }

    public function changeProductQuantity($productID, $quantity, $subtraction = true) {
        $query = "UPDATE products SET quantity_available = quantity_available "
        . ($subtraction ? "-" : "+") ." ? WHERE id = ?" . ($subtraction ? " AND quantity_available >= ?" : "");
        $stmt = $this->db->prepare($query);
        if ($subtraction) {
            $stmt->bind_param("iii", $quantity, $productID, $quantity);
        } else {
            $stmt->bind_param("ii", $quantity, $productID);
        }
        $stmt->execute();
    }

    public function getUserCart($userID) {
        $query = "SELECT id, user_id, product_id, quantity FROM cart WHERE user_id = ?";
        $stmt = $this->db->prepare($query);
        $stmt->bind_param("i", $userID);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        return $result;
    }

    public function removeProductFromCart($userID, $productID) {
        $query = "DELETE FROM cart WHERE user_id = ? AND product_id = ?";
        $stmt = $this->db->prepare($query);
        $stmt->bind_param("ii", $userID, $productID);
        $stmt->execute();
    }

    public function addQuantityToProductInCart($userID, $productID, $quantity) {
        $query = "UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?";
        $stmt = $this->db->prepare($query);
        $stmt->bind_param("iii", $quantity, $userID, $productID);
        $stmt->execute();
    }

    public function placeOrder($userID, $purchaseDate, $totalPrice) {
        $query = "INSERT INTO orders (user_id, purchase_date, total_price) VALUES (?, ?, ?)";
        $stmt = $this->db->prepare($query);
        $stmt->bind_param("isd", $userID, $purchaseDate, $totalPrice);
        $stmt->execute();
        return $this->db->insert_id;
    }

    public function copyFromCartToOrder($userID, $orderID) {
        $query = "INSERT INTO order_items (order_id, product_id, quantity, price_per_unit) VALUES ";
        $cart = $this->getUserCart($userID);
        $params = array();
        $pType = "";

        for ($i = 0; $i < count($cart); $i++) {
            $pType .= "iiid";
            $query .= "(?, ?, ?, ?)" . ($i < count($cart) - 1 ? ", " : "");
            $product = $cart[$i];
            $productData = ($this->getProductByID($product["product_id"]))[0];
            $pricePerUnit = $productData["discount_price"] ? $productData["discount_price"] : $productData["price"];
            array_push($params, $orderID, $product["product_id"], $product["quantity"], $pricePerUnit);
        }

        $stmt = $this->db->prepare($query);
        $stmt->bind_param($pType, ...$params);
        $stmt->execute();
    }

    public function emptyCart($userID) {
        $query = "DELETE FROM cart WHERE user_id = ?";
        $stmt = $this->db->prepare($query);
        $stmt->bind_param("i", $userID);
        $stmt->execute();
    }

    public function getOrders($userID = null) {
        $query = "SELECT o.id, o.user_id, o.purchase_date, o.delivery_date, o.total_price, o.status,
        u.first_name, u.last_name, u.username, u.address 
        FROM orders o INNER JOIN users u ON o.user_id = u.id";
        if ($userID) {
            $query .= " WHERE u.id = ?";
        }
        $query .= " ORDER BY o.purchase_date DESC";

        $stmt = $this->db->prepare($query);
        if ($userID) {
            $stmt->bind_param("i", $userID);
        }
        $stmt->execute();
        $result = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        return $result;
    }

    public function getOrderItemAndProductData($orderID) {
        $query = "SELECT oi.quantity, oi.price_per_unit, 
        p.title, p.description, p.image_name, p.id FROM order_items oi JOIN products p 
        ON oi.product_id = p.id WHERE oi.order_id = ?";

        $stmt = $this->db->prepare($query);
        $stmt->bind_param("i", $orderID);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        return $result;
    }

    public function updateOrder($orderID, $status, $deliveryDate = null) {
        $query = "UPDATE orders SET status = ?, delivery_date = ? WHERE id = ?";
        $stmt = $this->db->prepare($query);
        $stmt->bind_param("ssi", $status, $deliveryDate, $orderID);
        $stmt->execute();
    }

    public function getUserNotifications($userID) {
        $query = "SELECT id, user_id, title, message, is_read, created_at FROM notifications 
        WHERE user_id = ? ORDER BY is_read ASC, created_at DESC";
        $stmt = $this->db->prepare($query);
        $stmt->bind_param("i", $userID);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        return $result;
    }

    public function markNotificationAsRead($userID, $notificationID) {
        $query = "UPDATE notifications SET is_read = 1 WHERE user_id = ? AND id = ?";
        $stmt = $this->db->prepare($query);
        $stmt->bind_param("ii", $userID, $notificationID);
        $stmt->execute();
    }

    public function deleteNotification($userID, $notificationID) {
        $query = "DELETE FROM notifications WHERE user_id = ? AND id = ?";
        $stmt = $this->db->prepare($query);
        $stmt->bind_param("ii", $userID, $notificationID);
        $stmt->execute();
    }

    public function readAllNotifications($userID) {
        $query = "UPDATE notifications SET is_read = 1 WHERE user_id = ?";
        $stmt = $this->db->prepare($query);
        $stmt->bind_param("i", $userID);
        $stmt->execute();
    }

    public function deleteAllNotifications($userID) {
        $query = "DELETE FROM notifications WHERE user_id = ?";
        $stmt = $this->db->prepare($query);
        $stmt->bind_param("i", $userID);
        $stmt->execute();
    }

    // if user is not specified then the notification is sent to all users execept for the vendor
    public function sendNotification($title, $message, $userID = null) {
        $query = "INSERT INTO notifications (user_id, title, message) VALUES ";
        $pType = "";
        $params = array();

        if ($userID) {
            $query .= "(?, ?, ?)";
            $pType = "iss";
            array_push($params, $userID, $title, $message);
        } else {
            // get all the user ids, except the vendor's id
            $stmt = $this->db->prepare("SELECT id FROM users WHERE role = 1");
            $stmt->execute();
            $ids = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

            for ($i = 0; $i < count($ids); $i++) {
                $query .= "(?, ?, ?)" . ($i < count($ids) - 1 ? ", " : "");
                $pType .= "iss";
                array_push($params, $ids[$i]["id"], $title, $message);
            }
        }

        $stmt = $this->db->prepare($query);
        $stmt->bind_param($pType, ...$params);
        $stmt->execute();
    }

    public function getUserByOrder($orderID) {
        $query = "SELECT user_id FROM orders WHERE id = ?";
        $stmt = $this->db->prepare($query);
        $stmt->bind_param("i", $orderID);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        return $result[0]["user_id"];
    }

    public function getVendorId() {
        $stmt = $this->db->prepare("SELECT id FROM users WHERE role = 0");
        $stmt->execute();
        $result = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        return $result[0]["id"];
    }

    public function getCustomers() {
        $stmt = $this->db->prepare("SELECT id, first_name, last_name, username FROM users WHERE role = 1");
        $stmt->execute();
        $result = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        return $result;
    }

    public function getUserById($id) {
        $stmt = $this->db->prepare("SELECT first_name, last_name, username, email, address FROM users WHERE id = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        return $result[0];
    }

    public function countNotifications($userID) {
        $query = "SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND is_read = 0";
        $stmt = $this->db->prepare($query);
        $stmt->bind_param("i", $userID);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        return $result[0];
    }
}
?>