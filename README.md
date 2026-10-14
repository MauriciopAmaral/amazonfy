# Amazunfy — O Som Que Te Move

Plataforma de música da cidade: artistas, músicas, vídeos e podcasts, com login e painel admin para cadastrar conteúdo.

- **Front-end:** React 19 + Vite + React Router
- **API:** PHP 7.4+ (pasta `api/`), roda em qualquer plano da Hostinger
- **Banco:** MySQL / MariaDB (Hostinger)

```
amazunfy/
├── api/                    API PHP (vai para public_html/api)
│   ├── config.example.php  modelo de configuração → copie para config.php
│   └── ...
├── database/
│   ├── schema.sql          cria as tabelas
│   └── seed.sql            dados iniciais (20 artistas, 200 músicas, exemplos)
├── public/                 .htaccess, favicon, proteção da pasta uploads
├── scripts/package-hostinger.mjs
└── src/                    código React
```

---

## 1. Publicar na Hostinger (passo a passo)

### 1.1 Criar o banco
1. hPanel → **Bancos de Dados → Gerenciamento** → crie um banco MySQL (anote nome, usuário e senha).
2. Clique em **Entrar no phpMyAdmin**, selecione o banco e use **Importar**:
   1. `database/schema.sql`
   2. `database/seed.sql`

> ⚠️ O `schema.sql` **apaga** as tabelas se elas já existirem. Use só na primeira instalação.

### 1.2 Gerar os arquivos do site
No seu computador (precisa do Node.js 18+):

```bash
npm install
npm run build:hostinger
```

Isso cria a pasta `deploy/public_html` com o site + a API.

### 1.3 Enviar
1. Compacte **o conteúdo** de `deploy/public_html` em um `.zip`.
2. hPanel → **Gerenciador de Arquivos** → abra `public_html` → envie o zip → **Extrair**.
   (Confira que os arquivos ocultos `.htaccess` foram junto.)

### 1.4 Configurar a API (só na primeira vez)
No Gerenciador de Arquivos, dentro de `public_html/api/`:
1. Copie `config.example.php` → `config.php`.
2. Edite `config.php` com os dados do banco e coloque **o seu e-mail** em `admin_emails`.

O `host` normalmente é `localhost`. Nas próximas atualizações o `config.php` não é sobrescrito.

### 1.5 Testar
- `https://seudominio.com/api/health` → deve mostrar `{"ok":true,...}`
- Abra o site, clique em **Registre-se** e cadastre-se com o e-mail que você pôs em `admin_emails`.
  Você verá **Painel admin** no menu do seu avatar.
- Ative o SSL e “Forçar HTTPS” em hPanel → **Segurança → SSL**.

---

## 2. Rodar no seu computador (desenvolvimento)

Precisa de **Node.js 18+**, **PHP 7.4+** (com `pdo_mysql`) e um MySQL local (XAMPP, Laragon, Docker…)
ou o banco remoto da Hostinger (libere seu IP em hPanel → Bancos de Dados → **MySQL Remoto**).

```bash
npm install
cp api/config.example.php api/config.php   # edite com os dados do banco
npm run api    # terminal 1 → API PHP em http://127.0.0.1:8000
npm run dev    # terminal 2 → site em http://localhost:5173
```

O Vite repassa `/api` para o PHP automaticamente.

---

## 3. Cadastrar o conteúdo da cidade

Entre como admin → avatar → **Painel admin**. Em cada aba (Artistas, Músicas, Vídeos, Podcasts) você pode
cadastrar, editar e excluir. Os campos de mídia aceitam **link** ou **envio de arquivo**:

| Tipo     | Formatos aceitos                  |
|----------|-----------------------------------|
| Imagens  | jpg, png, webp, gif               |
| Áudio    | mp3, m4a, ogg, wav, aac           |
| Vídeo    | link do YouTube **ou** mp4/webm   |

- A duração da música/podcast é preenchida sozinha ao enviar o áudio.
- Os arquivos ficam em `public_html/uploads/` (a pasta bloqueia execução de scripts).
- Limite de upload: `max_upload_mb` no `config.php` **e** o limite do PHP da Hostinger
  (hPanel → Avançado → **Configuração do PHP** → `upload_max_filesize` e `post_max_size`).
- Para vídeos, prefira YouTube: não gasta espaço nem banda da hospedagem.

> Os dados de exemplo (artistas nacionais, vídeos e podcasts de teste) podem ser apagados pelo painel.
> Excluir um artista também exclui as músicas dele.

---

## 4. API

| Método | Rota                        | Acesso   |
|--------|-----------------------------|----------|
| GET    | `/api/health`               | público  |
| GET    | `/api/catalog`              | público  |
| GET    | `/api/{artists\|songs\|videos\|podcasts}[/{id}]` | público |
| POST   | `/api/auth/register`, `/api/auth/login`, `/api/auth/logout` | público |
| GET    | `/api/auth/me`              | público  |
| POST   | `/api/{recurso}`            | admin    |
| PUT    | `/api/{recurso}/{id}`       | admin    |
| DELETE | `/api/{recurso}/{id}`       | admin    |
| POST   | `/api/upload`               | admin    |

Segurança: senhas com `password_hash`, sessão em cookie `HttpOnly`/`SameSite=Lax`, consultas preparadas (PDO),
cabeçalho obrigatório `X-Requested-With` contra CSRF, validação de tipo real dos arquivos enviados e
`config.php` bloqueado para acesso direto.

---

## 5. Problemas comuns

| Sintoma | Solução |
|---------|---------|
| “Arquivo api/config.php não encontrado” | Faça o passo 1.4. |
| “Não foi possível conectar ao banco” | Confira nome/usuário/senha no `config.php`. Ponha `'debug' => true` temporariamente para ver o detalhe. |
| Página em branco / 404 ao recarregar `/artist/1` | O `.htaccess` não foi enviado para `public_html`. |
| “A API respondeu em um formato inesperado” | A pasta `api/` não está em `public_html/api`. |
| Upload falha com arquivo grande | Aumente `upload_max_filesize` e `post_max_size` na Configuração do PHP. |
| Música não toca | O link do áudio está fora do ar. Envie o arquivo pelo painel. |
