import { Link } from "react-router-dom";
import SingleItem from "./SingleItem";
import { EmptyState } from "./StatusMessage";

/**
 * Lista de cards. Na Home (com `seeAllPath`) vira uma fileira com rolagem
 * horizontal; nas páginas de "Mostrar tudo" vira uma grade completa.
 */
const ItemsList = ({ title, items, seeAllPath, limit, emptyText = "Nada por aqui ainda." }) => {
  const visible = limit ? items.slice(0, limit) : items;
  const isRow = Boolean(seeAllPath);

  return (
    <section className="item-list">
      <div className="item-list__header">
        <h2>{title}</h2>
        {seeAllPath && items.length > 0 && (
          <Link to={seeAllPath} className="item-list__link">
            Mostrar tudo
          </Link>
        )}
      </div>

      {visible.length === 0 ? (
        <EmptyState text={emptyText} />
      ) : (
        <div className={`item-list__container ${isRow ? "item-list__container--row" : ""}`}>
          {visible.map(({ key, ...item }) => (
            <SingleItem key={key} {...item} />
          ))}
        </div>
      )}
    </section>
  );
};

export default ItemsList;
