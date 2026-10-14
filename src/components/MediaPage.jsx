import { useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Cover from "./Cover";
import Player from "./Player";

/**
 * Tela de reprodução usada por Música e Podcast.
 * `prevPath` / `nextPath` definem a fila; ao terminar a faixa vai para a próxima.
 */
const MediaPage = ({ id, image, title, subtitle, sideImage, audio, duration, prevPath, nextPath, metaArtist, children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const autoPlay = Boolean(location.state?.autoplay);

  const goPrev = useCallback(
    () => prevPath && navigate(prevPath, { state: { autoplay: true } }),
    [navigate, prevPath]
  );
  const goNext = useCallback(
    () => nextPath && navigate(nextPath, { state: { autoplay: true } }),
    [navigate, nextPath]
  );
  const meta = useMemo(() => ({ title, artist: metaArtist, artwork: image }), [title, metaArtist, image]);

  return (
    <section className="song">
      <div className="song__container">
        <Cover src={image} alt={`Capa de ${title}`} label={title} className="song__image" />
      </div>

      <div className="song__bar">
        <div className="song__side">{sideImage}</div>

        <Player
          key={id}
          src={audio}
          durationHint={duration}
          autoPlay={autoPlay}
          onPrev={prevPath ? goPrev : undefined}
          onNext={nextPath ? goNext : undefined}
          meta={meta}
        />

        <div className="song__info">
          <p className="song__name">{title}</p>
          <div className="song__subtitle">{subtitle}</div>
        </div>
      </div>

      {children && <div className="song__extra">{children}</div>}
    </section>
  );
};

export default MediaPage;
