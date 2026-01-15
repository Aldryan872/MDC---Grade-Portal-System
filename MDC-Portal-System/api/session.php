<?php
// ============================================
// SESSION MANAGEMENT - Session & Cookies Implementation
// ============================================
session_start();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'POST':
        // Create session (login)
        $data = json_decode(file_get_contents('php://input'), true);
        
        $_SESSION['user_id'] = $data['userId'] ?? '';
        $_SESSION['user_type'] = $data['userType'] ?? 'student';
        $_SESSION['user_name'] = $data['userName'] ?? '';
        $_SESSION['login_time'] = date('Y-m-d H:i:s');
        $_SESSION['last_activity'] = time();
        
        // Set cookie for "Remember Me" (30 days)
        if (isset($data['rememberMe']) && $data['rememberMe']) {
            $token = bin2hex(random_bytes(32));
            setcookie('mdc_remember_token', $token, time() + (30 * 24 * 60 * 60), '/', '', false, true);
            setcookie('mdc_user_id', $data['userId'], time() + (30 * 24 * 60 * 60), '/', '', false, true);
            
            // Store token in database
            try {
                $stmt = $pdo->prepare("UPDATE users SET remember_token = ? WHERE user_id = ?");
                $stmt->execute([$token, $data['userId']]);
            } catch(Exception $e) {
                // Token column might not exist yet
            }
        }
        
        // Log login activity
        try {
            $stmt = $pdo->prepare("INSERT INTO activity_logs (user_id, action, ip_address, created_at) VALUES (?, 'LOGIN', ?, NOW())");
            $stmt->execute([$data['userId'], $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1']);
        } catch(Exception $e) {
            // Activity log table might not exist
        }
        
        echo json_encode([
            'success' => true,
            'session_id' => session_id(),
            'message' => 'Session created'
        ]);
        break;
        
    case 'GET':
        // Check session
        if (isset($_SESSION['user_id']) && !empty($_SESSION['user_id'])) {
            // Check session timeout (30 minutes)
            if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity'] > 1800)) {
                session_unset();
                session_destroy();
                echo json_encode(['success' => false, 'message' => 'Session expired']);
                exit;
            }
            
            $_SESSION['last_activity'] = time();
            
            echo json_encode([
                'success' => true,
                'user' => [
                    'id' => $_SESSION['user_id'],
                    'type' => $_SESSION['user_type'],
                    'name' => $_SESSION['user_name'],
                    'login_time' => $_SESSION['login_time']
                ]
            ]);
        } else {
            // Check remember me cookie
            if (isset($_COOKIE['mdc_remember_token']) && isset($_COOKIE['mdc_user_id'])) {
                try {
                    $stmt = $pdo->prepare("SELECT * FROM users WHERE user_id = ? AND remember_token = ?");
                    $stmt->execute([$_COOKIE['mdc_user_id'], $_COOKIE['mdc_remember_token']]);
                    $user = $stmt->fetch();
                    
                    if ($user) {
                        $_SESSION['user_id'] = $user['user_id'];
                        $_SESSION['user_type'] = $user['user_type'];
                        $_SESSION['login_time'] = date('Y-m-d H:i:s');
                        
                        echo json_encode(['success' => true, 'user' => $user, 'restored' => true]);
                        exit;
                    }
                } catch(Exception $e) {}
            }
            
            echo json_encode(['success' => false, 'message' => 'No active session']);
        }
        break;
        
    case 'DELETE':
        // Destroy session (logout)
        $userId = $_SESSION['user_id'] ?? '';
        
        // Log logout activity
        if ($userId) {
            try {
                $stmt = $pdo->prepare("INSERT INTO activity_logs (user_id, action, ip_address, created_at) VALUES (?, 'LOGOUT', ?, NOW())");
                $stmt->execute([$userId, $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1']);
            } catch(Exception $e) {}
        }
        
        // Clear cookies
        setcookie('mdc_remember_token', '', time() - 3600, '/');
        setcookie('mdc_user_id', '', time() - 3600, '/');
        
        session_unset();
        session_destroy();
        
        echo json_encode(['success' => true, 'message' => 'Session destroyed']);
        break;
}
?>
