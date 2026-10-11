import DesignPreviewPage from "./pages/DesignPreviewPage";
import { Route, Routes } from "react-router";
import RequireAuth from "./auth/RequireAuth";
import AppLayout from "./components/AppLayout";
import DiscoverPage from "./pages/DiscoverPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import HistoryPage from "./pages/HistoryPage";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import MatchesPage from "./pages/MatchesPage";
import MatchProfilePage from "./pages/MatchProfilePage";
import NotFoundPage from "./pages/NotFoundPage";
import PersonPage from "./pages/PersonPage";
import ProfilePage from "./pages/ProfilePage";
import SearchPage from "./pages/SearchPage";
import SignupPage from "./pages/SignupPage";

function App() {
  return (
    <Routes>
      {import.meta.env.DEV && <Route path="/design-preview" element={<DesignPreviewPage />} />}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Everything inside here needs you to be logged in */}
      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route path="/discover" element={<DiscoverPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/people/:userId" element={<PersonPage />} />
          <Route path="/matches" element={<MatchesPage />} />
          <Route path="/matches/:userId" element={<MatchProfilePage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
