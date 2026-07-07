import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { fetchMe, login, register } from "../api/auth";
import { useAppDispatch } from "../store/hooks";
import { credentialsSet } from "../store/slices/authSlice";
import axios from "axios";

export function RegisterPage() {
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
      await register(email, password);
      const { access_token } = await login(email, password);
      localStorage.setItem("basecall_token", access_token);
      const user = await fetchMe();
      dispatch(credentialsSet({ token: access_token, user }));
      navigate("/history");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 400) {
        setError("An account with that email already exists.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page page-narrow stack-md">
      <div className="stack-xs">
        <span className="eyebrow">Account</span>
        <h1 style={{ fontSize: 26 }}>Sign up</h1>
      </div>
      <form onSubmit={handleSubmit} className="card card-pad stack-md">
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="label">Password</label>
          <input
            className="input"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p style={{ color: "var(--danger)", fontSize: 14, margin: 0 }}>{error}</p>}
        <button className="btn" type="submit" disabled={loading}>
          {loading ? "Creating account…" : "Sign up"}
        </button>
      </form>
      <p className="text-muted" style={{ fontSize: 14, margin: 0 }}>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}
