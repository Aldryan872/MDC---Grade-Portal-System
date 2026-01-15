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
                $stmt = $pdo->prepare("
                    SELECT f.*, COUNT(s.id) as subject_count 
                    FROM faculty f 
                    LEFT JOIN subjects s ON f.faculty_id = s.faculty_id 
                    WHERE f.faculty_id = ?
                    GROUP BY f.faculty_id
                ");
                $stmt->execute([$_GET['id']]);
                $faculty = $stmt->fetch(PDO::FETCH_ASSOC);
                if ($faculty) {
                    echo json_encode(['success' => true, 'data' => $faculty]);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Faculty not found']);
                }
            } else {
                $stmt = $pdo->query("
                    SELECT f.*, COUNT(s.id) as subject_count 
                    FROM faculty f 
                    LEFT JOIN subjects s ON f.faculty_id = s.faculty_id 
                    GROUP BY f.faculty_id 
                    ORDER BY f.full_name
                ");
                $faculty = $stmt->fetchAll();
                echo json_encode(['success' => true, 'data' => $faculty]);
            }
            break;
            
        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            $stmt = $pdo->prepare("INSERT INTO faculty (faculty_id, full_name, department, subjects) VALUES (?, ?, ?, ?)");
            $stmt->execute([$data['facultyId'], $data['fullName'], $data['department'], $data['subjects'] ?? null]);
            echo json_encode(['success' => true, 'message' => 'Faculty added']);
            break;
            
        case 'PUT':
            $data = json_decode(file_get_contents('php://input'), true);
            $facultyId = $data['facultyId'];
            
            // Update faculty basic info
            $subjectsString = isset($data['subjects']) && is_array($data['subjects']) ? implode(', ', $data['subjects']) : null;
            $stmt = $pdo->prepare("UPDATE faculty SET full_name=?, department=?, subjects=? WHERE faculty_id=?");
            $stmt->execute([
                $data['fullName'],
                $data['department'],
                $subjectsString,
                $facultyId
            ]);
            
            // Handle subjects reassignment if provided
            if (isset($data['subjects']) && is_array($data['subjects'])) {
                $selectedSubjects = $data['subjects'];
                
                // Unassign all subjects for this faculty
                $stmt = $pdo->prepare("UPDATE subjects SET faculty_id = NULL WHERE faculty_id = ?");
                $stmt->execute([$facultyId]);
                
                // Assign selected subjects
                if (!empty($selectedSubjects)) {
                    $placeholders = str_repeat('?,', count($selectedSubjects) - 1) . '?';
                    $stmt = $pdo->prepare("UPDATE subjects SET faculty_id = ? WHERE subject_code IN ($placeholders)");
                    $params = array_merge([$facultyId], $selectedSubjects);
                    $stmt->execute($params);
                }
            }
            
            echo json_encode(['success' => true, 'message' => 'Faculty updated']);
            break;
            
        case 'DELETE':
            $data = json_decode(file_get_contents('php://input'), true);
            $stmt = $pdo->prepare("DELETE FROM faculty WHERE faculty_id = ?");
            $stmt->execute([$data['facultyId']]);
            echo json_encode(['success' => true, 'message' => 'Faculty deleted']);
            break;
    }
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
