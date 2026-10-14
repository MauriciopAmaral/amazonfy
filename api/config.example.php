<?php
/**
 * Copie este arquivo para "config.php" (na mesma pasta) e preencha com os
 * dados do seu banco MySQL da Hostinger.
 *
 * Onde achar na Hostinger: hPanel → Bancos de Dados → Gerenciamento.
 * Quando o site e o banco estão na mesma conta Hostinger, o host é "localhost".
 *
 * NUNCA envie o config.php para o GitHub (ele já está no .gitignore).
 */
return [
    'db' => [
        'host'     => 'localhost',
        'port'     => 3306,
        'name'     => 'u123456789_amazunfy',   // nome do banco
        'user'     => 'u123456789_amazunfy',   // usuário do banco
        'password' => 'SUA_SENHA_AQUI',
    ],

    // E-mails que viram ADMIN ao se cadastrar/entrar (podem cadastrar conteúdo).
    'admin_emails' => [
        'seu-email@exemplo.com',
    ],

    // Tamanho máximo de upload em MB (o PHP da Hostinger também tem limite próprio).
    'max_upload_mb' => 50,

    // Origens extras liberadas por CORS (só se o front ficar em OUTRO domínio).
    // Ex.: ['http://localhost:5173']
    'cors_origins' => [],

    // true = mostra detalhes de erro do banco nas respostas (use só em testes).
    'debug' => false,
];
