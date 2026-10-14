/** "3:25" ou "1:02:10" → segundos */
export const parseDuration = (text) => {
  if (!text) return 0;
  return String(text)
    .split(":")
    .map(Number)
    .reduce((acc, n) => acc * 60 + (Number.isFinite(n) ? n : 0), 0);
};

/** segundos → "03:25" (ou "1:02:10" acima de uma hora) */
export const formatTime = (seconds) => {
  if (!Number.isFinite(seconds) || seconds < 0) seconds = 0;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const pad = (n) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
};

/** segundos → "3:25" (formato salvo no banco) */
export const toDurationString = (seconds) => {
  const total = Math.round(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${m}:${String(s).padStart(2, "0")}`;
};

/** Extrai o ID de um link do YouTube (watch, youtu.be, shorts, embed). */
export const getYouTubeId = (url) => {
  if (!url) return null;
  const match = String(url).match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/
  );
  return match ? match[1] : null;
};

export const videoThumbnail = (video) => {
  if (video.thumbnail) return video.thumbnail;
  const yt = getYouTubeId(video.url);
  return yt ? `https://i.ytimg.com/vi/${yt}/hqdefault.jpg` : null;
};

/** Remove acentos e deixa minúsculo — usado na busca. */
export const normalize = (text) =>
  String(text ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

/** Lê a duração de um arquivo de áudio/vídeo (URL) pelo navegador. */
export const detectMediaDuration = (src) =>
  new Promise((resolve) => {
    const el = document.createElement("audio");
    const done = (value) => {
      el.removeAttribute("src");
      resolve(value);
    };
    el.preload = "metadata";
    el.onloadedmetadata = () => done(Number.isFinite(el.duration) ? el.duration : null);
    el.onerror = () => done(null);
    setTimeout(() => done(null), 15000);
    el.src = src;
  });
