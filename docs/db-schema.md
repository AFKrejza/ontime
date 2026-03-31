31/03/2026  

**Everything that communicates with the DB should be put into `dao/`**

## Using the postgres container:  

I put the schema into `init.sql`. Path: `server/docker-entrypoint-initdb.d/init.sql`.  

1. Download and run Docker Desktop  
2. Go to the `server` dir, and run `docker compose up -d` to start it (the `-d` flag lets you keep using that terminal)  
3. Start the server with `npm start` and it'll print the current date. If it failed it'll print an error  

More useful stuff:  
If you wanna wipe ALL the data in the local database, run `docker compose down -v`.  
You can turn it off either in Docker Desktop or with `docker compose down`.  

To directly access the Postgres database via psql:  
Open a shell within the docker container:  
`docker exec -it ontime_db sh`  
In the same window, run  
`psql -U postgres -d ontime`  
This will run psql and allow you to interact with the postgres database.  
Examples:  
List all tables:  
`\dt`  
View all users and user data:  
`SELECT * FROM users;`  
To exit psql:  
`exit`, or just ctrl+d  

View what docker containers are running:  
`docker ps`  

View real-time logs:  
`docker compose logs -f`  



users 1:N gateways  
gateways 1:N towers  
towers 1:N assignments  
assignments 1:1 stops  
assignments 1:1 stops  
stops M:N lines, stops_lines table  

## Terminology
`name` is the original `uniqueName` for stops, or the `name` for lines. This will be displayed on the frontend.  
`slug` is the URL friendly version of the name, meaning the diacritics are removed, it's lowercased, and spaces are replaced with hyphens -.  
`display_ascii` is what will actually be displayed on a tower's screen, so it's the same as `name` except without diacritics.  

Example:
```
"name": "Jižní Město",
"slug": "jizni-mesto",
"display_ascii": "Jizni Mesto"
```


## Users
```
users (
	id SERIAL PRIMARY KEY,
	username TEXT UNIQUE NOT NULL,
	password_hash TEXT NOT NULL,
	email TEXT UNIQUE NOT NULL,
	created_at TIMESTAMPTZ DEFAULT NOW(),
	updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

## Gateways
```
gateways (
	id SERIAL PRIMARY KEY,
	user_id INTEGER NOT NULL,
	name TEXT NOT NULL,
	FOREIGN KEY (user_id) REFERENCES users(id),
	created_at TIMESTAMPTZ DEFAULT NOW(),
	updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

## Towers
```
towers (
	id SERIAL PRIMARY KEY,
	gateway_id INTEGER NOT NULL,
	name TEXT NOT NULL,
	battery_voltage REAL DEFAULT NULL,
	last_seen DATETIME DEFAULT NULL,
	FOREIGN KEY (gateway_id) REFERENCES gateways(id) ON DELETE CASCADE,
	created_at TIMESTAMPTZ DEFAULT NOW(),
	updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

## Assignments
```
assignments (
	id SERIAL PRIMARY KEY,
	tower_id INTEGER NOT NULL,
	stop_id INTEGER NOT NULL,
	line_id INTEGER NOT NULL,
	departure_offset INTEGER NOT NULL,
	constraint departure_offset_nonpositive check (departure_offset <= 0),
	FOREIGN KEY (tower_id) REFERENCES towers(id),
	FOREIGN KEY (stop_id) REFERENCES stops(id),
	FOREIGN KEY (line_id) REFERENCES lines(id),
	created_at TIMESTAMPTZ DEFAULT NOW(),
	updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

## Stops
```
stops (
	id SERIAL PRIMARY KEY,
	slug TEXT UNIQUE NOT NULL,
	name TEXT NOT NULL,
	display_ascii TEXT NOT NULL,
	created_at TIMESTAMPTZ DEFAULT NOW(),
	updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

## Lines
`id` is the one that's in the original data.
```
lines (
	id INTEGER PRIMARY KEY,
	slug TEXT UNIQUE NOT NULL,
	name TEXT NOT NULL,
	display_ascii TEXT NOT NULL,
	type INTEGER NOT NULL,
	direction TEXT NOT NULL,
	gtfsId TEXT NOT NULL,
	created_at TIMESTAMPTZ DEFAULT NOW(),
	updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

## Stops_Lines junction table
```
stops_lines (
	stop_id INTEGER,
	line_id INTEGER,
	PRIMARY KEY (stop_id, line_id),
	FOREIGN KEY (stop_id) REFERENCES stops(id) ON DELETE CASCADE,
	FOREIGN KEY (line_id) REFERENCES lines(id) ON DELETE CASCADE,
	created_at TIMESTAMPTZ DEFAULT NOW(),
)
```

### Additional functions
This function updates the `updated_at` field to now.

```
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
	NEW.updated_at = NOW();
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

Then applied it to each table:
```
CREATE OR REPLACE TRIGGER set_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE OR REPLACE TRIGGER set_updated_at BEFORE UPDATE ON gateways FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE OR REPLACE TRIGGER set_updated_at BEFORE UPDATE ON towers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE OR REPLACE TRIGGER set_updated_at BEFORE UPDATE ON assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE OR REPLACE TRIGGER set_updated_at BEFORE UPDATE ON lines FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE OR REPLACE TRIGGER set_updated_at BEFORE UPDATE ON stops FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```
