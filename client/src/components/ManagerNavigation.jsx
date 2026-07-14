import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

function ManagerNavigation() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        setIsMenuOpen(false);
    }, [location.pathname]);

    function handleLogout() {
        sessionStorage.removeItem("manager");
        setIsMenuOpen(false);
        navigate("/manager/login");
    }

    return (
        <nav className="manager-navigation">
            <div className="manager-navigation-bar">
                <strong className="manager-navigation-logo">
                    EasyTable
                </strong>

                <div className="manager-navigation-desktop">
                    <NavLink
                        to="/manager/dashboard"
                        className={({ isActive }) =>
                            isActive
                                ? "manager-navigation-link active"
                                : "manager-navigation-link"
                        }
                    >
                        Reservations
                    </NavLink>

                    <NavLink
                        to="/manager/tables"
                        className={({ isActive }) =>
                            isActive
                                ? "manager-navigation-link active"
                                : "manager-navigation-link"
                        }
                    >
                        Table Management
                    </NavLink>

                    <button
                        type="button"
                        className="manager-navigation-logout"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </div>

                <button
                    type="button"
                    className="manager-menu-button"
                    aria-label={
                        isMenuOpen
                            ? "Close manager menu"
                            : "Open manager menu"
                    }
                    aria-expanded={isMenuOpen}
                    onClick={() =>
                        setIsMenuOpen((currentValue) => !currentValue)
                    }
                >
                    {isMenuOpen ? (
                        <X size={24} aria-hidden="true" />
                    ) : (
                        <Menu size={24} aria-hidden="true" />
                    )}
                </button>
            </div>

            <div
                className={`manager-mobile-menu ${isMenuOpen ? "open" : ""
                    }`}
            >
                <NavLink
                    to="/manager/dashboard"
                    className={({ isActive }) =>
                        isActive
                            ? "manager-mobile-link active"
                            : "manager-mobile-link"
                    }
                >
                    Reservations
                </NavLink>

                <NavLink
                    to="/manager/tables"
                    className={({ isActive }) =>
                        isActive
                            ? "manager-mobile-link active"
                            : "manager-mobile-link"
                    }
                >
                    Table Management
                </NavLink>

                <button
                    type="button"
                    className="manager-mobile-logout"
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </div>

            {isMenuOpen && (
                <button
                    type="button"
                    className="manager-menu-overlay"
                    aria-label="Close manager menu"
                    onClick={() => setIsMenuOpen(false)}
                />
            )}
        </nav>
    );
}

export default ManagerNavigation;