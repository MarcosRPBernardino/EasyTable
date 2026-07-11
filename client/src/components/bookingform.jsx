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
    const [selectTableId, setSelectTableId] = useState("");
    const [message, setMesssage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    function handleChange(event) {
        const { name, value } = event.target;

        setBookingData((currentData) => ({
            ...currentData,
            [name]: value,
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();

        setMesssage("");
        setAvailableTables([]);
        setSelectTableId("");

        if(!bookingData.start_time){
            return;
        }

        const endTime = calculateEndTime(bookingData.start_time, bookingData.duration_minutes);

        if(!endTime){
            console.log("Booking must end on same day");
            return;
        }

        const query = new URLSearchParams ({
            booking_date: bookingData.booking_date,
            start_time: bookingData.start_time,
            end_time: endTime,
            party_size: String(bookingData.party_size),
        });

        try{
            setIsLoading(true);

            const response = await fetch(`http://localhost:3000/api/tables/available?${query.toString()}`);
            const data = await response.json();

            if(!response.ok){
                setMesssage(data.message || "Unable to search available tables");
                return;
            }

            setAvailableTables(data);

            if(data.length === 0){
                setMesssage("No tables are available for the selected time");
            }
        }catch(error){
            console.error(error);
            setMesssage("Unable to connect to the server");
        }finally{
            setIsLoading(false);
        }
    }

    function calculateEndTime(startTime, durationMinutes) {
        const [hours, minutes] = startTime.split(":").map(Number);
        const totalMinutes = hours * 60 + minutes + Number(durationMinutes);

        if(totalMinutes >= 24 * 60){
            return null;
        }

        const endHours = Math.floor(totalMinutes / 60);
        const endMinutes = totalMinutes % 60;

        return `${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}`;
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
                        <label htmlFor="duration_minutes">Duration</label>
                        <select id="duration_minutes" name="duration_minutes" value={bookingData.duration_minutes} onChange={handleChange} required>
                            <option value="30">30 minutes</option>
                            <option value="60">1 hour</option>
                            <option value="90">1 hour 30 minutes</option>
                            <option value="120">2 hours</option>
                        </select>
                    </div>
                </div>
                <button type="submit" disabled={isLoading}>{isLoading ? "Searching..." : "Search available tables"}</button>
            </form>
        </section>
    );
}

export default BookingForm;