require("dotenv").config({
    path: require("path").join(__dirname, "../.env"),
});


const bcrypt = require("bcrypt");
const db = require("../db/database");

async function seedDatabase() {
    const passwordHash = await bcrypt.hash(process.env.SEED_MANAGER_PASSWORD, 10)

    db.serialize(() => {
        db.run(
            `INSERT OR IGNORE INTO managers(full_name, email, password_hash)
            VALUES(?, ?, ?)`,
            [process.env.SEED_MANAGER_NAME, process.env.SEED_MANAGER_EMAIL, passwordHash]
        );

        const tables = [
            ["Table 1", 2, "Window Area"],
            ["Table 2", 4, "Main Floor"],
            ["Table 3", 6, "Main Floor"],
            ["Table 4", 8, "Outdoor Area"],
        ];

        const insertTable = db.prepare(
            `INSERT OR IGNORE INTO restaurant_tables (
                table_number,
                capacity,
                table_location
            )
            VALUES (?, ?, ?)`
        );

        tables.forEach(table => {
            insertTable.run(table);
        });

        insertTable.finalize();

        console.log("Seed data inserted successfuly!");
    });
}

seedDatabase();