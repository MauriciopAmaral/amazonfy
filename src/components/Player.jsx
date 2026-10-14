import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBackwardStep,
  faCirclePause,
  faCirclePlay,
  faForwardStep,
  faVolumeHigh,
  faVolumeXmark,
} from "@fortawesome/free-solid-svg-icons";
import { formatTime, parseDuration } from "../utils/media";

const VOLUME_KEY = "amazunfy:volume";
const readVolume = () => {
  try {
    const raw = localStorage.getItem(VOLUME_KEY);
    const v = Number(raw);
    return raw !== null && Number.isFinite(v) && v >= 0 && v <= 1 ? v : 0.8;
  } catch {
    return 0.8;
  }
};

/**
 * Player de áudio. Use `key={id}` no componente pai para reiniciar a cada faixa.
 * - onPrev / onNext: funções para trocar de faixa (o "próximo" também é chamado
 *   automaticamente quando a faixa termina).
 * - meta: { title, artist, artwork } para os controles da tela de bloqueio do celular.
 */
const Player = ({ src, durationHint, autoPlay = false, onPrev, onNext, meta }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(parseDuration(durationHint));
  const [volume, setVolume] = useState(readVolume);
  const [muted, setMuted] = useState(false);
  const [loadError, setLoadError] = useState(false);

  // Inicia automaticamente quando veio de "próxima faixa"
  useEffect(() => {
    if (autoPlay) audioRef.current?.play().catch(() => {});
  }, [autoPlay]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume;
    audioRef.current.muted = muted;
    try {
      localStorage.setItem(VOLUME_KEY, String(volume));
    } catch {
      /* armazenamento indisponível — ignora */
    }
  }, [volume, muted]);

  // Controles do sistema (tela de bloqueio / fones bluetooth)
  useEffect(() => {
    if (!("mediaSession" in navigator) || !meta) return;
    navigator.mediaSession.metadata = new window.MediaMetadata({
      title: meta.title,
      artist: meta.artist,
      album: "Amazunfy",
      artwork: meta.artwork ? [{ src: meta.artwork, sizes: "300x300" }] : [],
    });
    const handlers = {
      play: () => audioRef.current?.play(),
      pause: () => audioRef.current?.pause(),
      previoustrack: onPrev,
      nexttrack: onNext,
    };
    Object.entries(handlers).forEach(([action, fn]) => {
      try {
        navigator.mediaSession.setActionHandler(action, fn || null);
      } catch {
        /* ação não suportada */
      }
    });
    return () => {
      Object.keys(handlers).forEach((action) => {
        try {
          navigator.mediaSession.setActionHandler(action, null);
        } catch {
          /* ignora */
        }
      });
    };
  }, [meta, onPrev, onNext]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch(() => setLoadError(true));
    } else {
      audio.pause();
    }
  };

  const seek = (e) => {
    const value = Number(e.target.value);
    if (audioRef.current) audioRef.current.currentTime = value;
    setCurrent(value);
  };

  const progress = duration > 0 ? (current / duration) * 100 : 0;

  return (
    <div className="player">
      <div className="player__controllers">
        <button type="button" className="player__icon" onClick={onPrev} disabled={!onPrev} aria-label="Faixa anterior">
          <FontAwesomeIcon icon={faBackwardStep} />
        </button>

        <button
          type="button"
          className="player__icon player__icon--play"
          onClick={togglePlay}
          aria-label={isPlaying ? "Pausar" : "Tocar"}
        >
          <FontAwesomeIcon icon={isPlaying ? faCirclePause : faCirclePlay} />
        </button>

        <button type="button" className="player__icon" onClick={onNext} disabled={!onNext} aria-label="Próxima faixa">
          <FontAwesomeIcon icon={faForwardStep} />
        </button>
      </div>

      <div className="player__progress">
        <span className="player__time">{formatTime(current)}</span>
        <input
          type="range"
          className="player__bar"
          min="0"
          max={duration || 0}
          step="0.1"
          value={Math.min(current, duration || 0)}
          onChange={seek}
          style={{ "--_progress": `${progress}%` }}
          aria-label="Posição da faixa"
          disabled={!duration}
        />
        <span className="player__time">{formatTime(duration)}</span>
      </div>

      <div className="player__volume">
        <button
          type="button"
          className="player__icon player__icon--small"
          onClick={() => setMuted((m) => !m)}
          aria-label={muted ? "Ativar som" : "Silenciar"}
        >
          <FontAwesomeIcon icon={muted || volume === 0 ? faVolumeXmark : faVolumeHigh} />
        </button>
        <input
          type="range"
          className="player__bar player__bar--volume"
          min="0"
          max="1"
          step="0.01"
          value={muted ? 0 : volume}
          onChange={(e) => {
            setVolume(Number(e.target.value));
            setMuted(false);
          }}
          style={{ "--_progress": `${(muted ? 0 : volume) * 100}%` }}
          aria-label="Volume"
        />
      </div>

      {loadError && <p className="player__error">Não foi possível tocar este áudio. O arquivo pode estar indisponível.</p>}

      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onPlay={() => {
          setIsPlaying(true);
          setLoadError(false);
        }}
        onPause={() => setIsPlaying(false)}
        onLoadedMetadata={(e) => {
          if (Number.isFinite(e.currentTarget.duration)) setDuration(e.currentTarget.duration);
        }}
        onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
        onEnded={() => {
          setIsPlaying(false);
          onNext?.();
        }}
        onError={() => setLoadError(true)}
      />
    </div>
  );
};

export default Player;
