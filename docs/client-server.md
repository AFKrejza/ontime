31/03/2026

TODO:

# Client - Server
This API specification covers user authentication, stop configuration, and system monitoring.



## Get all stops for autocomplete
Returns every stop's name, id, and display_ascii. Using the display_ascii property will make autocomplete and searching much easier.
Endpoint: GET `/trieData` 
Headers: Authorization: Bearer `jwt-token`  
Response:
```
[ 
	{ "name": "Albertov", "id": "1", "display_ascii": "albertov" }, 
	{ "name": "Ametystová", "id": "2", "display_ascii": "ametystova" }, 
	{ "name": "Amforová", "id": "3", "display_ascii": "amforova" },
	...
] 
```

## Get stop details with lines
Returns all the stop's lines grouped by type. The stopId is the `id` from `/trieData`.  
I could edit it to take slugs instead.  
Endpoint: GET `/stopGroups/:stopId`  
Headers: Authorization: Bearer `jwt-token`  
Response (mock):  
```
{ 
	"id": "1200", 
	"slug": "vysocanksa",
	"name": "Vysočanská",
	"displayAscii": "Vysocanska", 
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

## Login
Endpoint: POST `/api/auth/login`  
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

## Signup
Endpoint: POST `/api/auth/signup`
Request body:  
```
{ 
	"username": "admin", 
	"email": "johndoe@gmail.com",
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


## Get one gateway and its tower's statuses

Endpoint: GET `/api/gateway/:gatewayId/status`
Headers: Authorization: Bearer `jwt-token`  
Response:
```
{
	"gatewayId": "737737ffa", 
	"gatewayName": "Home",
	"towers": [ 
		{ 
			"id": "838838883", 
			"name": "Living Room",
			"battery": 1.44, 
			"lastSeen": "2026-03-12T14:29:55Z", 
			"assignment": {
				"departureOffset": -10, // must be <= 0
				"stopId": 1200, // generated in our database
				"lineId": 152, // the line ID from PID. e.g. metro b = 992, bus 136 = 136
				"gtfsId": "U474Z5P" // from PID
			},
			"stop": {
				"id": 1200,
				"slug": klicov",
				"name": Klíčov",
				"displayAscii": "Klicov"
			},
			"line": {
				"id": 152, 
				"slug": "ceskomoravska",
				"displayAscii": "Ceskomoravska",
				"name": "152", 
				"type": "bus", 
				"direction": "Českomoravská", 
				"gtfsId": "U474Z5P" 
			}
		}
	],
}
```

## List gateways
Endpoint: GET `/api/users/:userId/gateways/list`  
Headers: Authorization: Bearer `jwt-token`  
Response:  
```
{
	gateways: [
		{
			"id": 44,
			"name": "Living Room"
		},
		{
			"id": 45,
			"name": "Work"
		}
	]
}
```

## Rename gateways
Endpoint: PATCH `/api/gateways/:gatewayId`  
Headers: Authorization: Bearer `jwt-token`  
Request:  
```
{
	"name": "Home office"
}
```

Response:  
```
{
	"id": "45",
	"name": "Home office"
}
```

## Delete gateways
Endpoint: DELETE `/api/gateways/:gatewayId`  
Headers: Authorization: Bearer `jwt-token`  
Response:
```
{
	status: "Deleted" // something like that
}
```

## Get one tower and its assignments
This endpoint should be basically the same as "Get one gateway and its tower's statuses".  
Endpoint: GET `/api/towers/:towerId`  
Headers: Authorization: Bearer `jwt-token`  
```
{ 
	"id": "838838883", 
	"name": "Living Room",
	"battery": 1.44, 
	"lastSeen": "2026-03-12T14:29:55Z", 
	"assignment": {
		"departureOffset": -10, // must be <= 0
		"stopId": 1200, // generated in our database
		"lineId": 152, // generated in our DB
		"gtfsId": "U474Z5P" // from PID
	},
	"stop": {
		"id": 1200, // our db
		"slug": klicov",
		"name": Klíčov",
		"displayAscii": "Klicov"
	},
	"line": {
		"id": 1, // our db
		"pidId": 152, // from PID 
		"gtfsId": "U474Z5P" 
		"name": "152", 
		"displayAscii": "Ceskomoravska",
		"type": "bus", 
		"direction": "Českomoravská", 
	}
}
```

## Delete a tower
Unassign it from a gateway.  
Endpoint: DELETE `/api/gateways/:gatewayId/towers/:towerId`  
Headers: Authorization: Bearer `jwt-token`  
Response:  
```
{
	status: "removed"
}
```

## Add an assignment to a tower
There's a limit of 2 assignments per tower so it should fail if you try to add a third.
Endpoint: POST `api/gateway/:gatewayId/:towerId/addAssignment`  
Headers: Authorization: Bearer `jwt-token`  
Request Body:  
```
{
	"towerId": 7dd66ab22, // number
	"assignments": [
		{
			"departureOffset": -10, // must be <= 0
			"stopId": 1200, // generated in our database
			"lineId": 136, // the line ID from PID. e.g. metro b = 992, bus 136 = 136
			"gtfsId": "U474Z6P" // from PID
		}
	]
}
```

## Remove a tower's assignment
Endpoint: PUT `api/gateway/:gatewayId/towers/:towerId/assignments/:assignmentId`  
Headers: Authorization: Bearer `jwt-token`  
Response:
```
{
	"status": success
}
```

## Edit a tower's assignment
Endpoint: PATCH `api/gateway/:gatewayId/towers/:towerId/assignments/:assignmentId`
Headers: Authorization: Bearer `jwt-token`
Request:
```
{
	"stopId": 55,
	"lineId": 727,
	departureOffset: -15
}
```

