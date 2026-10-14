<?php
/**
 * Funções compartilhadas da API: configuração, banco, JSON, sessão e permissões.
 * Compatível com PHP 7.4+ (Hostinger usa PHP 8.x por padrão).
 */

declare(strict_types=1);

// ---------- Configuração ----------
$configFile = __DIR__ . '/config.php';
if (!file_exists($configFile)) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'error' => 'Arquivo api/config.php não encontrado. Copie api/config.example.php para api/config.php e preencha os dados do banco.',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}
$CONFIG = require $configFile;

function config(string $key, $default = null)
{
    global $CONFIG;
    return array_key_exists($key, $CONFIG) ? $CONFIG[$key] : $default;
}

// ---------- Respostas JSON ----------
function json_response($data, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function json_error(string $message, int $status = 400, array $extra = []): void
{
    json_response(array_merge(['error' => $message], $extra), $status);
}

function read_json_body(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === '' || $raw === false) {
        return [];
    }
    $data = json_decode($raw, true);
    if (!is_array($data)) {
        json_error('JSON inválido no corpo da requisição.');
    }
    return $data;
}

// ---------- Banco de dados ----------
function db(): PDO
{
    static $pdo = null;
    if ($pdo === null) {
        $c = config('db');
        $dsn = sprintf(
            'mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4',
            $c['host'],
            (int) ($c['port'] ?? 3306),
            $c['name']
        );
        try {
            $pdo = new PDO($dsn, $c['user'], $c['password'], [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ]);
        } catch (PDOException $e) {
            json_error(
                'Não foi possível conectar ao banco de dados.',
                500,
                config('debug') ? ['detail' => $e->getMessage()] : []
            );
        }
    }
    return $pdo;
}

// ---------- CORS (opcional) e proteção CSRF ----------
function handle_cors(): void
{
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $allowed = config('cors_origins', []);
    if ($origin !== '' && in_array($origin, $allowed, true)) {
        header("Access-Control-Allow-Origin: $origin");
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Headers: Content-Type, X-Requested-With, X-HTTP-Method-Override');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Vary: Origin');
    }
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

/**
 * Toda requisição que altera dados precisa do cabeçalho X-Requested-With.
 * Formulários de outros sites não conseguem enviar esse cabeçalho, o que
 * bloqueia ataques CSRF usando o cookie de sessão do usuário.
 */
function require_ajax_header(): void
{
    if (($_SERVER['HTTP_X_REQUESTED_WITH'] ?? '') !== 'XMLHttpRequest') {
        json_error('Requisição bloqueada (cabeçalho X-Requested-With ausente).', 403);
    }
}

// ---------- Sessão / usuário ----------
function start_session(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }
    $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');

    session_name('AMZSESSID');
    session_set_cookie_params([
        'lifetime' => 60 * 60 * 24 * 30, // 30 dias
        'path'     => '/',
        'secure'   => $https,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    ini_set('session.gc_maxlifetime', (string) (60 * 60 * 24 * 30));
    session_start();
}

function public_user(array $u): array
{
    return [
        'id'    => (int) $u['id'],
        'name'  => $u['name'],
        'email' => $u['email'],
        'role'  => $u['role'],
    ];
}

function current_user(): ?array
{
    start_session();
    if (empty($_SESSION['user_id'])) {
        return null;
    }
    $stmt = db()->prepare('SELECT id, name, email, role FROM users WHERE id = ?');
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch();
    return $user ? public_user($user) : null;
}

function require_user(): array
{
    $user = current_user();
    if (!$user) {
        json_error('Faça login para continuar.', 401);
    }
    return $user;
}

function require_admin(): array
{
    $user = require_user();
    if ($user['role'] !== 'admin') {
        json_error('Apenas administradores podem fazer isso.', 403);
    }
    return $user;
}

function is_admin_email(string $email): bool
{
    $list = array_map('strtolower', config('admin_emails', []));
    return in_array(strtolower($email), $list, true);
}

// ---------- Utilidades ----------
/** Caminho base do site (ex.: "" na raiz ou "/amazunfy" em subpasta). */
function site_base_path(): string
{
    $uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
    $pos = strpos($uri, '/api/');
    if ($pos === false) {
        $pos = strpos($uri, '/api');
    }
    return $pos === false ? '' : rtrim(substr($uri, 0, $pos), '/');
}
