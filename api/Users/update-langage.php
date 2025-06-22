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
$lang = $data['lang'];

// Validation de la langue
$allowedLangs = ['fr', 'en', 'es'];
if (!in_array($lang, $allowedLangs)) {
    http_response_code(400);
    exit(json_encode(['error' => 'Langue non supportée']));
}

// Met à jour en BDD
$stmt = $pdo->prepare("UPDATE users SET language = ? WHERE id = ?");
$stmt->execute([$lang, $_SESSION['user_id']]);

$_SESSION['lang'] = $lang;
echo json_encode(['success' => true]);