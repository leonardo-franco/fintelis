<?php

// Inicia a sessão para podermos usar mensagens de feedback (flash messages).
session_start();

// Inclui o arquivo de configuração e conexão com o banco de dados.
require_once __DIR__ . '/../config.php';

// Prepara a resposta JSON
header('Content-Type: application/json');

// Verifica se o formulário foi enviado usando o método POST.
if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'POST') {

    // 1. Coleta e limpa os dados do formulário.
    $nome = trim($_POST['nome'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $senha = $_POST['senha'] ?? '';
    $terms = isset($_POST['terms']);

    // 2. Validação dos dados no lado do servidor.
    $errors = [];
    if (empty($nome)) {
        $errors[] = "O nome é obrigatório.";
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors[] = "O formato do e-mail é inválido.";
    }
    if (strlen($senha) < 8) {
        $errors[] = "A senha deve ter no mínimo 8 caracteres.";
    }
    if (!$terms) {
        $errors[] = "Você deve aceitar os Termos de Serviço e a Política de Privacidade.";
    }

    // Se não houver erros de validação, prossegue para a interação com o banco de dados.
    if (empty($errors)) {
        try {
            // 3. Verifica se o e-mail já está cadastrado para evitar duplicatas.
            $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
            $stmt->execute([$email]);

            if ($stmt->fetch()) {
                $errors[] = "Este e-mail já está em uso. Tente fazer login.";
            } else { 
                // 4. Criptografa a senha antes de salvá-la (NUNCA armazene senhas em texto plano).
                $password_hash = password_hash($senha, PASSWORD_DEFAULT);

                // 5. Insere o novo usuário no banco de dados usando um prepared statement para evitar SQL Injection.
                $stmt = $pdo->prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)");
                $stmt->execute([$nome, $email, $password_hash]);

                // 6. Retorna uma mensagem de sucesso.
                echo json_encode(['status' => 'success', 'message' => 'Conta criada com sucesso!']);
                exit; 
            }
        } catch (PDOException $e) {
            // Em caso de erro no banco de dados, adiciona uma mensagem genérica.
            // Em produção, logue o erro real: error_log($e->getMessage());
            $errors[] = "Ocorreu um erro ao processar seu cadastro. Tente novamente mais tarde.";
        }
    }

    // Se houver erros (de validação ou do banco de dados), armazena na sessão e redireciona.
    if (!empty($errors)) {
        $_SESSION['form_errors'] = $errors;
        // Você pode também armazenar os dados preenchidos para repopular o formulário.
        $_SESSION['form_data'] = $_POST;
        // Retorna o primeiro erro encontrado para ser exibido no toast.
        echo json_encode(['status' => 'error', 'message' => $errors[0]]);
        exit; 
    }

} else {
    // Se o acesso não for via POST, redireciona para a página de login.
    echo json_encode(['status' => 'error', 'message' => 'Acesso inválido.']);
    exit; 
}

?>