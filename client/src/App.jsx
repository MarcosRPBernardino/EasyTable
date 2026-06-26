import { useState } from "react";
import "./App.css";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [manager, setManager] = useState(null);

  async function handleLogin(event) {
    event.preventDefault();

    setMessage("");

    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setManager(null);
        setMessage(data.message || "Login Failed");
        return;
      }
      setManager(data.manager);
      setMessage("Login Successful");
    }
    catch (error) {
      setManager(null);
      setMessage("Unable to connect to the server");
    }
  }

  return (
    <main className="app">
      <section className="login-card">
        <h1>EasyTable</h1>
        <p>Manager Login</p>
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Email</label>
            <input type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => setEmail(event.target.value)} />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)} />
          </div>
          <button type="submit">Login</button>
        </form>

        {message && <p className="message">{message}</p>}
        {manager && (<div className="manager-box">
          <strong>Welcome, {manager.full_name}</strong><br />
          <span>{manager.email}</span>
        </div>
        )}
      </section>
    </main>
  );
}

export default App;