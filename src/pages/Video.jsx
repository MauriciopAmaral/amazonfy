import { Link, useParams } from "react-router-dom";
import ItemsList from "../components/ItemsList";
import { NotFoundState } from "../components/StatusMessage";
import { useCatalog } from "../context/contexts";
import { videoCard } from "../utils/cards";
import { getYouTubeId, videoThumbnail } from "../utils/media";

const Video = () => {
  const { id } = useParams();
  const { videos, videosById } = useCatalog();
  const video = videosById[id];

  if (!video) {
    return <NotFoundState title="Vídeo não encontrado" backTo="/videos" backLabel="Ver todos os vídeos" />;
  }

  const youtubeId = getYouTubeId(video.url);
  const others = videos.filter((v) => v.id !== video.id);

  return (
    <section className="video">
      <div className="video__frame">
        {youtubeId ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <video key={video.id} src={video.url} poster={videoThumbnail(video) || undefined} controls playsInline preload="metadata">
            Seu navegador não suporta vídeo.
          </video>
        )}
      </div>

      <div className="video__info">
        <h1 className="video__title">{video.title}</h1>
        {video.artist && (
          <Link to={`/artist/${video.artist_id}`} className="video__artist">
            {video.artist}
          </Link>
        )}
        {video.description && <p className="video__description">{video.description}</p>}
      </div>

      {others.length > 0 && (
        <div className="video__more">
          <ItemsList title="Mais vídeos" items={others.map(videoCard)} />
        </div>
      )}
    </section>
  );
};

export default Video;
