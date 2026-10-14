import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import ItemsList from "../components/ItemsList";
import { useCatalog } from "../context/contexts";
import { artistCard, podcastCard, songCard, videoCard } from "../utils/cards";
import { normalize } from "../utils/media";

const Search = () => {
  const [params, setParams] = useSearchParams();
  const query = params.get("q") ?? "";
  const { artists, songs, videos, podcasts } = useCatalog();

  const results = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return null;
    const has = (...texts) => texts.some((t) => normalize(t).includes(q));
    return {
      artists: artists.filter((a) => has(a.name)).map(artistCard),
      songs: songs.filter((s) => has(s.name, s.artist)).map(songCard),
      videos: videos.filter((v) => has(v.title, v.artist)).map(videoCard),
      podcasts: podcasts.filter((p) => has(p.title, p.host)).map(podcastCard),
    };
  }, [query, artists, songs, videos, podcasts]);

  const total = results ? Object.values(results).reduce((n, list) => n + list.length, 0) : 0;

  return (
    <div className="main">
      <form className="search" role="search" onSubmit={(e) => e.preventDefault()}>
        <label htmlFor="search-input" className="visually-hidden">
          Buscar
        </label>
        <input
          id="search-input"
          type="search"
          className="search__input"
          placeholder="O que você quer ouvir? Artista, música, vídeo ou podcast"
          value={query}
          autoFocus
          onChange={(e) => setParams(e.target.value ? { q: e.target.value } : {}, { replace: true })}
        />
      </form>

      {results && total === 0 && <p className="empty">Nada encontrado para “{query}”.</p>}

      {results && (
        <>
          {results.artists.length > 0 && <ItemsList title="Artistas" items={results.artists} />}
          {results.songs.length > 0 && <ItemsList title="Músicas" items={results.songs} />}
          {results.videos.length > 0 && <ItemsList title="Vídeos" items={results.videos} />}
          {results.podcasts.length > 0 && <ItemsList title="Podcasts" items={results.podcasts} />}
        </>
      )}
    </div>
  );
};

export default Search;
