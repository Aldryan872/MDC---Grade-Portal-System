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

$facebookId = $data['facebookId'] ?? '';
$name = $data['name'] ?? '';
$picture = $data['picture'] ?? '';

function generate_contact($seed) {
    $prefixes = ['0917','0918','0919','0920','0921','0922','0923','0927','0935','0945'];
    $hash = abs(crc32((string)$seed));
    mt_srand($hash);
    $prefix = $prefixes[mt_rand(0, count($prefixes) - 1)];
    $rest = '';
    for ($i = 0; $i < 7; $i++) { $rest .= (string)mt_rand(0, 9); }
    return $prefix . $rest;
}

if (empty($facebookId)) {
    echo json_encode(['success' => false, 'message' => 'Facebook ID required']);
    exit;
}

try {
    $fbStudentId = 'FB-' . $facebookId;
    // Prepare contact to persist/backfill
    $contact = generate_contact($facebookId);
    
    // Check if Facebook user exists
    $stmt = $pdo->prepare("SELECT * FROM students WHERE student_id = ?");
    $stmt->execute([$fbStudentId]);
    $student = $stmt->fetch();
    
    if (!$student) {
        // Create new student from Facebook
        $stmt = $pdo->prepare("INSERT INTO students (student_id, full_name, course, year_level, section, contact) VALUES (?, ?, 'BS Nursing', '1st Year', 'A', ?)");
        $stmt->execute([$fbStudentId, $name, $contact]);
        
        // Create user record
        $stmt = $pdo->prepare("INSERT INTO users (user_id, facebook_id, user_type) VALUES (?, ?, 'student')");
        $stmt->execute([$fbStudentId, $facebookId]);
    } else {
        // Backfill contact if missing/null for existing FB-linked student
        if (!isset($student['contact']) || $student['contact'] === null || $student['contact'] === '') {
            $stmt = $pdo->prepare("UPDATE students SET contact = ? WHERE student_id = ?");
            $stmt->execute([$contact, $fbStudentId]);
        }
    }
    
    echo json_encode([
        'success' => true,
        'user' => [
            'id' => $fbStudentId,
            'name' => $name,
            'type' => 'student',
            'picture' => $picture,
            'loginMethod' => 'facebook'
        ]
    ]);
    
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
