<?php

require_once __DIR__ . '/vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

/**
 * Configurações de Conexão com o Banco de Dados
 * As credenciais são carregadas de forma segura a partir do arquivo .env
 */

define('DB_HOST', $_ENV['DB_HOST']);
define('DB_USER', $_ENV['DB_USER']);
define('DB_PASS', $_ENV['DB_PASS']);
define('DB_NAME', $_ENV['DB_NAME']);
define('DB_PORT', $_ENV['DB_PORT']);

/**
 * Tenta estabelecer a conexão com o banco de dados usando PDO.
 * PDO é uma abordagem moderna e segura para interagir com bancos de dados.
 */
try {
    $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4";
    $pdo = new PDO($dsn, DB_USER, DB_PASS);
    // Configura o PDO para lançar exceções em caso de erro, facilitando o debug.
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    // Se a conexão falhar, envia uma resposta JSON e encerra o script.
    // Isso garante que o frontend receba um erro formatado corretamente.
    header('Content-Type: application/json');
    // error_log("DB Connection Error: " . $e->getMessage()); // Em produção, logue o erro real.
    echo json_encode(['status' => 'error', 'message' => 'Erro de conexão com o servidor.']);
    exit;
}
