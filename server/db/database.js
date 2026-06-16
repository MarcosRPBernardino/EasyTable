const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "../../database/easytable.db");

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Error connecting to SQLite database:", err.message);
        return;
    }
    console.log("Connected to SQLite database.")

    db.run("PRAGMA foreign_keys = ON;", (pragmaErr) => {
        if (pragmaErr) {
            console.error("Error enabling foreign_keys:", pragmaErr.message);
        } else {
            console.log("Foreign key constraints enabled");
        }
    });
});

module.exports = db;