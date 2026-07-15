import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ManagerNavigation from "../components/ManagerNavigation";

function TableManagementPage() {
    const [manager, setManager] = useState(null);
    const [tables, setTables] = useState([]);
    const [message, setMessage] = useState("");
    const [showTableForm, setShowTableForm] = useState(false);
    const [tableForm, setTableForm] = useState({
        table_number: "",
        capacity: 1,
        table_location: "",
    });
    const [editingTableId, setEditingTableId] = useState(null);
    const [inactiveTables, setInactiveTables] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        const storedManager = sessionStorage.getItem("manager");

        if (!storedManager) {
            navigate("/manager/login");
            return;
        }

        setManager(JSON.parse(storedManager));
        fetchTables();
        fetchInactiveTables();
    }, [navigate]);

    function handleTableFormChange(event) {
        const { name, value } = event.target;

        setTableForm((currentForm) => ({
            ...currentForm,
            [name]: value,
        }));
    }

    async function handleSaveTable(event) {
        event.preventDefault();

        setMessage("");

        const isEditing = editingTableId !== null;

        const url = isEditing
            ? `http://localhost:3000/api/tables/${editingTableId}`
            : "http://localhost:3000/api/tables";

        const method = isEditing ? "PUT" : "POST";

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    table_number: tableForm.table_number,
                    capacity: Number(tableForm.capacity),
                    table_location: tableForm.table_location,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setMessage(
                    data.message ||
                    `Unable to ${isEditing ? "update" : "create"} table`
                );
                return;
            }

            handleCancelTableForm();
            fetchTables();
        } catch (error) {
            console.error(error);
            setMessage("Unable to connect to the server");
        }
    }

    async function handleDeactivateTable(tableId) {
        const confirmed = window.confirm(
            "Are you sure you want to deactivate this table?"
        );

        if (!confirmed) {
            return;
        }

        setMessage("");

        try {
            const response = await fetch(
                `http://localhost:3000/api/tables/${tableId}`,
                {
                    method: "DELETE",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage(
                    data.message || "Unable to deactivate table"
                );
                return;
            }

            setTables((currentTables) =>
                currentTables.filter((table) => table.id !== tableId)
            );
        } catch (error) {
            console.error(error);
            setMessage("Unable to connect to the server");
        }
    }

    function handleEditTable(table) {
        setEditingTableId(table.id);

        setTableForm({
            table_number: table.table_number,
            capacity: table.capacity,
            table_location: table.table_location || "",
        });

        setShowTableForm(true);
        setMessage("");
    }

    function handleCancelTableForm() {
        setEditingTableId(null);

        setTableForm({
            table_number: "",
            capacity: 1,
            table_location: "",
        });

        setShowTableForm(false);
        setMessage("");
    }

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

    async function fetchInactiveTables() {
        try {
            const response = await fetch(
                "http://localhost:3000/api/tables/inactive"
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage(
                    data.message || "Unable to load inactive tables"
                );
                return;
            }

            setInactiveTables(data);
        } catch (error) {
            console.error(error);
            setMessage("Unable to connect to the server");
        }
    }

    async function handleReactivateTable(tableId) {
        setMessage("");

        try {
            const response = await fetch(
                `http://localhost:3000/api/tables/${tableId}/reactivate`,
                {
                    method: "PATCH",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage(
                    data.message || "Unable to reactivate table"
                );
                return;
            }

            setInactiveTables((currentTables) =>
                currentTables.filter((table) => table.id !== tableId)
            );

            setTables((currentTables) => [
                ...currentTables,
                data.table,
            ]);
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

                {message && (
                    <p className="message">{message}</p>
                )}

                <div className="table-management-header">
                    <h2>Table Management</h2>

                    <button
                        type="button"
                        className="add-table-button"
                        onClick={() => {
                            setEditingTableId(null);

                            setTableForm({
                                table_number: "",
                                capacity: 1,
                                table_location: "",
                            });

                            setMessage("");
                            setShowTableForm(true);
                        }}
                    >
                        + Add Table
                    </button>
                </div>

                {showTableForm && (
                    <div
                        className="table-modal-overlay"
                        onClick={handleCancelTableForm}
                    >
                        <section
                            className="table-modal"
                            onClick={(event) => event.stopPropagation()}
                        >
                            <div className="table-modal-header">
                                <div>
                                    <p className="booking-label">
                                        {editingTableId ? "Edit table" : "New table"}
                                    </p>

                                    <h2>
                                        {editingTableId
                                            ? "Update table details"
                                            : "Add a new table"}
                                    </h2>
                                </div>

                                <button
                                    type="button"
                                    className="table-modal-close"
                                    aria-label="Close table form"
                                    onClick={handleCancelTableForm}
                                >
                                    ×
                                </button>
                            </div>

                            <form
                                className="table-form"
                                onSubmit={handleSaveTable}
                            >
                                <div className="input-group">
                                    <label htmlFor="table_number">
                                        Table number
                                    </label>

                                    <input
                                        id="table_number"
                                        name="table_number"
                                        type="text"
                                        placeholder="Example: 5"
                                        value={tableForm.table_number}
                                        onChange={handleTableFormChange}
                                        required
                                    />
                                </div>

                                <div className="input-group">
                                    <label htmlFor="capacity">
                                        Capacity
                                    </label>

                                    <input
                                        id="capacity"
                                        name="capacity"
                                        type="number"
                                        min="1"
                                        value={tableForm.capacity}
                                        onChange={handleTableFormChange}
                                        required
                                    />
                                </div>

                                <div className="input-group">
                                    <label htmlFor="table_location">
                                        Location
                                    </label>

                                    <input
                                        id="table_location"
                                        name="table_location"
                                        type="text"
                                        placeholder="Example: Main Floor"
                                        value={tableForm.table_location}
                                        onChange={handleTableFormChange}
                                    />
                                </div>

                                <div className="table-form-actions">
                                    <button type="submit">
                                        {editingTableId
                                            ? "Update Table"
                                            : "Save Table"}
                                    </button>

                                    <button
                                        type="button"
                                        className="secondary-button"
                                        onClick={handleCancelTableForm}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </section>
                    </div>
                )}

                <div className="table-list">
                    {tables.map((table) => (
                        <div
                            className="table-card"
                            key={table.id}
                        >
                            <div className="table-card-info">
                                <strong>{table.table_number}</strong>
                                <span>{table.capacity} seats</span>
                                <span>{table.table_location || "Location undefined"}</span>
                            </div>
                            <div className="table-card-actions">
                                <button
                                    type="button"
                                    className="edit-table-button"
                                    onClick={() => handleEditTable(table)}
                                >
                                    Edit
                                </button>
                                <button
                                    type="button"
                                    className="deactivate-table-button"
                                    onClick={() => handleDeactivateTable(table.id)}
                                >
                                    Deactivate
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                {inactiveTables.length > 0 && (
                    <section className="inactive-tables-section">
                        <h2>Inactive Tables</h2>

                        <div className="table-list">
                            {inactiveTables.map((table) => (
                                <div
                                    className="table-card inactive-table-card"
                                    key={table.id}
                                >
                                    <div className="table-card-info">
                                        <strong>{table.table_number}</strong>
                                        <span>{table.capacity} seats</span>
                                        <span>{table.table_location || "Location undefined"}</span>
                                    </div>
                                    <div className="table-card-actions">
                                        <button
                                            type="button"
                                            className="reactivate-table-button"
                                            onClick={() =>
                                                handleReactivateTable(table.id)
                                            }
                                        >
                                            Reactivate
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </section>
        </main>
    );
}

export default TableManagementPage;