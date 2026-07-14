import { BrowserRouter, Routes, Route } from "react-router-dom";

import PublicBookingPage from "./pages/PublicBookingPage";
import ManagerLoginPage from "./pages/ManagerLoginPage";
import ManagerDashboardPage from "./pages/ManagerDashboardPage";
import TableManagementPage from "./pages/TableManagementPage";

import "./App.css";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<PublicBookingPage />} />

                <Route
                    path="/manager/login"
                    element={<ManagerLoginPage />}
                />

                <Route
                    path="/manager/dashboard"
                    element={<ManagerDashboardPage />}
                />
                <Route
                    path="/manager/tables"
                    element={<TableManagementPage />}
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;