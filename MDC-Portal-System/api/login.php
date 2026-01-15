<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$userId = $data['userId'] ?? '';
$password = $data['password'] ?? '';
$userType = $data['userType'] ?? 'student';

if (empty($userId) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'Please fill all fields']);
    exit;
}

try {
    if ($userType === 'admin') {
        // Admin login
        $stmt = $pdo->prepare("SELECT * FROM users WHERE user_id = ? AND user_type = 'admin'");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();
        
        if ($user) {
            // Verify password (supports both hashed and plain text for backward compatibility)
            if (password_verify($password, $user['password']) || $password === $user['password']) {
                echo json_encode([
                    'success' => true,
                    'user' => [
                        'id' => $userId,
                        'name' => 'Administrator',
                        'type' => 'admin'
                    ]
                ]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Invalid password']);
            }
        } else {
            echo json_encode(['success' => false, 'message' => 'Admin account not found']);
        }
    } else {
        // Student login - must be registered first
        $stmt = $pdo->prepare("SELECT u.*, s.full_name, s.course, s.year_level, s.section, s.contact, s.email 
                              FROM users u 
                              JOIN students s ON u.user_id = s.student_id 
                              WHERE u.user_id = ? AND u.user_type = 'student'");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();
        
        if ($user) {
            // Verify password (supports both hashed and plain text)
            if (password_verify($password, $user['password']) || $password === $user['password']) {
                // Backfill contact/email if missing
                $needsUpdate = false;
                $contact = $user['contact'];
                $email = $user['email'];
                if ($contact === null || $contact === '') {
                    $prefixes = ['0917','0918','0919','0920','0921','0922','0923','0927','0935','0945'];
                    $hash = abs(crc32((string)$user['user_id']));
                    mt_srand($hash);
                    $prefix = $prefixes[mt_rand(0, count($prefixes) - 1)];
                    $rest = '';
                    for ($i = 0; $i < 7; $i++) { $rest .= (string)mt_rand(0, 9); }
                    $contact = $prefix . $rest;
                    $needsUpdate = true;
                }
                if ($email === null || $email === '') {
                    $email = $user['user_id'] . '@mdc.edu.ph';
                    $needsUpdate = true;
                }
                if ($needsUpdate) {
                    $upd = $pdo->prepare("UPDATE students SET contact = ?, email = ? WHERE student_id = ?");
                    $upd->execute([$contact, $email, $user['user_id']]);
                }
                echo json_encode([
                    'success' => true,
                    'user' => [
                        'id' => $user['user_id'],
                        'name' => $user['full_name'],
                        'type' => 'student',
                        'course' => $user['course'],
                        'year' => $user['year_level'],
                        'section' => $user['section']
                    ]
                ]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Invalid password']);
            }
        } else {
            echo json_encode(['success' => false, 'message' => 'Student not found. Please register first.']);
        }
    }
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
