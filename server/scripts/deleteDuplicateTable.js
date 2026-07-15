const db = require("../db/database");

db.run(
    `
    DELETE FROM restaurant_tables
    WHERE id = ?
    `,
    [9],
    function (error) {
        if (error) {
            console.error("Unable to delete duplicate table:", error.message);
            process.exit(1);
        }

        console.log(`Deleted rows: ${this.changes}`);
        process.exit(0);
    }
);