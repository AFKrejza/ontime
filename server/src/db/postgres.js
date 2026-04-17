import pg, { Pool } from "pg"
import dotenv from "dotenv"
import fs from "fs"

dotenv.config();

export const pgClient = new pg.Pool({
	user: process.env.PGUSER,
	password: process.env.PGPASSWORD,
	host: process.env.PGHOST,
	port: process.env.PGPORT,
	database: process.env.PGDATABASE
});
// TODO: for Azure deployment: add ssl

pgClient.on('error', (err, client) => {
	console.error('Unexpeceted error in idle client', err);
	process.exit(-1);
})

// TODO: This shouldn't exist!!! Remove it!!
export async function initDB() {
	const init = fs.readFileSync("../server/docker-entrypoint-initdb.d/init.sql").toString();
	await pgClient.query(init);
}

export async function addMockData() {
	console.log("seeding db...");
	const mockData = fs.readFileSync(`./src/db/mockData.sql`).toString();
	await pgClient.query(mockData);
	console.log("seeding done");
}
