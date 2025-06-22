<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/database.php';

// Vérification méthode HTTP
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Méthode non autorisée'
    ]);
    exit;
}

// Récupération des données
$input = json_decode(file_get_contents('php://input'), true);
if ($input === null) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Données JSON invalides'
    ]);
    exit;
}

$email = filter_var($input['email'] ?? '', FILTER_SANITIZE_EMAIL);
$password = $input['password'] ?? '';

// Validation
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Format d\'email invalide'
    ]);
    exit;
}

if (strlen($password) < 8) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Le mot de passe doit contenir au moins 8 caractères'
    ]);
    exit;
}

try {
    // Requête préparée
    $stmt = $pdo->prepare("
        SELECT id, password, first_name, avatar, is_active, is_verified 
        FROM users 
        WHERE email = :email
        LIMIT 1
    ");
    $stmt->execute([':email' => $email]);
    $user = $stmt->fetch();

    if (!$user) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Identifiants incorrects'
        ]);
        exit;
    }

    if (!$user['is_active']) {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'message' => 'Compte désactivé'
        ]);
        exit;
    }

    if (!$user['is_verified']) {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'message' => 'Veuillez vérifier votre email'
        ]);
        exit;
    }

    if (!password_verify($password, $user['password'])) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Identifiants incorrects'
        ]);
        exit;
    }

    // Création du token
    $tokenData = [
        'iss' => 'friendsphere',
        'sub' => $user['id'],
        'iat' => time(),
        'exp' => time() + 3600,
        'user' => [
            'id' => $user['id'],
            'firstName' => $user['first_name'],
            'avatar' => $user['avatar'] ?: 'assets/images/avatars/default.jpg'
        ]
    ];

    $token = base64_encode(json_encode($tokenData));

    // Réponse
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Connexion réussie',
        'token' => $token,
        'user' => $tokenData['user']
    ]);

} catch (PDOException $e) {
    error_log('Database error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erreur de base de données'
    ]);
}