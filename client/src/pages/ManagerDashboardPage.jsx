import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ManagerNavigation from "../components/ManagerNavigation";

function ManagerDashboardPage() {
    const [manager, setManager] = useState(null);
    const [message, setMessage] = useState("");
    const [bookings, setBookings] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        const storedManager = sessionStorage.getItem("manager");

        if (!storedManager) {
            navigate("/manager/login");
            return;
        }

        setManager(JSON.parse(storedManager));
        fetchBookings();
    }, [navigate]);

    async function fetchBookings() {
        setMessage("");

        try {
            const response = await fetch("http://localhost:3000/api/bookings");
            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || "Unable to load bookings");
                return;
            }

            setBookings(data);
        } catch (error) {
            console.error(error);
            setMessage("Unable to connect to the server");
        }
    }

    async function handleStatusUpdate(bookingId, newStatus) {
        setMessage("");

        try {
            const response = await fetch(
                `http://localhost:3000/api/bookings/${bookingId}/status`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        booking_status: newStatus,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage(
                    data.message || "Unable to update booking status"
                );
                return;
            }

            setBookings((currentBookings) =>
                currentBookings.map((booking) =>
                    booking.id === bookingId
                        ? {
                            ...booking,
                            booking_status:
                                data.booking.booking_status,
                        }
                        : booking
                )
            );
        } catch (error) {
            console.error(error);
            setMessage("Unable to connect to the server");
        }
    }

    async function handleDeleteBooking(bookingId) {
        const confirmed = window.confirm(
            "Are you sure you want to delete this booking?"
        );

        if (!confirmed) {
            return;
        }

        setMessage("");

        try {
            const response = await fetch(
                `http://localhost:3000/api/bookings/${bookingId}`,
                {
                    method: "DELETE",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage(
                    data.message || "Unable to delete booking"
                );
                return;
            }

            setBookings((currentBookings) =>
                currentBookings.filter(
                    (booking) => booking.id !== bookingId
                )
            );
        } catch (error) {
            console.error(error);
            setMessage("Unable to connect to the server");
        }
    }

    if (!manager) {
        return null;
    }

    function canDeleteBooking(booking) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const bookingDate = new Date(
            `${booking.booking_date}T00:00:00`
        );

        return (
            booking.booking_status === "rejected" ||
            booking.booking_status === "cancelled" ||
            bookingDate < today
        );
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
                <section className="bookings-section">
                    <h2>Reservation</h2>

                    {bookings.length === 0 ? (
                        <p className="empty-state">
                            No reservation requests found.
                        </p>
                    ) : (
                        <div className="booking-list">
                            {bookings.map((booking) => (
                                <article
                                    className={`booking-item booking-item-${booking.booking_status}`}
                                    key={booking.id}
                                >
                                    <div className="booking-item-header">
                                        <div>
                                            <strong>
                                                {booking.customer_name}
                                            </strong>

                                            <span>
                                                {booking.customer_email}
                                            </span>
                                        </div>

                                        <span
                                            className={`booking-status ${booking.booking_status}`}
                                        >
                                            {booking.booking_status}
                                        </span>
                                    </div>

                                    <div className="booking-item-details">
                                        <span>
                                            <strong>Date:</strong>{" "}
                                            {booking.booking_date}
                                        </span>

                                        <span>
                                            <strong>Time:</strong>{" "}
                                            {booking.start_time} –{" "}
                                            {booking.end_time}
                                        </span>

                                        <span>
                                            <strong>Guests:</strong>{" "}
                                            {booking.party_size}
                                        </span>

                                        <span>
                                            <strong>Table:</strong>{" "}
                                            {booking.table_number}
                                        </span>
                                    </div>
                                    <div className="booking-actions">
                                        {booking.booking_status === "pending" && (
                                            <>
                                                <button
                                                    type="button"
                                                    className="confirm-button"
                                                    onClick={() =>
                                                        handleStatusUpdate(
                                                            booking.id,
                                                            "confirmed"
                                                        )
                                                    }
                                                >
                                                    Confirm
                                                </button>

                                                <button
                                                    type="button"
                                                    className="reject-button"
                                                    onClick={() =>
                                                        handleStatusUpdate(
                                                            booking.id,
                                                            "rejected"
                                                        )
                                                    }
                                                >
                                                    Reject
                                                </button>
                                            </>
                                        )}

                                        {booking.booking_status === "confirmed" && (
                                            <button
                                                type="button"
                                                className="cancel-button"
                                                onClick={() =>
                                                    handleStatusUpdate(
                                                        booking.id,
                                                        "cancelled"
                                                    )
                                                }
                                            >
                                                Cancel reservation
                                            </button>
                                        )}
                                        {canDeleteBooking(booking) && (
                                            <button
                                                type="button"
                                                className="delete-booking-button"
                                                onClick={() =>
                                                    handleDeleteBooking(booking.id)
                                                }
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </section>
        </main>
    );
}

export default ManagerDashboardPage;