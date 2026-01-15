<?php
// ============================================
// SYSTEM ADMINISTRATION & SECURITY
// ============================================
session_start();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config/database.php';

// ============================================
// SECURITY: CSRF Token Generation & Validation
// ============================================
function generateCSRFToken() {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function validateCSRFToken($token) {
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}

// ============================================
// SECURITY: Input Sanitization
// ============================================
function sanitizeInput($input) {
    if (is_array($input)) {
        return array_map('sanitizeInput', $input);
    }
    return htmlspecialchars(strip_tags(trim($input)), ENT_QUOTES, 'UTF-8');
}

// ============================================
// SECURITY: Password Hashing & Verification
// ============================================
function hashPassword($password) {
    return password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
}

function verifyPassword($password, $hash) {
    return password_verify($password, $hash);
}

// ============================================
// SECURITY: Rate Limiting (Brute Force Protection)
// ============================================
function checkRateLimit($userId, $pdo) {
    $maxAttempts = 5;
    $lockoutTime = 15 * 60; // 15 minutes
    
    try {
        $stmt = $pdo->prepare("
            SELECT COUNT(*) as attempts 
            FROM login_attempts 
            WHERE user_id = ? AND attempt_time > DATE_SUB(NOW(), INTERVAL 15 MINUTE)
        ");
        $stmt->execute([$userId]);
        $result = $stmt->fetch();
        
        if ($result['attempts'] >= $maxAttempts) {
            return [
                'allowed' => false,
                'message' => 'Too many login attempts. Please try again in 15 minutes.',
                'remaining_time' => $lockoutTime
            ];
        }
        
        return ['allowed' => true, 'attempts_left' => $maxAttempts - $result['attempts']];
    } catch(Exception $e) {
        return ['allowed' => true]; // Allow if table doesn't exist
    }
}

function recordLoginAttempt($userId, $success, $pdo) {
    try {
        $stmt = $pdo->prepare("
            INSERT INTO login_attempts (user_id, ip_address, success, attempt_time) 
            VALUES (?, ?, ?, NOW())
        ");
        $stmt->execute([$userId, $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1', $success ? 1 : 0]);
    } catch(Exception $e) {
        // Table might not exist
    }
}

// ============================================
// SECURITY: Access Control
// ============================================
function requireAuth() {
    if (!isset($_SESSION['user_id']) || empty($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit;
    }
}

function requireAdmin() {
    requireAuth();
    if ($_SESSION['user_type'] !== 'admin') {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Admin access required']);
        exit;
    }
}

// ============================================
// API Endpoints
// ============================================
$action = $_GET['action'] ?? '';

switch ($action) {
    case 'csrf':
        echo json_encode(['success' => true, 'token' => generateCSRFToken()]);
        break;
        
    case 'validate_csrf':
        $data = json_decode(file_get_contents('php://input'), true);
        $valid = validateCSRFToken($data['token'] ?? '');
        echo json_encode(['success' => $valid]);
        break;
        
    case 'activity_log':
        requireAdmin();
        try {
            $stmt = $pdo->query("
                SELECT * FROM activity_logs 
                ORDER BY created_at DESC 
                LIMIT 100
            ");
            echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);
        } catch(Exception $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
        break;
        
    case 'login_attempts':
        requireAdmin();
        try {
            $stmt = $pdo->query("
                SELECT user_id, ip_address, success, attempt_time 
                FROM login_attempts 
                ORDER BY attempt_time DESC 
                LIMIT 50
            ");
            echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);
        } catch(Exception $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
        break;
        
    default:
        echo json_encode(['success' => true, 'message' => 'Security API active']);
}
?>
