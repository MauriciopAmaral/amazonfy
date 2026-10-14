<?php
/**
 * Amazunfy API — roteador principal.
 *
 * Rotas públicas:
 *   GET  /api/health
 *   GET  /api/catalog                  → { artists, songs, videos, podcasts }
 *   GET  /api/{artists|songs|videos|podcasts}[/{id}]
 * Autenticação:
 *   POST /api/auth/register  { name, email, password }
 *   POST /api/auth/login     { email, password }
 *   POST /api/auth/logout
 *   GET  /api/auth/me
 * Admin:
 *   POST   /api/{recurso}          cria
 *   PUT    /api/{recurso}/{id}     atualiza   (ou POST + X-HTTP-Method-Override: PUT)
 *   DELETE /api/{recurso}/{id}     remove     (ou POST + X-HTTP-Method-Override: DELETE)
 *   POST   /api/upload             multipart: file + kind(image|audio|video)
 */

declare(strict_types=1);

// Servidor embutido do PHP (desenvolvimento): deixa arquivos estáticos passarem.
if (PHP_SAPI === 'cli-server') {
    $p = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?: '/';
    if (strpos($p, '/api') !== 0) {
        return false;
    }
}

require __DIR__ . '/bootstrap.php';
require __DIR__ . '/resources.php';
require __DIR__ . '/auth.php';
require __DIR__ . '/upload.php';

set_exception_handler(function (Throwable $e) {
    error_log('[amazunfy] ' . $e);
    json_error('Erro interno no servidor.', 500, config('debug') ? ['detail' => $e->getMessage()] : []);
});

handle_cors();

// ---------- Descobre a rota ----------
$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$pos = strpos($path, '/api');
$route = $pos === false ? '/' : substr($path, $pos + 4);
$route = '/' . trim($route, '/');
if ($route === '/index.php') {
    $route = '/';
}
$segments = $route === '/' ? [] : explode('/', ltrim($route, '/'));

$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
if ($method === 'POST' && !empty($_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'])) {
    $override = strtoupper($_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE']);
    if (in_array($override, ['PUT', 'DELETE'], true)) {
        $method = $override;
    }
}

if ($method !== 'GET') {
    require_ajax_header();
}

// ---------- Rotas ----------
$first = $segments[0] ?? '';

if ($first === '' || $first === 'health') {
    db()->query('SELECT 1');
    json_response(['ok' => true, 'service' => 'amazunfy-api']);
}

if ($first === 'catalog' && $method === 'GET') {
    json_response([
        'artists'  => resource_list('artists'),
        'songs'    => resource_list('songs'),
        'videos'   => resource_list('videos'),
        'podcasts' => resource_list('podcasts'),
    ]);
}

if ($first === 'auth') {
    $action = $segments[1] ?? '';
    if ($action === 'me' && $method === 'GET') {
        auth_me();
    }
    if ($method === 'POST') {
        if ($action === 'register') auth_register();
        if ($action === 'login') auth_login();
        if ($action === 'logout') auth_logout();
    }
    json_error('Rota de autenticação não encontrada.', 404);
}

if ($first === 'upload' && $method === 'POST') {
    require_admin();
    handle_upload();
}

if (isset(RESOURCES[$first])) {
    $idRaw = $segments[1] ?? null;
    $id = null;
    if ($idRaw !== null) {
        $id = filter_var($idRaw, FILTER_VALIDATE_INT);
        if ($id === false || $id <= 0 || count($segments) > 2) {
            json_error('Rota não encontrada.', 404);
        }
    }

    if ($method === 'GET') {
        if ($id === null) {
            json_response(resource_list($first));
        }
        $item = resource_get($first, $id);
        $item ? json_response($item) : json_error('Item não encontrado.', 404);
    }

    require_admin();

    if ($method === 'POST' && $id === null) {
        json_response(resource_create($first, read_json_body()), 201);
    }
    if ($method === 'PUT' && $id !== null) {
        json_response(resource_update($first, $id, read_json_body()));
    }
    if ($method === 'DELETE' && $id !== null) {
        resource_delete($first, $id);
        json_response(['ok' => true]);
    }
    json_error('Método não permitido.', 405);
}

json_error('Rota não encontrada.', 404);
