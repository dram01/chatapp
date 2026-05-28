import { useState } from "react";
import Auth from "./components/Auth";
import Chat from "./components/Chat";

export default function App() {
  const [user, setUser] = useState(null);

  return user ? <Chat user={user} /> : <Auth onLogin={setUser} />;
}