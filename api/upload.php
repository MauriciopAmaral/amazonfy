<?php
/**
 * Upload de arquivos pelo painel admin (imagens, áudios e vídeos).
 * Os arquivos vão para /uploads/AAAA/MM/ na raiz do site.
 */

declare(strict_types=1);

const UPLOAD_TYPES = [
    'image' => [
        'ext'  => ['jpg', 'jpeg', 'png', 'webp', 'gif'],
        'mime' => ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    ],
    'audio' => [
        'ext'  => ['mp3', 'm4a', 'ogg', 'wav', 'aac'],
        'mime' => ['audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/x-m4a', 'audio/ogg', 'audio/wav',
                   'audio/x-wav', 'audio/vnd.wave', 'audio/aac', 'audio/x-hx-aac-adts', 'application/octet-stream',
                   'video/mp4'],
    ],
    'video' => [
        'ext'  => ['mp4', 'webm'],
        'mime' => ['video/mp4', 'video/webm', 'application/octet-stream'],
    ],
];

function handle_upload(): void
{
    $kind = (string) ($_POST['kind'] ?? '');
    if (!isset(UPLOAD_TYPES[$kind])) {
        json_error('Tipo de arquivo inválido (use image, audio ou video).');
    }
    if (empty($_FILES['file']) || !is_array($_FILES['file'])) {
        json_error('Nenhum arquivo enviado. Se o arquivo é grande, ele pode ter passado do limite do servidor.');
    }

    $file = $_FILES['file'];
    if ($file['error'] !== UPLOAD_ERR_OK) {
        $msg = in_array($file['error'], [UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE], true)
            ? 'Arquivo maior que o limite do servidor (upload_max_filesize).'
            : 'Falha no envio do arquivo (código ' . $file['error'] . ').';
        json_error($msg);
    }

    $maxBytes = (int) config('max_upload_mb', 50) * 1024 * 1024;
    if ($file['size'] > $maxBytes) {
        json_error('Arquivo maior que ' . config('max_upload_mb', 50) . ' MB.');
    }

    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $rules = UPLOAD_TYPES[$kind];
    if (!in_array($ext, $rules['ext'], true)) {
        json_error('Extensão não permitida. Use: ' . implode(', ', $rules['ext']) . '.');
    }

    $mime = (new finfo(FILEINFO_MIME_TYPE))->file($file['tmp_name']) ?: '';
    if (!in_array($mime, $rules['mime'], true)) {
        json_error("O conteúdo do arquivo ($mime) não corresponde a um(a) $kind válido(a).");
    }

    $sub = date('Y') . '/' . date('m');
    $dir = dirname(__DIR__) . '/uploads/' . $sub;
    if (!is_dir($dir) && !mkdir($dir, 0755, true)) {
        json_error('Não foi possível criar a pasta de uploads no servidor.', 500);
    }

    $base = preg_replace('/[^a-z0-9]+/', '-', strtolower(pathinfo($file['name'], PATHINFO_FILENAME)));
    $base = trim(substr((string) $base, 0, 40), '-') ?: 'arquivo';
    $filename = $base . '-' . bin2hex(random_bytes(4)) . '.' . $ext;

    if (!move_uploaded_file($file['tmp_name'], "$dir/$filename")) {
        json_error('Não foi possível salvar o arquivo no servidor.', 500);
    }

    json_response(['url' => site_base_path() . "/uploads/$sub/$filename"], 201);
}
