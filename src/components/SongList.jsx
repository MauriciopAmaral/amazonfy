import { useState } from "react";
import { Link } from "react-router-dom";
import Cover from "./Cover";

const INITIAL = 5;

const SongList = ({ songs, activeId }) => {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? songs : songs.slice(0, INITIAL);

  return (
    <div className="song-list">
      <ol className="song-list__items">
        {visible.map((song, index) => (
          <li key={song.id}>
            <Link to={`/song/${song.id}`} className={`song-item ${song.id === activeId ? "song-item--active" : ""}`}>
              <div className="song-item__number-album">
                <span className="song-item__number">{index + 1}</span>
                <Cover src={song.image} alt="" label={song.name} className="song-item__image" />
                <span className="song-item__name">{song.name}</span>
              </div>
              <span className="song-item__duration">{song.duration}</span>
            </Link>
          </li>
        ))}
      </ol>

      {songs.length > INITIAL && (
        <button type="button" className="song-list__see-more" onClick={() => setExpanded((v) => !v)}>
          {expanded ? "Ver menos" : `Ver mais (${songs.length - INITIAL})`}
        </button>
      )}
    </div>
  );
};

export default SongList;
