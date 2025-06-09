import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import "./App.css";

import { DarkModeProvider } from "../src/contexts/DarkModeContext";
import { MessageBoxProvider, useMessageBoxContext } from "../src/contexts/MessageBoxContext";
import { useLoadingBar, LoadingBarProvider } from "../src/contexts/LoadingBarContext";

import MessageBox from "./components/MessageBox/MessageBox";
import LoadingBar from "./components/LoadingProgressBar/LoadingProgressBar";
import Navigation from "./components/Navigation/Navigation";
import NavigationFeed from "./components/NavigationFeed/NavigationFeed";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";

import HeroSection from "./pages/Hero/Hero";
import NotFound from "./pages/NotFound/NotFound";
import About from "./pages/About/About";
import WhatIsAbout from "./pages/WhatIsItAbout/WhatIsItAbout";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Feed from "./pages/Feed/Feed";
import SettingsAccount from "./pages/SettingsAccount/SettingsAccount";
import Trash from "./pages/Trash/Trash";
import Shared from "./pages/Shared/Shared";

import axios from "axios";

// Configuración global de axios
axios.defaults.withCredentials = true;

const AppContent: React.FC = () => {
  const { isLoadingBar } = useLoadingBar();
  const { messageMessageBox } = useMessageBoxContext();
  const location = useLocation();

  // Definir rutas donde ocultar Navigation
  const hideNavigationPaths = new Set(["/terms", "/privacy", "/waiting", "/feed"]);

  // Verificar si la página actual es "/feed" para NavigationFeed
  const isFeedPage = location.pathname.toLowerCase().startsWith("/feed");

  return (
    <div>
      <LoadingBar isLoading={isLoadingBar} />
      {messageMessageBox && <MessageBox message={messageMessageBox} />}
      
      {/* Mostrar NavigationFeed solo en /feed */}
      {isFeedPage ? <NavigationFeed /> : !hideNavigationPaths.has(location.pathname.toLowerCase()) && <Navigation />}

      <Routes>
        <Route path="/" element={<HeroSection />} />
        <Route path="/about" element={<About />} />
        <Route path="/whatIsItAbout" element={<WhatIsAbout />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rutas protegidas */}
        <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
        <Route path="/feed/settings" element={<ProtectedRoute><SettingsAccount /></ProtectedRoute>} />
        <Route path="/feed/trash" element={<ProtectedRoute><Trash /></ProtectedRoute>} />
        <Route path="/feed/shared" element={<ProtectedRoute><Shared /></ProtectedRoute>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <DarkModeProvider>
      <MessageBoxProvider>
        <LoadingBarProvider>
          <Router>
            <AppContent />
          </Router>
        </LoadingBarProvider>
      </MessageBoxProvider>
    </DarkModeProvider>
  );
};

export default App;
