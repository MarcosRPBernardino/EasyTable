import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import ManagerNavigation from "../components/ManagerNavigation";

function CalendarPage() {
    const [manager, setManager] = useState(null);
    const [events, setEvents] = useState([]);
    const [message, setMessage] = useState("");
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 640);
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
    useEffect(() => {
        function handleResize() {
            setIsMobile(window.innerWidth <= 640);
        }
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    async function fetchBookings() {
        setMessage("");
        try {
            const response = await fetch(
                "http://localhost:3000/api/bookings"
            );
            const data = await response.json();
            if (!response.ok) {
                setMessage(
                    data.message || "Unable to load bookings"
                );
                return;
            }

            const calendarEvents = data.map((booking) => ({
                id: String(booking.id),
                title: booking.table_number,
                start: `${booking.booking_date}T${booking.start_time}`,
                end: `${booking.booking_date}T${booking.end_time}`,
                extendedProps: {
                    customer_name: booking.customer_name,
                    customer_email: booking.customer_email,
                    customer_phone: booking.customer_phone,
                    booking_date: booking.booking_date,
                    start_time: booking.start_time,
                    end_time: booking.end_time,
                    party_size: booking.party_size,
                    table_number: booking.table_number,
                    table_location: booking.table_location,
                    booking_status: booking.booking_status,
                },
            }));

            setEvents(calendarEvents);
        } catch (error) {
            console.error(error);
            setMessage("Unable to connect to the server");
        }
    }

    if (!manager) {
        return null;
    }

    function handleEventClick(info) {
        setSelectedBooking({
            id: info.event.id,
            title: info.event.title,
            ...info.event.extendedProps,
        });
    }

    return (
        <main className="app page-transition">
            <section className="calendar-card">
                <ManagerNavigation />
                <div className="dashboard-header">
                    <div>
                        <h1>EasyTable</h1>
                        <p>Welcome, {manager.full_name}</p>
                    </div>
                </div>
                <div className="calendar-header">
                    <h2>Booking Calendar</h2>
                    <p>
                        View reservations by day, week or month.
                    </p>
                </div>
                {message && (
                    <p className="message">{message}</p>
                )}
                <div className="calendar-wrapper">
                    <FullCalendar
                        plugins={[
                            dayGridPlugin,
                            timeGridPlugin,
                            interactionPlugin,
                        ]}
                        initialView={isMobile ? "timeGridDay" : "timeGridWeek"}
                        events={events}
                        eventClick={handleEventClick}
                        eventDisplay="block"
                        eventTimeFormat={{
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                        }}
                        eventContent={(eventInfo) => (
                            <div className="calendar-event-content">
                                <strong>
                                    {eventInfo.event.extendedProps.table_number}
                                </strong>
                                <span>
                                    {eventInfo.event.extendedProps.customer_name}
                                </span>
                            </div>
                        )}
                        headerToolbar={isMobile ? { left: "prev,next", center: "title", right: "today", } : { left: "prev,next today", center: "title", right: "dayGridMonth,timeGridWeek,timeGridDay", }
                        }
                        footerToolbar={isMobile ? { center: "dayGridMonth,timeGridDay", } : false}
                        buttonText={{ today: "Today", month: "Month", week: "Week", day: "Day", }}
                        dayHeaderFormat={isMobile ? { weekday: "short", day: "numeric", } : { weekday: "short", day: "numeric", month: "numeric", }
                        }
                        slotMinTime="08:00:00"
                        slotMaxTime="23:00:00"
                        slotDuration="00:30:00"
                        slotLabelInterval="01:00"
                        allDaySlot={false}
                        nowIndicator
                        expandRows
                        contentHeight="auto"
                        eventMaxStack={isMobile ? 2 : 1}
                        dayMaxEvents={isMobile ? 2 : 3}
                        moreLinkClick="popover"
                    />
                </div>
                {selectedBooking && (
                    <div
                        className="booking-modal-overlay"
                        onClick={() => setSelectedBooking(null)}
                    >
                        <section
                            className="booking-modal"
                            onClick={(event) => event.stopPropagation()}
                        >
                            <div className="booking-modal-header">
                                <div>
                                    <p className="booking-label">
                                        Reservation details
                                    </p>
                                    <h2>{selectedBooking.customer_name}</h2>
                                </div>
                                <button
                                    type="button"
                                    className="booking-modal-close"
                                    aria-label="Close reservation details"
                                    onClick={() => setSelectedBooking(null)}
                                >
                                    x
                                </button>
                            </div>
                            <div className="booking-modal-status-row">
                                <span
                                    className={`booking-status ${selectedBooking.booking_status}`}
                                >
                                    {selectedBooking.booking_status}
                                </span>
                            </div>
                            <div className="booking-modal-details">
                                <div>
                                    <span>Date</span>
                                    <strong>{selectedBooking.booking_date}</strong>
                                </div>
                                <div>
                                    <span>Time</span>
                                    <strong>
                                        {selectedBooking.start_time} –{" "}
                                        {selectedBooking.end_time}
                                    </strong>
                                </div>
                                <div>
                                    <span>Table</span>
                                    <strong>{selectedBooking.table_number}</strong>
                                </div>
                                <div>
                                    <span>Location</span>
                                    <strong>
                                        {selectedBooking.table_location ||
                                            "Location not specified"}
                                    </strong>
                                </div>
                                <div>
                                    <span>Guests</span>
                                    <strong>{selectedBooking.party_size}</strong>
                                </div>
                                <div>
                                    <span>Email</span>
                                    <strong>{selectedBooking.customer_email}</strong>
                                </div>
                                <div>
                                    <span>Phone</span>
                                    <strong>
                                        {selectedBooking.customer_phone ||
                                            "Not provided"}
                                    </strong>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="booking-modal-done"
                                onClick={() => setSelectedBooking(null)}
                            >
                                Close
                            </button>
                        </section>
                    </div>
                )}
            </section>
        </main>
    );
}

export default CalendarPage;