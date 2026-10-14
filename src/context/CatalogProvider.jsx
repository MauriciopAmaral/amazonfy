import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import { CatalogContext } from "./contexts";

const shuffled = (list) => {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const indexBy = (list, key) =>
  list.reduce((acc, item) => {
    acc[item[key]] = item;
    return acc;
  }, {});

export default function CatalogProvider({ children }) {
  const [data, setData] = useState({ artists: [], songs: [], videos: [], podcasts: [] });
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [error, setError] = useState(null);

  const load = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setStatus("loading");
    try {
      const catalog = await api.catalog();
      setData({
        artists: catalog.artists ?? [],
        songs: catalog.songs ?? [],
        videos: catalog.videos ?? [],
        podcasts: catalog.podcasts ?? [],
      });
      setError(null);
      setStatus("ready");
    } catch (err) {
      setError(err);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const value = useMemo(() => {
    const songsByArtist = {};
    for (const song of data.songs) {
      (songsByArtist[song.artist_id] ??= []).push(song);
    }
    return {
      ...data,
      status,
      error,
      reload: load,
      artistsById: indexBy(data.artists, "id"),
      songsById: indexBy(data.songs, "id"),
      videosById: indexBy(data.videos, "id"),
      podcastsById: indexBy(data.podcasts, "id"),
      songsByArtist,
      // Ordem aleatória para a Home (muda a cada carregamento, como no projeto original)
      featured: {
        artists: shuffled(data.artists),
        songs: shuffled(data.songs),
      },
    };
  }, [data, status, error, load]);

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}
