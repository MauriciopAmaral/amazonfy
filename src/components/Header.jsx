import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faRightFromBracket, faScrewdriverWrench } from "@fortawesome/free-solid-svg-icons";
import logo from "../assets/logo/logoamazunfy2.png";
import { useAuth } from "../context/contexts";

const NAV = [
  { to: "/", label: "Início", end: true },
  { to: "/artists", label: "Artistas" },
  { to: "/songs", label: "Músicas" },
  { to: "/videos", label: "Vídeos" },
  { to: "/podcasts", label: "Podcasts" },
];

const Header = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e) => {
      if (e.type === "keydown" ? e.key === "Escape" : !menuRef.current?.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [menuOpen]);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    navigate("/login");
  };

  return (
    <header className="header">
      <div className="header__top">
        <Link to="/" className="header__brand" aria-label="Amazunfy — início">
          <img width="36" height="36" src={logo} alt="" />
          <span>Amazunfy</span>
        </Link>

        {user && (
          <nav className="header__nav" aria-label="Principal">
            {NAV.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className="header__link">
                {item.label}
              </NavLink>
            ))}
          </nav>
        )}

        {user && (
          <div className="header__actions">
            <NavLink to="/search" className="header__icon-btn" aria-label="Buscar" title="Buscar">
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </NavLink>

            <div className="user-menu" ref={menuRef}>
              <button
                type="button"
                className="user-menu__button"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((v) => !v)}
                title={user.name}
              >
                {user.name.trim()[0]?.toUpperCase()}
              </button>
              {menuOpen && (
                <div className="user-menu__panel" role="menu">
                  <p className="user-menu__name">{user.name}</p>
                  <p className="user-menu__email">{user.email}</p>
                  {isAdmin && (
                    <Link role="menuitem" to="/admin" className="user-menu__item" onClick={() => setMenuOpen(false)}>
                      <FontAwesomeIcon icon={faScrewdriverWrench} /> Painel admin
                    </Link>
                  )}
                  <button role="menuitem" type="button" className="user-menu__item" onClick={handleLogout}>
                    <FontAwesomeIcon icon={faRightFromBracket} /> Sair
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {user && (
        <nav className="header__nav header__nav--mobile" aria-label="Principal (celular)">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className="header__link">
              {item.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
};

export default Header;
