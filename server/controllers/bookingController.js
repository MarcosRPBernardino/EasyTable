const { dbAll, dbGet, dbRun } = require("../db/sqliteHelpers");

async function getBookings(req, res) {
    try {
        const bookings = await dbAll(`
            SELECT
            bookings.id,
            bookings.customer_name,
            bookings.customer_email,
            bookings.customer_phone,
            bookings.booking_date,
            bookings.start_time,
            bookings.end_time,
            bookings.party_size,
            bookings.booking_status,
            bookings.table_id,
            restaurant_tables.table_number,
            restaurant_tables.table_location
            FROM bookings
            JOIN restaurant_tables ON bookings.table_id = restaurant_tables.id
            ORDER BY bookings.booking_date ASC, bookings.start_time ASC
            `);
        return res.status(200).json(bookings);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Unable to load bookings",
        });
    }
}

async function createBooking(req, res) {
    const {
        customer_name,
        customer_email,
        customer_phone,
        booking_date,
        start_time,
        end_time,
        party_size,
        table_id,
    } = req.body;

    const bookingPartySize = Number(party_size);
    const bookingTableId = Number(table_id);

    if (!customer_name || !customer_email || !booking_date || !start_time || !end_time || Number.isNaN(bookingPartySize) || bookingPartySize <= 0 || Number.isNaN(bookingTableId)) {
        return res.status(400).json({
            message: "Required booking fields are missing or invalid!",
        });
    }

    try {
        const table = await dbGet(
            `SELECT id, capacity
            FROM restaurant_tables
            WHERE id = ? AND is_active = 1`,
            [bookingTableId]
        );

        if (!table) {
            return res.status(404).json({
                message: "Table was not found"
            });
        }

        if (bookingPartySize > table.capacity) {
            return res.status(400).json({
                message: "Party size exceeds selected table capacity",
            });
        }

        const conflictingBooking = await dbGet(
            `
            SELECT id
            FROM bookings 
            WHERE table_id = ?
            AND booking_date = ?
            AND booking_status IN ('pending', 'confirmed')
            AND start_time < ?
            AND end_time > ?
            `,
            [bookingTableId, booking_date, end_time, start_time]
        );

        if (conflictingBooking) {
            return res.status(409).json({
                message: "This table is already booked for selected date and time."
            });
        }

        const result = await dbRun(
            `
            INSERT INTO bookings (
            customer_name,
            customer_email,
            customer_phone,
            booking_date,
            start_time,
            end_time,
            party_size,
            table_id
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [customer_name, customer_email, customer_phone || null, booking_date, start_time, end_time, bookingPartySize, bookingTableId,]
        );

        const newBooking = await dbGet(
            `
            SELECT *
            FROM bookings 
            WHERE id = ?
            `,
            [result.id]
        );

        return res.status(201).json({
            message: "Booking created successfully!",
            booking: newBooking,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Unable to create booking",
        });

    }
}

module.exports = {
    getBookings,
    createBooking,
};