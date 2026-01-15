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
            if (isset($_GET['student_id']) && isset($_GET['subject_code'])) {
                // Get single grade by student and subject
                $stmt = $pdo->prepare("
                    SELECT g.*, s.subject_name, s.units, st.full_name as student_name 
                    FROM grades g 
                    JOIN subjects s ON g.subject_code = s.subject_code 
                    JOIN students st ON g.student_id = st.student_id
                    WHERE g.student_id = ? AND g.subject_code = ?
                ");
                $stmt->execute([$_GET['student_id'], $_GET['subject_code']]);
            } elseif (isset($_GET['student_id'])) {
                // Get grades for specific student
                $stmt = $pdo->prepare("
                    SELECT g.*, s.subject_name, s.units 
                    FROM grades g 
                    JOIN subjects s ON g.subject_code = s.subject_code 
                    WHERE g.student_id = ?
                ");
                $stmt->execute([$_GET['student_id']]);
            } else {
                // Get all grades
                $stmt = $pdo->query("
                    SELECT g.*, s.subject_name, st.full_name as student_name 
                    FROM grades g 
                    JOIN subjects s ON g.subject_code = s.subject_code 
                    JOIN students st ON g.student_id = st.student_id
                    ORDER BY st.full_name
                ");
            }
            $grades = $stmt->fetchAll();
            echo json_encode(['success' => true, 'data' => $grades]);
            break;
            
        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            $stmt = $pdo->prepare("INSERT INTO grades (student_id, subject_code, prelim, midterm, prefinal, final, academic_year, semester) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $data['studentId'],
                $data['subjectCode'],
                $data['prelim'] ?? 0,
                $data['midterm'] ?? 0,
                $data['prefinal'] ?? 0,
                $data['final'] ?? 0,
                $data['academicYear'] ?? '2025-2026',
                $data['semester'] ?? '1st'
            ]);
            // Log the grade addition for tracking
            error_log("Grade added: Student ID: " . $data['studentId'] . ", Subject: " . $data['subjectCode'] . ", Prelim: " . ($data['prelim'] ?? 0) . ", Midterm: " . ($data['midterm'] ?? 0) . ", Prefinal: " . ($data['prefinal'] ?? 0) . ", Final: " . ($data['final'] ?? 0) . ", AY: " . ($data['academicYear'] ?? '2025-2026') . ", Semester: " . ($data['semester'] ?? '1st') . " at " . date('Y-m-d H:i:s'));
            echo json_encode(['success' => true, 'message' => 'Grade added']);
            break;
            
        case 'PUT':
            $data = json_decode(file_get_contents('php://input'), true);
            $stmt = $pdo->prepare("UPDATE grades SET prelim=?, midterm=?, prefinal=?, final=? WHERE student_id=? AND subject_code=?");
            $stmt->execute([
                $data['prelim'],
                $data['midterm'],
                $data['prefinal'],
                $data['final'],
                $data['studentId'],
                $data['subjectCode']
            ]);
            echo json_encode(['success' => true, 'message' => 'Grade updated']);
            break;
            
        case 'DELETE':
            $data = json_decode(file_get_contents('php://input'), true);
            $stmt = $pdo->prepare("DELETE FROM grades WHERE student_id = ? AND subject_code = ?");
            $stmt->execute([$data['studentId'], $data['subjectCode']]);
            if ($stmt->rowCount() > 0) {
                echo json_encode(['success' => true, 'message' => 'Grade deleted successfully']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Grade not found']);
            }
            break;
    }
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
