<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once '../config/database.php';
require_once '../includes/GradeCalculator.php';

try {
    // Get counts
    $students = $pdo->query("SELECT COUNT(*) as count FROM students")->fetch()['count'];
    $faculty = $pdo->query("SELECT COUNT(*) as count FROM faculty")->fetch()['count'];
    $subjects = $pdo->query("SELECT COUNT(*) as count FROM subjects")->fetch()['count'];
    
    // Grade stats
    $gradeRecords = $pdo->query("SELECT COUNT(*) as count FROM grades")->fetch()['count'];
    $avgGradeResult = $pdo->query("SELECT AVG(final) as avg FROM grades")->fetch();
    $avgGrade = $avgGradeResult ? round($avgGradeResult['avg'], 2) : 0;
    
    $passedGrades = $pdo->query("SELECT COUNT(*) as count FROM grades WHERE final >= 75")->fetch()['count'];
    $passRate = $gradeRecords > 0 ? round(($passedGrades / $gradeRecords) * 100, 2) : 0;
    
    // Grade distribution
    $excellent = $pdo->query("SELECT COUNT(*) as count FROM grades WHERE final >= 90")->fetch()['count'];
    $average = $pdo->query("SELECT COUNT(*) as count FROM grades WHERE final >= 75 AND final < 90")->fetch()['count'];
    $failed = $pdo->query("SELECT COUNT(*) as count FROM grades WHERE final < 75")->fetch()['count'];
    
    $excellentPct = $gradeRecords > 0 ? round(($excellent / $gradeRecords) * 100, 2) : 0;
    $averagePct = $gradeRecords > 0 ? round(($average / $gradeRecords) * 100, 2) : 0;
    $failedPct = $gradeRecords > 0 ? round(($failed / $gradeRecords) * 100, 2) : 0;
    
    // Get faculty list
    $facultyList = $pdo->query("SELECT * FROM faculty")->fetchAll();
    
    // Get grades table data
    $gradesStmt = $pdo->query("
        SELECT 
            s.student_id, 
            s.full_name, 
            g.subject_code, 
            sub.subject_name, 
            g.prelim, 
            g.midterm, 
            g.prefinal, 
            g.final 
        FROM grades g 
        JOIN students s ON g.student_id = s.student_id 
        JOIN subjects sub ON g.subject_code = sub.subject_code 
        ORDER BY s.full_name, sub.subject_name
    ");
    $grades = $gradesStmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Compute GPA and Status for each grade
    $calculator = GradeCalculator::getInstance();
    foreach ($grades as &$grade) {
        $grade['gpa'] = $calculator->getGradePoint($grade['final']);
        $grade['status'] = $calculator->getRemarks($grade['final']);
    }
    
    echo json_encode([
        'success' => true,
        'data' => [
            'students' => $students,
            'faculty' => $faculty,
            'subjects' => $subjects,
            'grade_records' => $gradeRecords,
            'avg_grade' => $avgGrade,
            'pass_rate' => $passRate,
            'grade_distribution' => [
                'excellent' => ['count' => $excellent, 'percentage' => $excellentPct],
                'average' => ['count' => $average, 'percentage' => $averagePct],
                'failed' => ['count' => $failed, 'percentage' => $failedPct]
            ],
            'facultyList' => $facultyList,
            'grades' => $grades
        ]
    ]);
    
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
