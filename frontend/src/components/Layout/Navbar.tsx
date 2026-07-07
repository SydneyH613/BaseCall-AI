import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { loggedOut } from "../../store/slices/authSlice";

export function Navbar() {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  function handleLogout() {
    dispatch(loggedOut());
    navigate("/");
  }

  return (
    <header
      style={{
        borderBottom: "1px solid var(--border)",
        background: "var(--bg-elevated)",
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 64,
        }}
      >
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
            fontWeight: 700,
            fontSize: 18,
          }}
        >
          <span
            aria-hidden
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: "var(--accent)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#04231f",
              fontFamily: "var(--font-mono)",
              fontSize: 13,
              fontWeight: 800,
            }}
          >
            BC
          </span>
          BaseCall AI
        </Link>

        <nav style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <Link to="/analyze" style={{ textDecoration: "none", fontWeight: 500 }}>
            Analyze
          </Link>
          {user && (
            <Link to="/history" style={{ textDecoration: "none", fontWeight: 500 }}>
              History
            </Link>
          )}
          {user ? (
            <>
              <span className="text-muted" style={{ fontSize: 14 }}>
                {user.email}
              </span>
              <button className="btn btn-secondary" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ textDecoration: "none", fontWeight: 500 }}>
                Log in
              </Link>
              <Link to="/register" className="btn">
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
