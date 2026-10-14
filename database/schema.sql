-- =============================================================
-- Amazunfy — estrutura do banco (MySQL 5.7+ / MariaDB 10.3+)
-- Importe este arquivo no phpMyAdmin da Hostinger ANTES do seed.sql
-- =============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS songs;
DROP TABLE IF EXISTS videos;
DROP TABLE IF EXISTS podcasts;
DROP TABLE IF EXISTS artists;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE artists (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name       VARCHAR(150) NOT NULL,
  image      VARCHAR(500) NULL,
  banner     VARCHAR(500) NULL,
  bio        TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_artists_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE songs (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  artist_id  INT UNSIGNED NOT NULL,
  name       VARCHAR(200) NOT NULL,
  image      VARCHAR(500) NULL,
  audio      VARCHAR(500) NOT NULL,
  duration   VARCHAR(8)   NULL COMMENT 'formato m:ss',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_songs_artist (artist_id),
  CONSTRAINT fk_songs_artist FOREIGN KEY (artist_id)
    REFERENCES artists (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE videos (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  artist_id   INT UNSIGNED NULL,
  title       VARCHAR(200) NOT NULL,
  url         VARCHAR(500) NOT NULL COMMENT 'link do YouTube ou arquivo .mp4',
  thumbnail   VARCHAR(500) NULL,
  description TEXT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_videos_artist (artist_id),
  CONSTRAINT fk_videos_artist FOREIGN KEY (artist_id)
    REFERENCES artists (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE podcasts (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  title       VARCHAR(200) NOT NULL,
  host        VARCHAR(150) NULL COMMENT 'apresentador / programa',
  image       VARCHAR(500) NULL,
  audio       VARCHAR(500) NOT NULL,
  duration    VARCHAR(8)   NULL COMMENT 'formato m:ss ou h:mm:ss',
  description TEXT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE users (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name          VARCHAR(120) NOT NULL,
  email         VARCHAR(190) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('user','admin') NOT NULL DEFAULT 'user',
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
