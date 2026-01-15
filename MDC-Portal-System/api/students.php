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
            if (isset($_GET['id'])) {
                $stmt = $pdo->prepare("SELECT * FROM students WHERE student_id = ?");
                $stmt->execute([$_GET['id']]);
                $student = $stmt->fetch();
                echo json_encode(['success' => true, 'data' => $student]);
            } else {
                $stmt = $pdo->query("SELECT * FROM students ORDER BY full_name");
                $students = $stmt->fetchAll();
                echo json_encode(['success' => true, 'data' => $students]);
            }
            break;
            
        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            $stmt = $pdo->prepare("INSERT INTO students (student_id, full_name, course, year_level, section, contact) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $data['studentId'],
                $data['fullName'],
                $data['course'],
                $data['year'],
                $data['section'],
                $data['contact'] ?? ''
            ]);
            echo json_encode(['success' => true, 'message' => 'Student added']);
            break;
            
        case 'PUT':
            $data = json_decode(file_get_contents('php://input'), true);
            $stmt = $pdo->prepare("UPDATE students SET full_name=?, course=?, year_level=?, section=?, contact=? WHERE student_id=?");
            $stmt->execute([
                $data['fullName'],
                $data['course'],
                $data['year'],
                $data['section'],
                $data['contact'] ?? '',
                $data['studentId']
            ]);
            echo json_encode(['success' => true, 'message' => 'Student updated']);
            break;
            
        case 'DELETE':
            $data = json_decode(file_get_contents('php://input'), true);
            if (empty($data['studentId'])) {
                echo json_encode(['success' => false, 'message' => 'Missing studentId']);
                break;
            }

            try {
                // Begin transaction for safe cascading delete
                $pdo->beginTransaction();

                // Delete dependent rows in grades first to satisfy FK constraints
                $delGrades = $pdo->prepare("DELETE FROM grades WHERE student_id = ?");
                $delGrades->execute([$data['studentId']]);

                // Delete dependent rows in attendance
                $delAttendance = $pdo->prepare("DELETE FROM attendance WHERE student_id = ?");
                $delAttendance->execute([$data['studentId']]);

                // Delete dependent rows in clearance
                $delClearance = $pdo->prepare("DELETE FROM clearance WHERE student_id = ?");
                $delClearance->execute([$data['studentId']]);

                // Now delete the student
                $delStudent = $pdo->prepare("DELETE FROM students WHERE student_id = ?");
                $delStudent->execute([$data['studentId']]);

                $deletedStudents = $delStudent->rowCount();

                $pdo->commit();

                if ($deletedStudents > 0) {
                    echo json_encode(['success' => true, 'message' => 'Student deleted (including related grades)']);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Student not found']);
                }
            } catch (PDOException $ex) {
                if ($pdo->inTransaction()) {
                    $pdo->rollBack();
                }
                echo json_encode(['success' => false, 'message' => 'Delete failed: ' . $ex->getMessage()]);
            }
            break;
    }
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
