<?php
/** Cadastro, login, logout e usuário atual (sessão PHP com cookie httpOnly). */

declare(strict_types=1);

function auth_register(): void
{
    $in = read_json_body();
    $name = trim((string) ($in['name'] ?? ''));
    $email = strtolower(trim((string) ($in['email'] ?? '')));
    $password = (string) ($in['password'] ?? '');

    $errors = [];
    if (mb_strlen($name) < 2 || mb_strlen($name) > 120) {
        $errors['name'] = 'Informe seu nome (2 a 120 caracteres).';
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 190) {
        $errors['email'] = 'Informe um e-mail válido.';
    }
    if (strlen($password) < 6 || strlen($password) > 72) {
        $errors['password'] = 'A senha precisa ter entre 6 e 72 caracteres.';
    }
    if ($errors) {
        json_error('Verifique os campos destacados.', 422, ['fields' => $errors]);
    }

    $stmt = db()->prepare('SELECT 1 FROM users WHERE email = ?');
    $stmt->execute([$email]);
    if ($stmt->fetchColumn()) {
        json_error('Este e-mail já está cadastrado.', 409, ['fields' => ['email' => 'Este e-mail já está cadastrado.']]);
    }

    $role = is_admin_email($email) ? 'admin' : 'user';
    $stmt = db()->prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)');
    $stmt->execute([$name, $email, password_hash($password, PASSWORD_DEFAULT), $role]);

    login_session((int) db()->lastInsertId());
    json_response(['user' => current_user()], 201);
}

function auth_login(): void
{
    $in = read_json_body();
    $email = strtolower(trim((string) ($in['email'] ?? '')));
    $password = (string) ($in['password'] ?? '');

    $stmt = db()->prepare('SELECT id, name, email, role, password_hash FROM users WHERE email = ?');
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password_hash'])) {
        usleep(700000); // dificulta tentativas em massa
        json_error('E-mail ou senha incorretos.', 401);
    }

    // Promove a admin se o e-mail foi adicionado em admin_emails depois do cadastro
    if ($user['role'] !== 'admin' && is_admin_email($email)) {
        db()->prepare("UPDATE users SET role = 'admin' WHERE id = ?")->execute([$user['id']]);
    }
    if (password_needs_rehash($user['password_hash'], PASSWORD_DEFAULT)) {
        db()->prepare('UPDATE users SET password_hash = ? WHERE id = ?')
            ->execute([password_hash($password, PASSWORD_DEFAULT), $user['id']]);
    }

    login_session((int) $user['id']);
    json_response(['user' => current_user()]);
}

function auth_logout(): void
{
    start_session();
    $_SESSION = [];
    $p = session_get_cookie_params();
    setcookie(session_name(), '', [
        'expires'  => time() - 3600,
        'path'     => $p['path'],
        'secure'   => $p['secure'],
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_destroy();
    json_response(['ok' => true]);
}

function auth_me(): void
{
    json_response(['user' => current_user()]);
}

function login_session(int $userId): void
{
    start_session();
    session_regenerate_id(true);
    $_SESSION['user_id'] = $userId;
}
