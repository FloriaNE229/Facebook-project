<?php
session_start();
require_once __DIR__ . '/../config.php';

// Vérification authentification
if (!isset($_SESSION['user_id'])) {
    header('Location: /login');
    exit;
}

// Récupération préférence thème
$stmt = $pdo->prepare("SELECT dark_mode FROM users WHERE id = ?");
$stmt->execute([$_SESSION['user_id']]);
$isDarkMode = $stmt->fetchColumn();
?>

<!DOCTYPE html>
<html lang="fr" data-theme="<?= $isDarkMode ? 'dark' : 'light' ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Paramètres d'affichage | Facebook</title>
    
    <!-- Bulma CSS -->
    <link rel="stylesheet" href="assets\CSS\bulma.min.css">
    
    <!-- Animate.css -->
    <link rel="stylesheet" href="assets\CSS\animate.min.css">
    
    <!-- Material Design Icons -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@mdi/font@6.5.95/css/materialdesignicons.min.css">
    
    <style>
        /* Variables Facebook officielles avec Bulma */
        :root {
            --fb-blue: #1877f2;
            --fb-white: #ffffff;
            --fb-light-bg: #f0f2f5;
            --fb-light-text: #050505;
            --fb-card: #ffffff;
            --fb-border: #dddfe2;
        }

        [data-theme="dark"] {
            --fb-blue: #2d88ff;
            --fb-white: #18191a;
            --fb-light-bg: #121212;
            --fb-light-text: #e4e6eb;
            --fb-card: #242526;
            --fb-border: #3e4042;
            
            /* Adaptations Bulma pour dark mode */
            --scheme-main: var(--fb-card);
            --text: var(--fb-light-text);
            --background: var(--fb-light-bg);
        }

        /* Structure Facebook avec Bulma */
        .fb-settings-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
            min-height: 100vh;
            background-color: var(--fb-light-bg);
        }

        .fb-settings-card {
            background-color: var(--fb-card);
            border-radius: 8px;
            padding: 1.5rem;
            margin-bottom: 1rem;
            border: 1px solid var(--fb-border);
            box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }

        /* Toggle Facebook avec animations */
        .fb-toggle {
            display: flex;
            align-items: center;
            padding: 0.75rem 0;
            transition: all 0.3s ease;
        }

        .fb-toggle:hover {
            background-color: var(--fb-light-bg);
            border-radius: 6px;
        }

        .fb-toggle-switch {
            position: relative;
            width: 44px;
            height: 24px;
            margin-right: 12px;
        }

        .fb-toggle-switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }

        .fb-toggle-slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #ced0d4;
            transition: .2s;
            border-radius: 12px;
        }

        .fb-toggle-slider:before {
            position: absolute;
            content: "";
            height: 20px;
            width: 20px;
            left: 2px;
            bottom: 2px;
            background-color: white;
            transition: .2s;
            border-radius: 50%;
        }

        input:checked + .fb-toggle-slider {
            background-color: var(--fb-blue);
        }

        input:checked + .fb-toggle-slider:before {
            transform: translateX(20px);
        }
    </style>
</head>
<body>
    <div class="fb-settings-container animate__animated animate__fadeIn">
        <!-- En-tête style Facebook avec Bulma -->
        <div class="fb-settings-card animate__animated animate__fadeInDown">
            <div class="is-flex is-align-items-center">
                <span class="icon-text">
                    <span class="icon has-text-primary">
                        <i class="mdi mdi-cog"></i>
                    </span>
                    <h1 class="title is-4 mb-0">Paramètres d'affichage</h1>
                </span>
            </div>
        </div>

        <!-- Section Mode Sombre avec animation -->
        <div class="fb-settings-card animate__animated animate__fadeInUp animate__delay-1s">
            <div class="fb-toggle">
                <label class="fb-toggle-switch">
                    <input type="checkbox" id="theme-toggle" <?= $isDarkMode ? 'checked' : '' ?>>
                    <span class="fb-toggle-slider"></span>
                </label>
                <div>
                    <div class="has-text-weight-medium">Mode sombre</div>
                    <div class="is-size-7 has-text-grey">
                        Ajustez l'apparence pour réduire l'éblouissement
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="assets/js/theme.js"></script>
    <script>
    // Gestion des animations au changement de thème
    document.getElementById('theme-toggle')?.addEventListener('change', function() {
        // Animation de transition
        document.body.classList.add('animate__faster', 'animate__fadeOut');
        
        setTimeout(() => {
            fetch('/api/settings/theme', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    dark_mode: this.checked,
                    user_id: <?= $_SESSION['user_id'] ?>
                })
            })
            .then(() => {
                // Applique le thème après la requête
                document.documentElement.setAttribute('data-theme', this.checked ? 'dark' : 'light');
                localStorage.setItem('fb-theme', this.checked ? 'dark' : 'light');
                
                // Animation de retour
                document.body.classList.remove('animate__fadeOut');
                document.body.classList.add('animate__fadeIn');
                
                setTimeout(() => {
                    document.body.classList.remove('animate__fadeIn');
                }, 300);
            })
            .catch(err => console.error("Erreur:", err));
        }, 150);
    });
    </script>
</body>
</html>