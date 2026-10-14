import { Link } from "react-router-dom";

export const Loading = ({ text = "Carregando..." }) => (
  <div className="status" role="status" aria-live="polite">
    <span className="status__spinner" aria-hidden="true" />
    <p>{text}</p>
  </div>
);

export const ErrorState = ({ error, onRetry, title = "Algo deu errado" }) => (
  <div className="status status--error" role="alert">
    <h2>{title}</h2>
    <p>{error?.message || "Não foi possível carregar o conteúdo."}</p>
    {onRetry && (
      <button type="button" className="btn btn--primary" onClick={() => onRetry()}>
        Tentar de novo
      </button>
    )}
  </div>
);

export const NotFoundState = ({ title = "Não encontrado", text, backTo = "/", backLabel = "Voltar ao início" }) => (
  <div className="status">
    <h2>{title}</h2>
    {text && <p>{text}</p>}
    <Link to={backTo} className="btn btn--ghost">
      {backLabel}
    </Link>
  </div>
);

export const EmptyState = ({ text }) => <p className="empty">{text}</p>;
