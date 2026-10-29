export function TopBar({ boardCount, fullAppUrl, active }: { boardCount: number; fullAppUrl: string; active?: "canvas" }) {
  return (
    <header className={`topbar${active === "canvas" ? " topbar--wide" : ""}`}>
      <div className="topbar__inner">
        <a className="wordmark" href="./" aria-label="Archipedia demo home">
          <span className="wordmark__name">archipedia</span>
          <span className="tag">Demo</span>
        </a>
        <nav className="topbar__nav" aria-label="Demo">
          <a href="./?view=canvas" aria-current={active === "canvas" ? "page" : undefined}>Canvas</a>
          <a href="./#index">Index</a>
          <a href="./#board">
            Board <span className="count">{String(boardCount).padStart(2, "0")}</span>
          </a>
          <a className="ghost" href={fullAppUrl} target="_blank" rel="noreferrer">
            Source
          </a>
        </nav>
      </div>
    </header>
  );
}
