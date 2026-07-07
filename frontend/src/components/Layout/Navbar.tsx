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
    <header style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-elevated)" }}>
      <div className="container row-between" style={{ height: 62 }}>
        <Link to="/" className="brand">
          <span className="brand-mark" aria-hidden>
            BC
          </span>
          BaseCall AI
        </Link>

        <nav className="row" style={{ gap: 24 }}>
          <Link to="/analyze" className="nav-link">
            Analyze
          </Link>
          {user && (
            <Link to="/history" className="nav-link">
              History
            </Link>
          )}
          {user ? (
            <>
              <span className="text-faint" style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>
                {user.email}
              </span>
              <button className="btn btn-secondary" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
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
