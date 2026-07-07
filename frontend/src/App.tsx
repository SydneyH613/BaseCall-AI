import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Navbar } from "./components/Layout/Navbar";
import { ProtectedRoute } from "./components/Layout/ProtectedRoute";
import { HomePage } from "./pages/HomePage";
import { LearnPage } from "./pages/LearnPage";
import { AnalyzePage } from "./pages/AnalyzePage";
import { HistoryPage } from "./pages/HistoryPage";
import { AnalysisDetailPage } from "./pages/AnalysisDetailPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Navbar />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/learn" element={<LearnPage />} />
            <Route path="/analyze" element={<AnalyzePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <HistoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history/:id"
              element={
                <ProtectedRoute>
                  <AnalysisDetailPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
