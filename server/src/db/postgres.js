import pg, { Pool } from "pg";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

let pgVars;

if (process.env.LOCAL && process.env.LOCAL === 'true') {
	console.log('using local db environment');
	pgVars = {
		user: process.env.PGUSER,
		password: process.env.PGPASSWORD,
		host: process.env.PGHOST,
		port: process.env.PGPORT,
		database: process.env.PGDATABASE
	};
} else {
	console.log(`db url: ${process.env.DATABASE_URL}`);
	pgVars = {
		connectionString: process.env.DATABASE_URL,
		ssl: { rejectUnauthorized: false }
	};
}

export const pgClient = new pg.Pool(pgVars);

pgClient.on('error', (err, client) => {
	console.error('Unexpeceted error in idle client', err);
	process.exit(-1);
})

export async function initDB() {
	let filePath;
	if (process.env.LOCAL == 'true') {
		filePath = "../server/docker-entrypoint-initdb.d/init.sql";
	} else {
		filePath = path.resolve(process.cwd(), "./docker-entrypoint-initdb.d/init.sql");
	}
	const init = fs.readFileSync(filePath, "utf-8").toString();
	await pgClient.query(init);
}

export async function addMockData() {
	console.log("seeding db...");
	const mockData = fs.readFileSync(`./src/db/mockData.sql`).toString();
	await pgClient.query(mockData);
	console.log("seeding done");
}
