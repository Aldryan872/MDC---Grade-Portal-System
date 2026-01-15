<?php
// ============================================
// DESIGN PATTERN: Singleton Pattern
// GradeCalculator - Single instance for grade calculations
// ============================================

class GradeCalculator {
    // Singleton instance
    private static $instance = null;
    
    // Grade weights
    private $weights = [
        'prelim' => 0.20,
        'midterm' => 0.20,
        'prefinal' => 0.20,
        'final' => 0.40
    ];
    
    // Private constructor (Singleton pattern)
    private function __construct() {}
    
    // Prevent cloning
    private function __clone() {}
    
    // Get singleton instance
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    // ============================================
    // ALGORITHM: Weighted Average Calculation
    // ============================================
    public function calculateFinalGrade($prelim, $midterm, $prefinal, $final) {
        return round(
            ($prelim * $this->weights['prelim']) +
            ($midterm * $this->weights['midterm']) +
            ($prefinal * $this->weights['prefinal']) +
            ($final * $this->weights['final']),
            2
        );
    }
    
    // ============================================
    // ALGORITHM: Grade Point Conversion (Philippine System)
    // ============================================
    public function getGradePoint($numericGrade) {
        // Binary search-like approach for grade conversion
        $gradeScale = [
            ['min' => 97, 'max' => 100, 'gp' => 1.00],
            ['min' => 94, 'max' => 96.99, 'gp' => 1.25],
            ['min' => 91, 'max' => 93.99, 'gp' => 1.50],
            ['min' => 88, 'max' => 90.99, 'gp' => 1.75],
            ['min' => 85, 'max' => 87.99, 'gp' => 2.00],
            ['min' => 82, 'max' => 84.99, 'gp' => 2.25],
            ['min' => 79, 'max' => 81.99, 'gp' => 2.50],
            ['min' => 76, 'max' => 78.99, 'gp' => 2.75],
            ['min' => 75, 'max' => 75.99, 'gp' => 3.00],
            ['min' => 0, 'max' => 74.99, 'gp' => 5.00]
        ];
        
        foreach ($gradeScale as $scale) {
            if ($numericGrade >= $scale['min'] && $numericGrade <= $scale['max']) {
                return $scale['gp'];
            }
        }
        return 5.00;
    }
    
    // Get letter grade equivalent
    public function getLetterGrade($numericGrade) {
        if ($numericGrade >= 90) return 'A';
        if ($numericGrade >= 85) return 'B+';
        if ($numericGrade >= 80) return 'B';
        if ($numericGrade >= 75) return 'C';
        return 'F';
    }
    
    // Get remarks
    public function getRemarks($numericGrade) {
        return $numericGrade >= 75 ? 'PASSED' : 'FAILED';
    }
    
    // ============================================
    // ALGORITHM: GWA (General Weighted Average) Calculation
    // ============================================
    public function calculateGWA($grades) {
        if (empty($grades)) return 0;
        
        $totalUnits = 0;
        $totalWeightedGrade = 0;
        
        foreach ($grades as $grade) {
            $finalGrade = $this->calculateFinalGrade(
                $grade['prelim'],
                $grade['midterm'],
                $grade['prefinal'],
                $grade['final']
            );
            $gradePoint = $this->getGradePoint($finalGrade);
            $units = $grade['units'] ?? 3;
            
            $totalWeightedGrade += ($gradePoint * $units);
            $totalUnits += $units;
        }
        
        return $totalUnits > 0 ? round($totalWeightedGrade / $totalUnits, 2) : 0;
    }
    
    // ============================================
    // ALGORITHM: Class Ranking using Quick Sort
    // ============================================
    public function rankStudents($students) {
        // Quick sort implementation for ranking
        $this->quickSort($students, 0, count($students) - 1);
        
        // Assign ranks
        $rank = 1;
        foreach ($students as &$student) {
            $student['rank'] = $rank++;
        }
        
        return $students;
    }
    
    private function quickSort(&$arr, $low, $high) {
        if ($low < $high) {
            $pivot = $this->partition($arr, $low, $high);
            $this->quickSort($arr, $low, $pivot - 1);
            $this->quickSort($arr, $pivot + 1, $high);
        }
    }
    
    private function partition(&$arr, $low, $high) {
        $pivot = $arr[$high]['gwa'];
        $i = $low - 1;
        
        for ($j = $low; $j < $high; $j++) {
            // Lower GWA is better (1.0 is highest)
            if ($arr[$j]['gwa'] <= $pivot) {
                $i++;
                $temp = $arr[$i];
                $arr[$i] = $arr[$j];
                $arr[$j] = $temp;
            }
        }
        
        $temp = $arr[$i + 1];
        $arr[$i + 1] = $arr[$high];
        $arr[$high] = $temp;
        
        return $i + 1;
    }
}
?>
