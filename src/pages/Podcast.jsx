import { Link, useParams } from "react-router-dom";
import MediaPage from "../components/MediaPage";
import { NotFoundState } from "../components/StatusMessage";
import { useCatalog } from "../context/contexts";
import Cover from "../components/Cover";

const Podcast = () => {
  const { id } = useParams();
  const { podcasts, podcastsById } = useCatalog();
  const podcast = podcastsById[id];

  if (!podcast) {
    return <NotFoundState title="Podcast não encontrado" backTo="/podcasts" backLabel="Ver todos os podcasts" />;
  }

  const i = podcasts.findIndex((p) => p.id === podcast.id);
  const n = podcasts.length;
  const prevPath = n > 1 ? `/podcast/${podcasts[(i - 1 + n) % n].id}` : undefined;
  const nextPath = n > 1 ? `/podcast/${podcasts[(i + 1) % n].id}` : undefined;
  const others = podcasts.filter((p) => p.id !== podcast.id);

  return (
    <MediaPage
      id={podcast.id}
      image={podcast.image}
      title={podcast.title}
      audio={podcast.audio}
      duration={podcast.duration}
      prevPath={prevPath}
      nextPath={nextPath}
      metaArtist={podcast.host || "Podcast"}
      subtitle={podcast.host || "Podcast"}
    >
      {podcast.description && (
        <div className="song__description">
          <h2>Sobre o episódio</h2>
          <p>{podcast.description}</p>
        </div>
      )}

      {others.length > 0 && (
        <>
          <h2>Outros episódios</h2>
          <ul className="song-list__items">
            {others.map((p) => (
              <li key={p.id}>
                <Link to={`/podcast/${p.id}`} className="song-item">
                  <div className="song-item__number-album">
                    <Cover src={p.image} alt="" label={p.title} className="song-item__image" />
                    <span className="song-item__name">
                      {p.title}
                      {p.host && <small> · {p.host}</small>}
                    </span>
                  </div>
                  <span className="song-item__duration">{p.duration}</span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </MediaPage>
  );
};

export default Podcast;
