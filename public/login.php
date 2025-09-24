<?php

// Inicia a sessão para manter o usuário logado após a autenticação.
session_start();

// Inclui o arquivo de configuração e conexão com o banco de dados.
require_once __DIR__ . '/../config.php';

// Define o cabeçalho da resposta como JSON.
header('Content-Type: application/json');

// Verifica se o formulário foi enviado usando o método POST.
if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'POST') {

    // Coleta e limpa os dados do formulário.
    $email = trim($_POST['email'] ?? '');
    $senha = $_POST['senha'] ?? '';

    // Validação básica.
    if (empty($email) || empty($senha)) {
        echo json_encode(['status' => 'error', 'message' => 'E-mail e senha são obrigatórios.']);
        exit;
    }

    try {
        // Procura o usuário pelo e-mail. Selecionamos o ID, nome e o hash da senha.
        $stmt = $pdo->prepare("SELECT id, name, password FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        // Verifica se o usuário foi encontrado e se a senha está correta.
        if ($user && password_verify($senha, $user['password'])) {
            // A senha está correta. Regenera o ID da sessão para segurança.
            session_regenerate_id(true);

            // Armazena os dados do usuário na sessão.
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_name'] = $user['name'];

            // Retorna sucesso e o destino do redirecionamento.
            echo json_encode(['status' => 'success', 'message' => 'Login bem-sucedido!', 'redirect' => 'dashboard.html']);
            exit;
        } else {
            // Usuário não encontrado ou senha incorreta.
            echo json_encode(['status' => 'error', 'message' => 'E-mail ou senha inválidos.']);
            exit;
        }
    } catch (PDOException $e) {
        // Em caso de erro no banco de dados, retorna uma mensagem genérica.
        // error_log($e->getMessage()); // Logar o erro em produção.
        echo json_encode(['status' => 'error', 'message' => 'Ocorreu um erro no servidor. Tente novamente.']);
        exit;
    }
} else {
    // Acesso inválido.
    echo json_encode(['status' => 'error', 'message' => 'Método de requisição inválido.']);
    exit;
}