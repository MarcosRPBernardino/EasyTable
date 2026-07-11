import { useState } from "react";
import { useNavigate } from "react-router-dom";

function ManagerLoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const navigate = useNavigate();

    async function handleLogin(event) {
        event.preventDefault();
        setMessage("");

        try {
            const response = await fetch(
                "http://localhost:3000/api/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email,
                        password,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || "Login failed");
                return;
            }

            sessionStorage.setItem(
                "manager",
                JSON.stringify(data.manager)
            );

            navigate("/manager/dashboard");
        } catch (error) {
            console.error(error);
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
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(event) =>
                                setEmail(event.target.value)
                            }
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            required
                        />
                    </div>

                    <button type="submit">Login</button>
                </form>

                {message && (
                    <p className="message">{message}</p>
                )}
            </section>
        </main>
    );
}

export default ManagerLoginPage;