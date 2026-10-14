import ItemsList from "../components/ItemsList";
import { useAuth, useCatalog } from "../context/contexts";
import { artistCard, podcastCard, songCard, videoCard } from "../utils/cards";

const ROW_LIMIT = 12;

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
};

const Home = () => {
  const { user } = useAuth();
  const { featured, videos, podcasts } = useCatalog();
  const firstName = user?.name?.split(" ")[0];

  return (
    <div className="main">
      <h1 className="main__title">
        {greeting()}
        {firstName ? `, ${firstName}` : ""}!
      </h1>

      <ItemsList
        title="Artistas da cidade"
        items={featured.artists.map(artistCard)}
        seeAllPath="/artists"
        limit={ROW_LIMIT}
        emptyText="Nenhum artista cadastrado ainda."
      />
      <ItemsList
        title="Músicas"
        items={featured.songs.map(songCard)}
        seeAllPath="/songs"
        limit={ROW_LIMIT}
        emptyText="Nenhuma música cadastrada ainda."
      />
      <ItemsList
        title="Vídeos"
        items={videos.map(videoCard)}
        seeAllPath="/videos"
        limit={ROW_LIMIT}
        emptyText="Nenhum vídeo cadastrado ainda."
      />
      <ItemsList
        title="Podcasts"
        items={podcasts.map(podcastCard)}
        seeAllPath="/podcasts"
        limit={ROW_LIMIT}
        emptyText="Nenhum podcast cadastrado ainda."
      />
    </div>
  );
};

export default Home;
