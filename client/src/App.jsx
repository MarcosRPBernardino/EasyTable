import { useState } from "react";
import "./App.css";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [manager, setManager] = useState(null);
  const [tables, setTables] = useState([]);

  async function fetchTables() {
    setMessage("");
    try {
      const response = await fetch("http://localhost:3000/api/tables");
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Unable to load tables");
        return;
      }
      setTables(data);
    } catch (error) {
      setMessage("Unable to connect to the server");
    }
  }

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
      fetchTables();
    }
    catch (error) {
      setManager(null);
      setMessage("Unable to connect to the server");
    }
  }

  if (manager) {
    return (
      <main className="app">
        <section className="login-card dashboard-mode">
          <h1>EasyTable</h1>
          <p>Welcome, {manager.full_name}</p>

          <h2>Table Management</h2>

          {message && <p className="message">{message}</p>}

          <div className="table-list">
            {tables.map((table) => (
              <div className="table-card" key={table.id}>
                <strong>{table.table_number}</strong>
                <span>{table.capacity} seats</span>
                <span>{table.table_location || "Location undefined"}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="app">
      <section className="login-card">
        <h1>EasyTable</h1>
        <p>Manager Login</p>
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Email</label>
            <input type="email" placeholder="Enter your Email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input type="password" placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </div>
          <button type="submit">Login</button>
        </form>
        {message && <p className="message">{message}</p>}
      </section>
    </main>
  );
}


export default App;