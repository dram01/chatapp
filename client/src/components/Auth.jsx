import { useState } from "react";
import axios from "axios";

export default function Auth ({ onLogin }) {
    const [isRegister, setIsRegister] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async () => {
  const endpoint = isRegister ? "register" : "login";

  try {
    const res = await axios.post(
      `https://chatapp-production-baa8.up.railway.app/auth/${endpoint}`,
      {
        username,
        password,
      }
    );

    if (!isRegister) onLogin(res.data.user);
    else setIsRegister(false);

  } catch (err) {
    setError(err.response?.data?.error || "Something went wrong");
  }
};

    return (
    <div style={{ maxWidth: 300, margin: "100px auto", textAlign: "center" }}>
      <h2>{isRegister ? "Register" : "Login"}</h2>
      <input placeholder="Username" value={username}
        onChange={(e) => setUsername(e.target.value)} /><br /><br />
      <input placeholder="Password" type="password" value={password}
        onChange={(e) => setPassword(e.target.value)} /><br /><br />
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button onClick={handleSubmit}>{isRegister ? "Register" : "Login"}</button>
      <p style={{ cursor: "pointer", color: "blue" }}
        onClick={() => setIsRegister(!isRegister)}>
        {isRegister ? "Already have an account? Login" : "No account? Register"}
      </p>
    </div>
    );
};