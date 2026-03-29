23/03/2026

# Client - Server
This API specification covers user authentication, stop configuration, and system monitoring.

## Get all stops for autocomplete DONE
Returns every stop's name and id.
Endpoint: GET `/trieData` 
Headers: Authorization: Bearer <jwt-token> 
Response:
```
[ 
	{ "name": "Albertov", "id": "albertov" }, 
	{ "name": "Ametystová", "id": "ametystova" }, 
	{ "name": "Amforová", "id": "amforova" },
	...
] 
```

## Get stop details with lines DONE
Returns all the stop's lines grouped by type. The stopId is the `id` from `/trieData`.  
Endpoint: GET `/stopGroups/:stopId`  
Headers: Authorization: Bearer <jwt-token>   
Response (partial):  
```
{ 
	"name": "Vysočanská", 
	"id": "vysocanska", 
	"lines": { 
		"tram": [ 
			{ 
				"id": 12, 
				"name": "12", 
				"type": "tram", 
				"direction": "Lehovec", 
				"gtfsId": "U474Z2P" 
			} 
		], 
		"bus": [ 
			{ 
				"id": 136, 
				"name": "136", 
				"type": "bus", 
				"direction": "Sídliště Čakovice", 
				"gtfsId": "U474Z5P" 
			},
			{ 
				"id": 152, 
				"name": "152", 
				"type": "bus", 
				"direction": "Českomoravská", 
				"gtfsId": "U474Z5P" 
			} 
		] 
	} 
}
```

## Add an assignment to a tower NOT IMPLEMENTED
This needs to be stored in the db.  
Endpoint: PUT `/gateway/:gatewayId/addStop`  
Request Body:  
```
{
	"towerId": "tower-667", // string
	"offset": -10, // must be a negative number
	"assignments": [
		{
			"stopName": "Vysočanská",
			"stopId": "vysocanska",
			"id": 136,
			"name": "136",
			"type": "bus",
			"direction": "Jižní Město",
			"gtfsId": "U474Z6P"
		}
	]
}
```

# Ignore authentication for now
## Authentication NOT IMPLEMENTED
Endpoint: POST /api/auth/login  
Request body:  
```
{ 
	"username": "admin", 
	"password": "securepassword" 
} 
```
Response:  
```
{ 
	"token": "eyJhbGciOiJIUzI1NiIs...", 
	"expiresIn": 86400, 
	"user": { 
		"id": 1, 
		"username": "admin", 
		"role": "admin" 
	} 
} 
```
