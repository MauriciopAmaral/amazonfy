import { Link, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCirclePlay } from "@fortawesome/free-solid-svg-icons";
import SongList from "../components/SongList";
import ItemsList from "../components/ItemsList";
import { EmptyState, NotFoundState } from "../components/StatusMessage";
import { useCatalog } from "../context/contexts";
import { videoCard } from "../utils/cards";

const Artist = () => {
  const { id } = useParams();
  const { artistsById, songsByArtist, videos } = useCatalog();
  const artist = artistsById[id];

  if (!artist) {
    return <NotFoundState title="Artista não encontrado" backTo="/artists" backLabel="Ver todos os artistas" />;
  }

  const songs = songsByArtist[artist.id] ?? [];
  const artistVideos = videos.filter((v) => v.artist_id === artist.id);
  const bannerImage = artist.banner || artist.image;
  const background = bannerImage
    ? `linear-gradient(to bottom, hsl(0 0% 0% / 15%), hsl(0 0% 0% / 65%)), url("${bannerImage}")`
    : undefined;

  return (
    <section className="artist">
      <div className="artist__header" style={{ backgroundImage: background }}>
        <div>
          <p className="artist__kicker">Artista</p>
          <h1 className="artist__title">{artist.name}</h1>
          <p className="artist__meta">
            {songs.length} {songs.length === 1 ? "música" : "músicas"}
          </p>
        </div>

        {songs.length > 0 && (
          <Link
            to={`/song/${songs[0].id}`}
            state={{ autoplay: true }}
            className="artist__play"
            aria-label={`Tocar ${artist.name}`}
          >
            <FontAwesomeIcon icon={faCirclePlay} />
          </Link>
        )}
      </div>

      <div className="artist__body">
        <h2>Populares</h2>
        {songs.length ? <SongList songs={songs} /> : <EmptyState text="Este artista ainda não tem músicas." />}

        {artistVideos.length > 0 && <ItemsList title="Vídeos" items={artistVideos.map(videoCard)} />}

        {artist.bio && (
          <div className="artist__bio">
            <h2>Sobre</h2>
            <p>{artist.bio}</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Artist;
