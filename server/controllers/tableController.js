const {dbAll, dbGet, dbRun} = require("../db/sqliteHelpers");

async function getTables(req, res) {
    try{
        const tables = await dbAll(
            `SELECT id, table_number, capacity, table_location, is_active
            FROM restaurant_tables
            WHERE is_active = 1
            ORDER BY id ASC`
        );
        return res.status(200).json(tables);
    } catch(error){
        console.error(error);
        return res.status(500).json({message: "Database error"});
    }
}

async function createTable(req, res) {
    const {table_number, capacity, table_location} = req.body;
    const tableCapacity = Number(capacity);

    if(!table_number || Number.isNaN(tableCapacity) || tableCapacity <= 0){
        return res.status(400).json({
            message: "Table number and capacity are required",
        });
    }

    try{
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
    }catch(error){
        console.error(error);
        return res.status(500).json({
            message:"Unable to create table",
        });
    }
}

async function updateTable(req, res) {
    const {id} = req.params;
    const {table_number, capacity, table_location} = req.body;
    const tableCapacity = Number(capacity);

    if(!table_number || Number.isNaN(tableCapacity) || tableCapacity <= 0){
        return res.status(400).json({
            message: "Table number and capacity required",
        });
    }

    try{
        const result = await dbRun(
            `UPDATE restaurant_tables
            SET table_number = ?, capacity = ?, table_location = ?
            WHERE id = ?`,
            [table_number, tableCapacity, table_location || null, id]
        );

        if(result.changes === 0){
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
    }catch (error){
        console.error(error);
        return res.status(500).json({
            message: "Unable to update table",
        });
    }
}

async function deleteTable(req, res) {
    const {id} = req.params;

    try{
        const result = await dbRun(
            `UPDATE restaurant_tables
            SET is_active = 0
            WHERE id = ?`,
            [id]
        );

        if(result.changes === 0){
            return res.status(404).json({
                message: "Table not found",
            });
        }
        return res.status(200).json({
            message: "Table deactivated successfully"
        });
    }catch(error){
        console.error(error);
        return res.status(500).json({
            message: "Unable to deactivate table",
        });
    }
}

module.exports = {
    getTables,
    createTable,
    updateTable,
    deleteTable,
};