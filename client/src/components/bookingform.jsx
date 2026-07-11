import { useState } from "react";

function BookingForm() {
    const [bookingData, setBookingData] = useState({
        customer_name: "",
        customer_email: "",
        customer_phone: "",
        booking_date: "",
        start_time: "",
        end_time: "",
        party_size: 1,
    });

    function handleChange(event) {
        const { name, value } = event.target;

        setBookingData((currentData) => ({
            ...currentData,
            [name]: value,
        }));
    }

    function handleSubmit(event) {
        event.preventDefault();

        console.log(bookingData);

    }

    return (
        <section className="booking-card">
            <header className="booking-header">
                <p className="booking-label">Public Booking</p>
                <h1>Reserve your table</h1>
                <p>Select your preferred date, time and party size.</p>
            </header>
            <form className="booking-form" onSubmit={handleSubmit}>
                <div className="input-group">
                    <label htmlFor="customer_name">Full name</label>
                    <input id="customer_name" name="customer_name" type="text" placeholder="Enter your full name" value={bookingData.customer_name} onChange={handleChange} required />
                </div>
                <div className="input-group">
                    <label htmlFor="customer_email">Email</label>
                    <input id="customer_email" name="customer_email" type="email" placeholder="Enter your email" value={bookingData.customer_email} onChange={handleChange} required />
                </div>
                <div className="input-group">
                    <label htmlFor="customer_phone">Phone</label>
                    <input id="customer_phone" name="customer_phone" type="tel" placeholder="Enter your phone number" value={bookingData.customer_phone} onChange={handleChange} />
                </div>
                <div className="booking-row">
                    <div className="input-group">
                        <label htmlFor="booking_date">Date</label>
                        <input id="booking_date" name="booking_date" type="date" value={bookingData.booking_date} onChange={handleChange} required />
                    </div>
                    <div className="input-group">
                        <label htmlFor="party_size">Guests</label>
                        <input id="party_size" name="party_size" type="number" min="1" value={bookingData.party_size} onChange={handleChange} required />
                    </div>
                </div>
                <div className="booking-row">
                    <div className="input-group">
                        <label htmlFor="start_time">Start time</label>
                        <input id="start_time" name="start_time" type="time" value={bookingData.start_time} onChange={handleChange} required />
                    </div>
                    <div className="input-group">
                        <label htmlFor="end_time">End Time</label>
                        <input id="end_time" name="end_time" type="time" value={bookingData.end_time} onChange={handleChange} required />
                    </div>
                </div>
                <button type="submit">Search available tables</button>
            </form>
        </section>
    );
}

export default BookingForm;