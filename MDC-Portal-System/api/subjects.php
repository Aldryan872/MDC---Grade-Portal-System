<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            if (isset($_GET['code'])) {
                $stmt = $pdo->prepare("
                    SELECT s.*, f.full_name as instructor_name 
                    FROM subjects s 
                    LEFT JOIN faculty f ON s.faculty_id = f.faculty_id 
                    WHERE s.subject_code = ?
                ");
                $stmt->execute([$_GET['code']]);
                $subject = $stmt->fetch(PDO::FETCH_ASSOC);
                if ($subject) {
                    echo json_encode(['success' => true, 'data' => $subject]);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Subject not found']);
                }
            } else {
                $stmt = $pdo->query("
                    SELECT s.*, f.full_name as instructor_name 
                    FROM subjects s 
                    LEFT JOIN faculty f ON s.faculty_id = f.faculty_id 
                    ORDER BY s.subject_code
                ");
                $subjects = $stmt->fetchAll();
                echo json_encode(['success' => true, 'data' => $subjects]);
            }
            break;
            
        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            $stmt = $pdo->prepare("INSERT INTO subjects (subject_code, subject_name, units, faculty_id) VALUES (?, ?, ?, ?)");
            $stmt->execute([
                $data['subjectCode'],
                $data['subjectName'],
                $data['units'],
                $data['facultyId'] ?? null
            ]);
            echo json_encode(['success' => true, 'message' => 'Subject added']);
            break;
            
        case 'PUT':
            $data = json_decode(file_get_contents('php://input'), true);
            $stmt = $pdo->prepare("UPDATE subjects SET subject_name = ?, units = ?, faculty_id = ? WHERE subject_code = ?");
            $stmt->execute([
                $data['subjectName'],
                $data['units'],
                $data['facultyId'] ?? null,
                $data['subjectCode']
            ]);
            if ($stmt->rowCount() > 0) {
                echo json_encode(['success' => true, 'message' => 'Subject updated']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Subject not found or no changes made']);
            }
            break;
            
        case 'DELETE':
            $data = json_decode(file_get_contents('php://input'), true);
            $stmt = $pdo->prepare("DELETE FROM subjects WHERE subject_code = ?");
            $stmt->execute([$data['subjectCode']]);
            echo json_encode(['success' => true, 'message' => 'Subject deleted']);
            break;
    }
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
