import sqlite3 from "sqlite3";
import fs from "node:fs/promises";

const db = new sqlite3.Database("./data/ontime.db", (err) => {
    if(err) console.log("SQLite connection erro:", err.message);
    else console.log("Successfully connected to ontime.db database");
});

// auto initializing all tables, only once at the start of the server  
db.serialize(()=> {
    
    db.run("PRAGMA foreign_keys = ON");
    // stop's id, name
    db.run(`CREATE TABLE IF NOT EXISTS stops (
        id TEXT PRIMARY KEY, 
        name TEXT NOT NULL
    )`);
    // line's id, stores stop's id; stops 1:N lines
    db.run(`CREATE TABLE IF NOT EXISTS lines (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        stop_id TEXT,
        line_number TEXT,
        type TEXT,
        direction TEXT,
        gtfsId TEXT,
        FOREIGN KEY (stop_id) REFERENCES stops(id) ON DELETE CASCADE
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP 
    )`);

    // tower's unique id, name, stop_id(ref), line gtfsId?, battery, stores user's stop, dongle_id; dongle 1:N towers  
    db.run(`CREATE TABLE IF NOT EXISTS towers (
        id TEXT PRIMARY KEY,
        name TEXT,
        stop_id TEXT,
        dongle_id TEXT,
        line_gtfsId TEXT,
        battery INTEGER DEFAULT 100,
        FOREIGN KEY (stop_id) REFERENCES stops(id),
        FOREIGN KEY (dongle_id) REFERENCES dongles(id) ON DELETE CASCADE
    )`);
    // dongle's id, user id(ref),  users 1:N dongles
    db.run(`CREATE TABLE IF NOT EXISTS dongles(
        id TEXT PRIMARY KEY, 
        user_id INTEGER,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )`)

    console.log("Database schema initialized")
});


// create/update tables - stops and lines, with data from stopDetail.json 
export async function createStopsLinesDB() {
    try { 
        const data = JSON.parse(await fs.readFile("./data/stopDetails.json", "utf-8"));

        db.serialize(() => {
            //db.run("PRAGMA foreign_keys = OFF");
            db.run("BEGIN TRANSACTION");

            // clean all values for lines bc they don't have FK connection
            db.run("DELETE FROM lines");
            //db.run("PRAGMA foreign_keys = ON");

            //if in table stops, stop exist -> ignore
            const insertStop = db.prepare("INSERT OR IGNORE INTO stops (id, name) VALUES (?, ?)");
            const insertLine = db.prepare("INSERT INTO lines (stop_id, line_number, type, direction, gtfsId) VALUES (?, ?, ?, ?, ?)");

            for (const stop of data) {
                // insert stop id and name into stop table
                insertStop.run(stop.id, stop.name);

                for (const type in stop.lines) {
                    for (const line of stop.lines[type]) {
                        // add each line separately
                        insertLine.run(stop.id, line.name, line.type, line.direction, line.gtfsId);
                    }
                }
            }

            insertStop.finalize();  
            insertLine.finalize();
            // end TRANSACTION
            db.run("COMMIT", (err) => {
                if (err) console.error("!!!Commit error:", err);
                else console.log("All data safely saved to ontime.db");});

            db.get("SELECT COUNT(*) as count FROM lines", (err, row) => {
                console.log(`Total lines in DB: ${row.count}`);});
        });
    } catch(err) {
        console.log("!!!stops and lines db not created", err.message);}
}

//creat new user - mock
export function createUser(username, callback) {
    const sql = `INSERT INTO users (username) VALUES (?)`;
    db.run(sql, [username], function(err) {
        if (err) console.error("!!!Error in creating a user:", err.message);
        else {
            console.log(`User ${username} was created with ID: ${this.lastID}`);
            if (callback) callback(this.lastID); 
        }
    });
}

// register Dongle and connect it to users(id)
export function registerDongle(dongle_id, user_id){
    // check first if user_id exists in users db
    db.get(`SELECT id FROM users WHERE id = ?`, [user_id], (err, row) => {
        if (err) return console.error(err.message);    
        if (!row) {
            console.error(`!!!Error user ${user_id} not exist, dongle registration cancelled`);
            return;
        }
        db.run(`INSERT INTO dongles(id, user_id) VALUES (?, ?)`,[dongle_id, user_id],(err) => {
            if(err) console.log("!!!Error in registernig dongle", err.message);
            else console.log(`Dongle ${dongle_id} was connected to user's ID: ${user_id}`);
        })
    });
}

// register tower and connect it to dongle(id)
export function registerTower(tower_id, tower_name, dongle_id){
    db.get(`SELECT id FROM dongles WHERE id = ?`, [dongle_id], (err, row) => {
        if (err) return console.error(err.message);    
        if (!row) {
            console.error(`!!!Error dongle ${dongle_id} not exist, tower registration cancelled`);
            return;
        }
        // create tower if dongle exist
        db.run(`INSERT INTO towers(id, name, dongle_id) VALUES (?, ?, ?)`,[tower_id,tower_name,dongle_id],(err) =>{
            if(err) console.log("!!!Error in registernig tower", err.message);
            else console.log(`Tower ${tower_id} registered and connected to dongle ${dongle_id}`);
        });
    });
}

// set tower for the given stop
export function setStopForTower(towerId, stopId) {
    const sql = `UPDATE towers SET stop_id = ? WHERE id = ?`;
    db.run(sql, [stopId, towerId], (err) => {
        if (err) console.error("!!!Error in connecting stop:", err.message);
        else console.log(`Tower ${towerId} connected on stop ${stopId}`);
    });
}


export default db;