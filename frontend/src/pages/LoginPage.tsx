import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { fetchMe, login } from "../api/auth";
import { useAppDispatch } from "../store/hooks";
import { credentialsSet } from "../store/slices/authSlice";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { access_token } = await login(email, password);
      localStorage.setItem("basecall_token", access_token);
      const user = await fetchMe();
      dispatch(credentialsSet({ token: access_token, user }));
      navigate("/history");
    } catch {
      setError("Incorrect email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 400, padding: "64px 24px" }}>
      <h1 style={{ fontSize: 26, marginBottom: 24 }}>Log in</h1>
      <form onSubmit={handleSubmit} className="card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="label">Password</label>
          <input className="input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <p style={{ color: "var(--danger)", fontSize: 14, margin: 0 }}>{error}</p>}
        <button className="btn" type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>
      <p className="text-muted" style={{ marginTop: 16, fontSize: 14 }}>
        No account? <Link to="/register">Sign up</Link>
      </p>
    </div>
  );
}
