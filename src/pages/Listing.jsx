import ItemsList from "../components/ItemsList";
import { useCatalog } from "../context/contexts";
import { artistCard, podcastCard, songCard, videoCard } from "../utils/cards";

// Páginas "Mostrar tudo": Artistas, Músicas, Vídeos e Podcasts
const CONFIG = {
  artists: { title: "Artistas", map: artistCard, empty: "Nenhum artista cadastrado ainda." },
  songs: { title: "Músicas", map: songCard, empty: "Nenhuma música cadastrada ainda." },
  videos: { title: "Vídeos", map: videoCard, empty: "Nenhum vídeo cadastrado ainda." },
  podcasts: { title: "Podcasts", map: podcastCard, empty: "Nenhum podcast cadastrado ainda." },
};

const Listing = ({ type }) => {
  const catalog = useCatalog();
  const { title, map, empty } = CONFIG[type];

  return (
    <div className="main">
      <ItemsList title={title} items={catalog[type].map(map)} emptyText={empty} />
    </div>
  );
};

export default Listing;
