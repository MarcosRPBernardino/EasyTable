const { dbAll, dbGet, dbRun } = require("../db/sqliteHelpers");

async function getTables(req, res) {
    try {
        const tables = await dbAll(
            `SELECT id, table_number, capacity, table_location, is_active
            FROM restaurant_tables
            WHERE is_active = 1
            ORDER BY id ASC`
        );
        return res.status(200).json(tables);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Database error" });
    }
}

async function createTable(req, res) {
    const { table_number, capacity, table_location } = req.body;
    const tableCapacity = Number(capacity);

    if (!table_number || Number.isNaN(tableCapacity) || tableCapacity <= 0) {
        return res.status(400).json({
            message: "Table number and capacity are required",
        });
    }

    try {
        const result = await dbRun(
            `INSERT INTO restaurant_tables (table_number, capacity, table_location)
            VALUES (?, ?, ?)`,
            [table_number, tableCapacity, table_location || null]
        );

        const newTable = await dbGet(
            `SELECT id, table_number, capacity, table_location, is_active
            FROM restaurant_tables
            WHERE id =?`,
            [result.id]
        );

        return res.status(201).json({
            message: "Table created successfully",
            table: newTable,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Unable to create table",
        });
    }
}

async function updateTable(req, res) {
    const { id } = req.params;
    const { table_number, capacity, table_location } = req.body;
    const tableCapacity = Number(capacity);

    if (!table_number || Number.isNaN(tableCapacity) || tableCapacity <= 0) {
        return res.status(400).json({
            message: "Table number and capacity required",
        });
    }

    try {
        const result = await dbRun(
            `UPDATE restaurant_tables
            SET table_number = ?, capacity = ?, table_location = ?
            WHERE id = ?`,
            [table_number, tableCapacity, table_location || null, id]
        );

        if (result.changes === 0) {
            return res.status(404).json({
                message: "Table not found",
            });
        }

        const updatedTable = await dbGet(
            `SELECT id, table_number, capacity, table_location, is_active
            FROM restaurant_tables
            WHERE id = ?`,
            [id]
        );

        return res.status(200).json({
            message: "Table updated successfully",
            table: updatedTable,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Unable to update table",
        });
    }
}

async function deleteTable(req, res) {
    const { id } = req.params;

    try {
        const result = await dbRun(
            `UPDATE restaurant_tables
            SET is_active = 0
            WHERE id = ?`,
            [id]
        );

        if (result.changes === 0) {
            return res.status(404).json({
                message: "Table not found",
            });
        }
        return res.status(200).json({
            message: "Table deactivated successfully"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Unable to deactivate table",
        });
    }
}

async function getAvailableTables(req, res) {
    const { booking_date, start_time, end_time, party_size, } = req.query;
    const bookingPartySize = Number(party_size);

    if (!booking_date || !start_time || !end_time || Number.isNaN(bookingPartySize) || bookingPartySize <= 0) {
        return res.status(400).json({
            message: "Missing or invalid search parameters"
        });
    }

    if (start_time >= end_time) {
        return res.status(400).json({
            message: "End time must be later than start time",
        });
    }

    const today = new Date();
    const selectedDate = new Date(`${booking_date}T00:00:00`);

    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
        return res.status(400).json({
            message: "Booking date cannot be in the past",
        });
    }

    try {
        const availableTables = await dbAll(
            `
            SELECT restaurant_tables.id, restaurant_tables.table_number, restaurant_tables.capacity, restaurant_tables.table_location
            FROM restaurant_tables
            WHERE restaurant_tables.is_active = 1
            AND restaurant_tables.capacity >= ?
            AND NOT EXISTS(
            SELECT 1
            FROM bookings 
            WHERE bookings.table_id = restaurant_tables.id
            AND bookings.booking_date = ?
            AND LOWER(bookings.booking_status) IN ('pending', 'confirmed')
            AND bookings.start_time < ?
            AND bookings.end_time > ?
            )
            ORDER BY restaurant_tables.capacity ASC, restaurant_tables.table_number ASC
            `,
            [bookingPartySize, booking_date, end_time, start_time,]
        );
        return res.status(200).json(availableTables);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Unable to load available tables"
        });
    }
}

module.exports = {
    getTables,
    getAvailableTables,
    createTable,
    updateTable,
    deleteTable,
};