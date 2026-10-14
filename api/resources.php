<?php
/**
 * Definição dos conteúdos do catálogo (artistas, músicas, vídeos e podcasts):
 * consulta de listagem + regras de validação usadas no painel admin.
 */

declare(strict_types=1);

const RESOURCES = [
    'artists' => [
        'table'  => 'artists',
        'select' => 'SELECT id, name, image, banner, bio FROM artists',
        'order'  => 'ORDER BY name',
        'fields' => [
            'name'   => ['type' => 'string', 'max' => 150, 'required' => true, 'label' => 'Nome'],
            'image'  => ['type' => 'url', 'label' => 'Foto'],
            'banner' => ['type' => 'url', 'label' => 'Banner'],
            'bio'    => ['type' => 'text', 'label' => 'Biografia'],
        ],
    ],
    'songs' => [
        'table'  => 'songs',
        'select' => 'SELECT s.id, s.artist_id, a.name AS artist, s.name, s.image, s.audio, s.duration
                     FROM songs s JOIN artists a ON a.id = s.artist_id',
        'order'  => 'ORDER BY s.id',
        'idCol'  => 's.id',
        'fields' => [
            'artist_id' => ['type' => 'fk', 'table' => 'artists', 'required' => true, 'label' => 'Artista'],
            'name'      => ['type' => 'string', 'max' => 200, 'required' => true, 'label' => 'Nome'],
            'image'     => ['type' => 'url', 'label' => 'Capa'],
            'audio'     => ['type' => 'url', 'required' => true, 'label' => 'Áudio'],
            'duration'  => ['type' => 'duration', 'label' => 'Duração'],
        ],
    ],
    'videos' => [
        'table'  => 'videos',
        'select' => 'SELECT v.id, v.artist_id, a.name AS artist, v.title, v.url, v.thumbnail, v.description
                     FROM videos v LEFT JOIN artists a ON a.id = v.artist_id',
        'order'  => 'ORDER BY v.created_at DESC, v.id DESC',
        'idCol'  => 'v.id',
        'fields' => [
            'title'       => ['type' => 'string', 'max' => 200, 'required' => true, 'label' => 'Título'],
            'artist_id'   => ['type' => 'fk', 'table' => 'artists', 'label' => 'Artista'],
            'url'         => ['type' => 'url', 'required' => true, 'label' => 'Link do vídeo'],
            'thumbnail'   => ['type' => 'url', 'label' => 'Miniatura'],
            'description' => ['type' => 'text', 'label' => 'Descrição'],
        ],
    ],
    'podcasts' => [
        'table'  => 'podcasts',
        'select' => 'SELECT id, title, host, image, audio, duration, description FROM podcasts',
        'order'  => 'ORDER BY created_at DESC, id DESC',
        'fields' => [
            'title'       => ['type' => 'string', 'max' => 200, 'required' => true, 'label' => 'Título'],
            'host'        => ['type' => 'string', 'max' => 150, 'label' => 'Apresentador'],
            'image'       => ['type' => 'url', 'label' => 'Capa'],
            'audio'       => ['type' => 'url', 'required' => true, 'label' => 'Áudio'],
            'duration'    => ['type' => 'duration', 'label' => 'Duração'],
            'description' => ['type' => 'text', 'label' => 'Descrição'],
        ],
    ],
];

function resource_list(string $name): array
{
    $r = RESOURCES[$name];
    return db()->query($r['select'] . ' ' . $r['order'])->fetchAll();
}

function resource_get(string $name, int $id): ?array
{
    $r = RESOURCES[$name];
    $idCol = $r['idCol'] ?? 'id';
    $stmt = db()->prepare($r['select'] . " WHERE $idCol = ?");
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    return $row ?: null;
}

/**
 * Valida e normaliza os campos enviados. Em atualização ($partial = true),
 * só os campos presentes são validados.
 */
function resource_validate(string $name, array $input, bool $partial): array
{
    $fields = RESOURCES[$name]['fields'];
    $clean = [];
    $errors = [];

    foreach ($fields as $key => $f) {
        if (!array_key_exists($key, $input)) {
            if (!$partial && !empty($f['required'])) {
                $errors[$key] = "{$f['label']} é obrigatório.";
            }
            continue;
        }

        $value = $input[$key];
        if (is_string($value)) {
            $value = trim($value);
        }
        if ($value === '' || $value === null) {
            if (!empty($f['required'])) {
                $errors[$key] = "{$f['label']} é obrigatório.";
            } else {
                $clean[$key] = null;
            }
            continue;
        }

        switch ($f['type']) {
            case 'string':
            case 'text':
                if (!is_string($value)) {
                    $errors[$key] = "{$f['label']} inválido.";
                    break;
                }
                $max = $f['max'] ?? 10000;
                if (mb_strlen($value) > $max) {
                    $errors[$key] = "{$f['label']} pode ter no máximo $max caracteres.";
                    break;
                }
                $clean[$key] = $value;
                break;

            case 'url':
                // Aceita link completo (http/https) ou caminho do próprio site (/uploads/...)
                $ok = is_string($value) && mb_strlen($value) <= 500 && (
                    (filter_var($value, FILTER_VALIDATE_URL) && preg_match('#^https?://#i', $value))
                    || preg_match('#^/[^\s]*$#', $value)
                );
                if (!$ok) {
                    $errors[$key] = "{$f['label']}: informe um link válido (https://...) ou envie um arquivo.";
                    break;
                }
                $clean[$key] = $value;
                break;

            case 'duration':
                if (!is_string($value) || !preg_match('/^(\d{1,2}:)?\d{1,2}:[0-5]\d$/', $value)) {
                    $errors[$key] = "{$f['label']} deve estar no formato m:ss (ex.: 3:25).";
                    break;
                }
                $clean[$key] = $value;
                break;

            case 'fk':
                $id = filter_var($value, FILTER_VALIDATE_INT);
                if ($id === false || $id <= 0) {
                    $errors[$key] = "{$f['label']} inválido.";
                    break;
                }
                $stmt = db()->prepare("SELECT 1 FROM {$f['table']} WHERE id = ?");
                $stmt->execute([$id]);
                if (!$stmt->fetchColumn()) {
                    $errors[$key] = "{$f['label']} não encontrado.";
                    break;
                }
                $clean[$key] = $id;
                break;
        }
    }

    if ($errors) {
        json_error('Verifique os campos destacados.', 422, ['fields' => $errors]);
    }
    if ($partial && !$clean) {
        json_error('Nenhum campo para atualizar.', 422);
    }
    return $clean;
}

function resource_create(string $name, array $input): array
{
    $data = resource_validate($name, $input, false);
    $table = RESOURCES[$name]['table'];
    $cols = array_keys($data);
    $sql = sprintf(
        'INSERT INTO %s (%s) VALUES (%s)',
        $table,
        implode(', ', $cols),
        implode(', ', array_fill(0, count($cols), '?'))
    );
    run_write($sql, array_values($data));
    return resource_get($name, (int) db()->lastInsertId());
}

function resource_update(string $name, int $id, array $input): array
{
    if (!resource_get($name, $id)) {
        json_error('Item não encontrado.', 404);
    }
    $data = resource_validate($name, $input, true);
    $table = RESOURCES[$name]['table'];
    $sets = implode(', ', array_map(function ($c) {
        return "$c = ?";
    }, array_keys($data)));
    run_write("UPDATE $table SET $sets WHERE id = ?", array_merge(array_values($data), [$id]));
    return resource_get($name, $id);
}

function resource_delete(string $name, int $id): void
{
    $table = RESOURCES[$name]['table'];
    $stmt = db()->prepare("DELETE FROM $table WHERE id = ?");
    $stmt->execute([$id]);
    if ($stmt->rowCount() === 0) {
        json_error('Item não encontrado.', 404);
    }
}

function run_write(string $sql, array $params): void
{
    try {
        db()->prepare($sql)->execute($params);
    } catch (PDOException $e) {
        if ($e->getCode() === '23000') {
            json_error('Já existe um item com esse nome.', 409);
        }
        throw $e;
    }
}
