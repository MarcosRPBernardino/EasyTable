import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ManagerNavigation from "../components/ManagerNavigation";

function TableManagementPage() {
    const [manager, setManager] = useState(null);
    const [tables, setTables] = useState([]);
    const [message, setMessage] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        const storedManager = sessionStorage.getItem("manager");

        if (!storedManager) {
            navigate("/manager/login");
            return;
        }

        setManager(JSON.parse(storedManager));
        fetchTables();
    }, [navigate]);

    async function fetchTables() {
        setMessage("");

        try {
            const response = await fetch(
                "http://localhost:3000/api/tables"
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage(
                    data.message || "Unable to load tables"
                );
                return;
            }

            setTables(data);
        } catch (error) {
            console.error(error);
            setMessage("Unable to connect to the server");
        }
    }

    if (!manager) {
        return null;
    }

    return (
        <main className="app page-transition">
            <section className="login-card dashboard-mode">

                <ManagerNavigation />

                <div className="dashboard-header">
                    <div>
                        <h1>EasyTable</h1>
                        <p>Welcome, {manager.full_name}</p>
                    </div>
                </div>

                <h2>Table Management</h2>

                {message && (
                    <p className="message">{message}</p>
                )}

                <div className="table-list">
                    {tables.map((table) => (
                        <div
                            className="table-card"
                            key={table.id}
                        >
                            <strong>{table.table_number}</strong>
                            <span>{table.capacity} seats</span>
                            <span>
                                {table.table_location ||
                                    "Location undefined"}
                            </span>
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
}

export default TableManagementPage;