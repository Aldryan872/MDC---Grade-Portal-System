<?php
// ============================================
// TEMPORAL DATA MANAGEMENT
// Handles time-based data: Academic Years, Semesters, Schedules
// ============================================

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config/database.php';

$action = $_GET['action'] ?? 'current';

switch ($action) {
    // ============================================
    // Get Current Academic Period
    // ============================================
    case 'current':
        $currentDate = new DateTime();
        $month = (int)$currentDate->format('m');
        $year = (int)$currentDate->format('Y');
        
        // Determine semester based on month
        // Aug-Dec = 1st Semester, Jan-May = 2nd Semester, Jun-Jul = Summer
        if ($month >= 8 && $month <= 12) {
            $semester = '1st Semester';
            $academicYear = $year . '-' . ($year + 1);
            $semesterStart = new DateTime("$year-08-01");
            $semesterEnd = new DateTime("$year-12-31");
        } elseif ($month >= 1 && $month <= 5) {
            $semester = '2nd Semester';
            $academicYear = ($year - 1) . '-' . $year;
            $semesterStart = new DateTime("$year-01-01");
            $semesterEnd = new DateTime("$year-05-31");
        } else {
            $semester = 'Summer';
            $academicYear = ($year - 1) . '-' . $year;
            $semesterStart = new DateTime("$year-06-01");
            $semesterEnd = new DateTime("$year-07-31");
        }
        
        // Calculate days remaining
        $daysRemaining = $currentDate->diff($semesterEnd)->days;
        $totalDays = $semesterStart->diff($semesterEnd)->days;
        $progress = round((($totalDays - $daysRemaining) / $totalDays) * 100);
        
        echo json_encode([
            'success' => true,
            'data' => [
                'academic_year' => $academicYear,
                'semester' => $semester,
                'current_date' => $currentDate->format('Y-m-d'),
                'semester_start' => $semesterStart->format('Y-m-d'),
                'semester_end' => $semesterEnd->format('Y-m-d'),
                'days_remaining' => $daysRemaining,
                'progress_percentage' => $progress
            ]
        ]);
        break;
    
    // ============================================
    // Get Academic Calendar Events
    // ============================================
    case 'events':
        $year = $_GET['year'] ?? date('Y');
        $month = $_GET['month'] ?? date('m');
        
        try {
            $stmt = $pdo->prepare("
                SELECT * FROM academic_events 
                WHERE YEAR(event_date) = ? AND MONTH(event_date) = ?
                ORDER BY event_date ASC
            ");
            $stmt->execute([$year, $month]);
            $events = $stmt->fetchAll();
            
            echo json_encode(['success' => true, 'data' => $events]);
        } catch(Exception $e) {
            // Return sample events if table doesn't exist
            $events = [
                ['event_date' => "$year-12-23", 'title' => 'Christmas Break Starts', 'type' => 'holiday'],
                ['event_date' => "$year-12-25", 'title' => 'Christmas Day', 'type' => 'holiday'],
                ['event_date' => "$year-12-30", 'title' => 'Rizal Day', 'type' => 'holiday']
            ];
            echo json_encode(['success' => true, 'data' => $events]);
        }
        break;
    
    // ============================================
    // Get Exam Schedule
    // ============================================
    case 'exams':
        $academicYear = $_GET['academic_year'] ?? '2025-2026';
        $semester = $_GET['semester'] ?? '1st';
        
        try {
            $stmt = $pdo->prepare("
                SELECT * FROM exam_schedules 
                WHERE academic_year = ? AND semester = ?
                ORDER BY exam_date ASC
            ");
            $stmt->execute([$academicYear, $semester]);
            $exams = $stmt->fetchAll();
            
            echo json_encode(['success' => true, 'data' => $exams]);
        } catch(Exception $e) {
            // Return sample exam schedule
            $exams = [
                ['exam_type' => 'Prelim', 'exam_date' => '2026-01-15', 'status' => 'upcoming'],
                ['exam_type' => 'Midterm', 'exam_date' => '2026-03-01', 'status' => 'upcoming'],
                ['exam_type' => 'Pre-Final', 'exam_date' => '2026-04-15', 'status' => 'upcoming'],
                ['exam_type' => 'Final', 'exam_date' => '2026-05-15', 'status' => 'upcoming']
            ];
            echo json_encode(['success' => true, 'data' => $exams]);
        }
        break;
    
    // ============================================
    // Grade Submission Deadlines
    // ============================================
    case 'deadlines':
        $currentDate = new DateTime();
        
        // Calculate deadlines based on current semester
        $deadlines = [
            [
                'type' => 'Prelim Grades',
                'deadline' => (clone $currentDate)->modify('+30 days')->format('Y-m-d'),
                'status' => 'pending'
            ],
            [
                'type' => 'Midterm Grades',
                'deadline' => (clone $currentDate)->modify('+60 days')->format('Y-m-d'),
                'status' => 'pending'
            ],
            [
                'type' => 'Pre-Final Grades',
                'deadline' => (clone $currentDate)->modify('+90 days')->format('Y-m-d'),
                'status' => 'pending'
            ],
            [
                'type' => 'Final Grades',
                'deadline' => (clone $currentDate)->modify('+120 days')->format('Y-m-d'),
                'status' => 'pending'
            ]
        ];
        
        echo json_encode(['success' => true, 'data' => $deadlines]);
        break;
    
    // ============================================
    // Attendance by Date Range
    // ============================================
    case 'attendance_range':
        $startDate = $_GET['start'] ?? date('Y-m-01');
        $endDate = $_GET['end'] ?? date('Y-m-t');
        $studentId = $_GET['student_id'] ?? null;
        
        try {
            if ($studentId) {
                $stmt = $pdo->prepare("
                    SELECT date, status, created_at 
                    FROM attendance 
                    WHERE student_id = ? AND date BETWEEN ? AND ?
                    ORDER BY date ASC
                ");
                $stmt->execute([$studentId, $startDate, $endDate]);
            } else {
                $stmt = $pdo->prepare("
                    SELECT student_id, date, status, created_at 
                    FROM attendance 
                    WHERE date BETWEEN ? AND ?
                    ORDER BY date ASC
                ");
                $stmt->execute([$startDate, $endDate]);
            }
            
            echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);
        } catch(Exception $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
        break;
        
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
}
?>
