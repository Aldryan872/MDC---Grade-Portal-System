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

$studentId = $data['studentId'] ?? '';
$fullName = $data['fullName'] ?? '';
$course = $data['course'] ?? '';
$year = $data['year'] ?? '';
$section = $data['section'] ?? '';
$password = $data['password'] ?? '';

// Helpers to auto-generate contact and email
function generate_contact($seed) {
    $prefixes = ['0917','0918','0919','0920','0921','0922','0923','0927','0935','0945'];
    $hash = abs(crc32((string)$seed));
    mt_srand($hash);
    $prefix = $prefixes[mt_rand(0, count($prefixes) - 1)];
    $rest = '';
    for ($i = 0; $i < 7; $i++) { $rest .= (string)mt_rand(0, 9); }
    return $prefix . $rest;
}
function generate_email($studentId) { return $studentId . '@mdc.edu.ph'; }

if (empty($studentId) || empty($fullName) || empty($course) || empty($year) || empty($section) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'Please fill all fields']);
    exit;
}

try {
    // Check if student ID exists
    $stmt = $pdo->prepare("SELECT student_id FROM students WHERE student_id = ?");
    $stmt->execute([$studentId]);
    if ($stmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Student ID already exists']);
        exit;
    }
    
    // Insert student with auto contact and email
    $contact = generate_contact($studentId);
    $email = generate_email($studentId);
    $stmt = $pdo->prepare("INSERT INTO students (student_id, full_name, course, year_level, section, contact, email) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$studentId, $fullName, $course, $year, $section, $contact, $email]);
    
    // Insert user credentials
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("INSERT INTO users (user_id, password, user_type) VALUES (?, ?, 'student')");
    $stmt->execute([$studentId, $hashedPassword]);
    
    echo json_encode(['success' => true, 'message' => 'Registration successful']);
    
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
