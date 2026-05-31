import { useState } from "react";
import Auth from "./components/Auth";
import Chat from "./components/Chat";

export default function App() {
  const [user, setUser] = useState(() => {
    // Load user from localStorage on startup
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return user
    ? <Chat user={user} onLogout={handleLogout} />
    : <Auth onLogin={handleLogin} />;
}