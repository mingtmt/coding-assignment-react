import { NavLink, Outlet } from "react-router-dom";
import { useThemeStore } from "../../store/theme.store";
import styles from "./DefaultLayout.module.css";

const Header = () => {
  const { theme, toggle } = useThemeStore();

  return (
    <header className={styles['header']}>
      <div className={styles['headerInner']}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <NavLink
            to="/"
            style={{
              textDecoration: "none",
              fontWeight: 800,
              fontSize: 20,
              color: "var(--text)",
              letterSpacing: ".2px",
            }}
          >
            Tickets
          </NavLink>
        </div>

        <button className="ghost" onClick={toggle} aria-label="Toggle theme">
          {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
        </button>
      </div>
    </header>
  );
};

const Footer = () => {
  return (
    <footer
      className={styles['footer']}
    >
      <div
        className={styles['footerInner']}
      >
        <span>
          © {new Date().getFullYear()}{" "}
          <strong style={{ color: "var(--text)" }}>Minh Bui</strong>
        </span>
        <a
          href="https://github.com/mingtmt"
          target="_blank"
          rel="noreferrer"
          style={{ color: "var(--text)", textDecoration: "none" }}
        >
          github.com/mingtmt
        </a>
      </div>
    </footer>
  );
};

export const DefaultLayout = () => {
  return (
    <div className={styles['appShell']}>
      <Header />
      <main className={styles['appMain']}>
        <div className={styles['appContainer']}>
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
};
