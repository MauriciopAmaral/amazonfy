import { videoThumbnail } from "./media";

// Converte os itens do catálogo para o formato dos cards (SingleItem)
export const artistCard = (a) => ({
  key: `artist-${a.id}`,
  to: `/artist/${a.id}`,
  image: a.image,
  title: a.name,
  subtitle: "Artista",
  shape: "round",
});

export const songCard = (s) => ({
  key: `song-${s.id}`,
  to: `/song/${s.id}`,
  image: s.image,
  title: s.name,
  subtitle: s.artist,
  shape: "square",
});

export const videoCard = (v) => ({
  key: `video-${v.id}`,
  to: `/video/${v.id}`,
  image: videoThumbnail(v),
  title: v.title,
  subtitle: v.artist || "Vídeo",
  shape: "wide",
});

export const podcastCard = (p) => ({
  key: `podcast-${p.id}`,
  to: `/podcast/${p.id}`,
  image: p.image,
  title: p.title,
  subtitle: p.host || "Podcast",
  shape: "square",
});
