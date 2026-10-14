import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCirclePlay } from "@fortawesome/free-solid-svg-icons";
import Cover from "./Cover";

const SingleItem = ({ to, image, title, subtitle, shape = "round" }) => (
  <Link to={to} className="single-item">
    <div className="single-item__media">
      <Cover src={image} alt={`Imagem de ${title}`} label={title} shape={shape} className="single-item__cover" />
      <FontAwesomeIcon className="single-item__icon" icon={faCirclePlay} aria-hidden="true" />
    </div>

    <div className="single-item__texts">
      <p className="single-item__title single-item__2lines">{title}</p>
      {subtitle && <p className="single-item__type">{subtitle}</p>}
    </div>
  </Link>
);

export default SingleItem;
