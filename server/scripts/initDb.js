const fs = require("fs");
const path = require("path");
const db = require("../db/database");

const schemaPath = path.join(__dirname, "../../database/schema.sql");

const schema = fs.readFileSync(schemaPath, "utf8");

db.exec(schema, (err) => {
    if (err) {
        console.error("Error creating database tables:", err.message);
        process.exit(1);
    }

    console.log("Database tables created successfully.");
    process.exit(0);
});