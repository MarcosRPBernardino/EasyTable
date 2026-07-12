import { useState } from "react";

function BookingForm() {
    const [bookingData, setBookingData] = useState({
        customer_name: "",
        customer_email: "",
        customer_phone: "",
        booking_date: "",
        start_time: "",
        duration_minutes: "60",
        party_size: 1,
    });

    const [availableTables, setAvailableTables] = useState([]);
    const [selectedTableId, setSelectedTableId] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState("search");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [bookingCreated, setBookingCreated] = useState(null);

    function handleChange(event) {
        const { name, value } = event.target;

        setBookingData((currentData) => ({
            ...currentData,
            [name]: value,
        }));
    }

    function calculateEndTime(startTime, durationMinutes) {
        if (!startTime) {
            return null;
        }

        const [hours, minutes] = startTime.split(":").map(Number);

        const totalMinutes =
            hours * 60 + minutes + Number(durationMinutes);

        if (totalMinutes >= 24 * 60) {
            return null;
        }

        const endHours = Math.floor(totalMinutes / 60);
        const endMinutes = totalMinutes % 60;

        return `${String(endHours).padStart(2, "0")}:${String(
            endMinutes
        ).padStart(2, "0")}`;
    }

    function handleBackToSearch() {
        setCurrentStep("search");
        setAvailableTables([]);
        setSelectedTableId("");
        setMessage("");
    }

    async function handleSubmit(event) {
        event.preventDefault();

        setMessage("");
        setAvailableTables([]);
        setSelectedTableId("");

        const endTime = calculateEndTime(
            bookingData.start_time,
            bookingData.duration_minutes
        );

        if (!endTime) {
            setMessage("Booking must end on the same day");
            return;
        }

        const query = new URLSearchParams({
            booking_date: bookingData.booking_date,
            start_time: bookingData.start_time,
            end_time: endTime,
            party_size: String(bookingData.party_size),
        });

        try {
            setIsLoading(true);

            const response = await fetch(
                `http://localhost:3000/api/tables/available?${query.toString()}`
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage(
                    data.message ||
                    "Unable to search available tables"
                );
                return;
            }

            if (data.length === 0) {
                setMessage(
                    "No tables are available for the selected time"
                );
                return;
            }

            setAvailableTables(data);
            setCurrentStep("results");
        } catch (error) {
            console.error(error);
            setMessage("Unable to connect to the server");
        } finally {
            setIsLoading(false);
        }
    }

    async function handleCreateBooking() {
        const endTime = calculateEndTime(
            bookingData.start_time,
            bookingData.duration_minutes
        );

        if (!endTime || !selectedTableId) {
            return;
        }

        const payload = {
            customer_name: bookingData.customer_name,
            customer_email: bookingData.customer_email,
            customer_phone: bookingData.customer_phone,
            booking_date: bookingData.booking_date,
            start_time: bookingData.start_time,
            end_time: endTime,
            party_size: Number(bookingData.party_size),
            table_id: Number(selectedTableId),
        };

        try {
            setIsSubmitting(true);
            setMessage("");

            const response = await fetch(
                "http://localhost:3000/api/bookings",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage(
                    data.message || "Unable to create booking"
                );
                return;
            }

            setBookingCreated(data.booking);
            setCurrentStep("success");
        } catch (error) {
            console.error(error);
            setMessage("Unable to connect to the server");
        } finally {
            setIsSubmitting(false);
        }
    }

    function getTodayDate() {
        const today = new Date();

        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    return (
        <section className="booking-card">
            {currentStep === "search" && (
                <>
                    <header className="booking-header">
                        <p className="booking-label">
                            Public Booking
                        </p>

                        <h1>Reserve your table</h1>

                        <p>
                            Select your preferred date, time and
                            party size.
                        </p>
                    </header>

                    <form
                        className="booking-form"
                        onSubmit={handleSubmit}
                    >
                        <div className="input-group">
                            <label htmlFor="customer_name">
                                Full name
                            </label>

                            <input
                                id="customer_name"
                                name="customer_name"
                                type="text"
                                placeholder="Enter your full name"
                                value={bookingData.customer_name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="customer_email">
                                Email
                            </label>

                            <input
                                id="customer_email"
                                name="customer_email"
                                type="email"
                                placeholder="Enter your email"
                                value={bookingData.customer_email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="customer_phone">
                                Phone
                            </label>

                            <input
                                id="customer_phone"
                                name="customer_phone"
                                type="tel"
                                placeholder="Enter your phone number"
                                value={bookingData.customer_phone}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="booking-row">
                            <div className="input-group">
                                <label htmlFor="booking_date">
                                    Date
                                </label>

                                <input
                                    id="booking_date"
                                    name="booking_date"
                                    type="date"
                                    min={getTodayDate()}
                                    value={bookingData.booking_date}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="input-group">
                                <label htmlFor="party_size">
                                    Guests
                                </label>

                                <input
                                    id="party_size"
                                    name="party_size"
                                    type="number"
                                    min="1"
                                    value={bookingData.party_size}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="booking-row">
                            <div className="input-group">
                                <label htmlFor="start_time">
                                    Start time
                                </label>

                                <input
                                    id="start_time"
                                    name="start_time"
                                    type="time"
                                    value={bookingData.start_time}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="input-group">
                                <label htmlFor="duration_minutes">
                                    Duration
                                </label>

                                <select
                                    id="duration_minutes"
                                    name="duration_minutes"
                                    value={
                                        bookingData.duration_minutes
                                    }
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="30">
                                        30 minutes
                                    </option>

                                    <option value="60">
                                        1 hour
                                    </option>

                                    <option value="90">
                                        1 hour 30 minutes
                                    </option>

                                    <option value="120">
                                        2 hours
                                    </option>
                                </select>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading
                                ? "Searching..."
                                : "Search available tables"}
                        </button>
                    </form>

                    {message && (
                        <p className="message">{message}</p>
                    )}
                </>
            )}

            {currentStep === "results" && (
                <section className="available-tables">
                    <button
                        type="button"
                        className="back-button"
                        onClick={handleBackToSearch}
                    >
                        Back
                    </button>

                    <header className="booking-header">
                        <p className="booking-label">Step 2</p>

                        <h1>Available tables</h1>

                        <p>
                            {bookingData.booking_date} ·{" "}
                            {bookingData.start_time} ·{" "}
                            {bookingData.party_size}{" "}
                            {Number(bookingData.party_size) === 1
                                ? "guest"
                                : "guests"}
                        </p>
                    </header>

                    <div className="available-table-list">
                        {availableTables.map((table) => (
                            <label
                                className={`available-table-option ${Number(selectedTableId) ===
                                    table.id
                                    ? "selected"
                                    : ""
                                    }`}
                                key={table.id}
                            >
                                <input
                                    type="radio"
                                    name="selected_table"
                                    value={table.id}
                                    checked={
                                        Number(selectedTableId) ===
                                        table.id
                                    }
                                    onChange={(event) =>
                                        setSelectedTableId(
                                            event.target.value
                                        )
                                    }
                                />

                                <div className="available-table-details">
                                    <strong>
                                        {table.table_number}
                                    </strong>

                                    <span>
                                        {table.capacity} seats
                                    </span>

                                    <span>
                                        {table.table_location ||
                                            "Location not specified"}
                                    </span>
                                </div>
                            </label>
                        ))}
                    </div>

                    <button
                        type="button"
                        className="continue-button"
                        disabled={!selectedTableId}
                        onClick={handleCreateBooking}
                    >
                        {isSubmitting ? "Creating booking..." : "Continue"}
                    </button>
                </section>
            )}
            {currentStep === "success" && bookingCreated && (
    <section className="booking-success">
        <p className="booking-label">Booking submitted</p>

        <h1>Reservation request received</h1>

        <p>
            Thank you, {bookingCreated.customer_name}. Your booking
            request has been created successfully.
        </p>

        <div className="booking-summary">
            <div>
                <span>Date</span>
                <strong>{bookingCreated.booking_date}</strong>
            </div>

            <div>
                <span>Time</span>
                <strong>
                    {bookingCreated.start_time} –{" "}
                    {bookingCreated.end_time}
                </strong>
            </div>

            <div>
                <span>Guests</span>
                <strong>{bookingCreated.party_size}</strong>
            </div>

            <div>
                <span>Status</span>
                <strong>{bookingCreated.booking_status}</strong>
            </div>
        </div>

        <p className="success-note">
            A confirmation email will be sent after the manager
            reviews your request.
        </p>

        <button
            type="button"
            onClick={() => {
                setBookingData({
                    customer_name: "",
                    customer_email: "",
                    customer_phone: "",
                    booking_date: "",
                    start_time: "",
                    duration_minutes: "60",
                    party_size: 1,
                });

                setAvailableTables([]);
                setSelectedTableId("");
                setBookingCreated(null);
                setMessage("");
                setCurrentStep("search");
            }}
        >
            Make another booking
        </button>
    </section>
)}
        </section>
    );
}

export default BookingForm;