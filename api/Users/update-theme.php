<?php
require_once __DIR__.'/../../config/database.php';
require_once __DIR__.'/../middleware/auth.php';

header('Content-Type: application/json');

// Vérifie l'authentification
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    exit(json_encode(['error' => 'Non authentifié']));
}

$data = json_decode(file_get_contents('php://input'), true);
$darkMode = $data['dark_mode'] ? 1 : 0;

// Met à jour en BDD
$stmt = $pdo->prepare("UPDATE users SET dark_mode = ? WHERE id = ?");
$stmt->execute([$darkMode, $_SESSION['user_id']]);

echo json_encode(['success' => true]);