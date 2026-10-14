import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import MediaPage from "../components/MediaPage";
import Cover from "../components/Cover";
import SongList from "../components/SongList";
import { NotFoundState } from "../components/StatusMessage";
import { useCatalog } from "../context/contexts";

const Song = () => {
  const { id } = useParams();
  const { songsById, artistsById, songsByArtist, songs } = useCatalog();
  const song = songsById[id];

  // Fila: músicas do mesmo artista; se ele só tiver uma, sorteia outra do catálogo.
  const { prevPath, nextPath } = useMemo(() => {
    if (!song) return {};
    const queue = songsByArtist[song.artist_id] ?? [song];
    if (queue.length > 1) {
      const i = queue.findIndex((s) => s.id === song.id);
      return {
        prevPath: `/song/${queue[(i - 1 + queue.length) % queue.length].id}`,
        nextPath: `/song/${queue[(i + 1) % queue.length].id}`,
      };
    }
    const others = songs.filter((s) => s.id !== song.id);
    if (!others.length) return {};
    const random = () => `/song/${others[Math.floor(Math.random() * others.length)].id}`;
    return { prevPath: random(), nextPath: random() };
  }, [song, songsByArtist, songs]);

  if (!song) {
    return <NotFoundState title="Música não encontrada" backTo="/songs" backLabel="Ver todas as músicas" />;
  }

  const artist = artistsById[song.artist_id];
  const artistSongs = songsByArtist[song.artist_id] ?? [];

  return (
    <MediaPage
      id={song.id}
      image={song.image}
      title={song.name}
      audio={song.audio}
      duration={song.duration}
      prevPath={prevPath}
      nextPath={nextPath}
      metaArtist={song.artist}
      subtitle={<Link to={`/artist/${song.artist_id}`}>{song.artist}</Link>}
      sideImage={
        artist && (
          <Link to={`/artist/${artist.id}`} title={`Ver ${artist.name}`}>
            <Cover src={artist.image} alt={`Foto de ${artist.name}`} label={artist.name} shape="round" className="song__artist-image" />
          </Link>
        )
      }
    >
      {artistSongs.length > 1 && (
        <>
          <h2>Mais de {song.artist}</h2>
          <SongList songs={artistSongs} activeId={song.id} />
        </>
      )}
    </MediaPage>
  );
};

export default Song;
