<?php
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$state = $data['state'] ?? '';

if (empty($state)) {
    echo json_encode(['success' => false, 'message' => 'State required']);
    exit;
}

$_SESSION['google_state'] = $state;

echo json_encode(['success' => true]);
?>
