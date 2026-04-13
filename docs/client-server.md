13/04/2026

# Client - Server
This API specification covers user authentication, stop configuration, and system monitoring.



## Get all stops for autocomplete IMPLEMENTED
Returns every stop's name, id, and display_ascii. Using the display_ascii property will make autocomplete and searching much easier.
Endpoint: GET `/trieData` 
Headers: Authorization: Bearer `jwt-token`  
Response:
```
[ 
	{ "id": "1", "slug": "albertov", "name": "Albertov" }, 
	{ "id": "2", "slug": "ametystova", "name": "Ametystová" }, 
	{ "id": "3", "slug": "amforova", "name": "Amforová" }
	...
] 
```

## Get stop details with lines IMPLEMENTED
Returns all the stop's lines grouped by type. `slug` is from `/trieData`.  
Endpoint: GET `/stopGroups/:slug`  
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

## Login IMPLEMENTED
Endpoint: POST `/auth/login`  
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
	"token": "eyJhbGciOiJIUzI1NiIs..."
} 
```

## Signup IMPLEMENTED
Endpoint: POST `/auth/signup`
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
	"message": "User registered.",
	"token": "eyJhbGciOiJIUzI1NiIs..."
} 
```

## Register a gateway to a user
Endpoint: POST `/gateways/register`  
Headers: Authorization: Bearer `jwt-token`  
Request:  
```
{
	"gatewayId": "477277abca",
	"gatewayName": "Office"
}
```
Response:  
```
{
	"id": "477277abca",
	"userId": 332,
	"name": "Office",
	"createdAt": "2026-03-12T14:29:55Z"
}
```


## Get one gateway and its tower's statuses

Endpoint: GET `/gateways/:gatewayId/status`
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
				"lineId": 152, // from our DB
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
Endpoint: GET `/users/:userId/gateways/list`  
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
Endpoint: PATCH `/gateways/:gatewayId`  
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
Endpoint: DELETE `/gateways/:gatewayId`  
Headers: Authorization: Bearer `jwt-token`  
Response:
```
{
	status: "Deleted" // something like that
}
```

## Get one tower and its assignments
This endpoint should be basically the same as "Get one gateway and its tower's statuses".  
Endpoint: GET `/towers/:towerId`  
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
Endpoint: DELETE `/gateways/:gatewayId/towers/:towerId`  
Headers: Authorization: Bearer `jwt-token`  
Response:  
```
{
	status: "removed"
}
```

## Add an assignment to a tower
When creating the assignment make sure that `line_id` uses the internal `id` our DB generated and not the `pid_id`!
There's a limit of 2 assignments per tower so it should fail if you try to add a third.
Endpoint: POST `/gateways/:gatewayId/:towerId/addAssignment`  
Headers: Authorization: Bearer `jwt-token`  
Request Body:  
```
{
	"towerId": 7dd66ab22, // number
	"assignments": [
		{
			"departureOffset": -10, // must be <= 0
			"stopId": 1200, // id field
			"lineId": 136, // id field
			"gtfsId": "U474Z6P" // from PID
		}
	]
}
```

## Remove a tower's assignment
Endpoint: PUT `/gateways/:gatewayId/towers/:towerId/assignments/:assignmentId`  
Headers: Authorization: Bearer `jwt-token`  
Response:
```
{
	"status": success
}
```

## Edit a tower's assignment
Endpoint: PATCH `/gateways/:gatewayId/towers/:towerId/assignments/:assignmentId`
Headers: Authorization: Bearer `jwt-token`
Request:
```
{
	"stopId": 55,
	"lineId": 727,
	departureOffset: -15
}
```

