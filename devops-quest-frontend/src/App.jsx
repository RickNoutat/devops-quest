/**
 * App — Composant principal, orchestre les fetch et l'état global
 */
import { useState, useEffect, useCallback } from "react";
import { fetchParts, fetchPartById, fetchStats } from "./services/api";
import { AuthProvider } from "./contexts/AuthContext";
import useCompletion from "./hooks/useCompletion";
import Header from "./components/Header";
import PartSelector from "./components/PartSelector";
import StepsSidebar from "./components/StepsSidebar";
import StepDetail from "./components/StepDetail";
import ApiError from "./components/ApiError";
import AuthModal from "./components/AuthModal";
import Leaderboard from "./components/Leaderboard";
import ResetPasswordModal from "./components/ResetPasswordModal";

function AppInner() {
  const [parts, setParts] = useState([]);
  const [activePart, setActivePart] = useState("part1");
  const [partData, setPartData] = useState(null);
  const [stats, setStats] = useState(null);
  const [activeStep, setActiveStep] = useState(null);
  const [apiOk, setApiOk] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const resetToken = new URLSearchParams(window.location.search).get("token");
  const { completedSteps, toggle } = useCompletion();

  // Chargement initial
  useEffect(() => {
    Promise.all([fetchParts(), fetchStats()])
      .then(([p, s]) => { setParts(p); setStats(s); setApiOk(true); })
      .catch(() => setApiOk(false));
  }, []);

  // Chargement des étapes quand on change de partie
  const loadPart = useCallback((id) => {
    fetchPartById(id)
      .then((data) => {
        setPartData(data);
        if (data.steps?.length) setActiveStep(data.steps[0].id);
      })
      .catch(() => setApiOk(false));
  }, []);

  useEffect(() => { loadPart(activePart); }, [activePart, loadPart]);

  if (!apiOk) return <ApiError />;

  return (
    <>
      <Header
        stats={stats}
        completedCount={completedSteps.length}
        onLoginClick={() => setShowAuth(true)}
        onLeaderboardClick={() => setShowLeaderboard(true)}
      />
      <PartSelector parts={parts} activePart={activePart} onSelect={setActivePart} />
      {partData && (
        <div style={{
          maxWidth: 1200, margin: "0 auto", padding: "0 40px 40px",
          display: "grid", gridTemplateColumns: "300px 1fr", gap: 16, minHeight: "60vh",
        }}>
          <StepsSidebar
            steps={partData.steps} completedSteps={completedSteps}
            activeStep={activeStep} onSelectStep={setActiveStep}
          />
          <StepDetail
            step={partData.steps.find((s) => s.id === activeStep)}
            isCompleted={completedSteps.includes(activeStep)}
            onToggleComplete={toggle}
          />
        </div>
      )}

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      {showLeaderboard && <Leaderboard onClose={() => setShowLeaderboard(false)} />}
      {resetToken && (
        <ResetPasswordModal
          token={resetToken}
          onClose={() => {
            window.history.replaceState({}, "", window.location.pathname);
            setShowAuth(true);
          }}
        />
      )}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
