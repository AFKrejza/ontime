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
Allowed characters: letters, numbers, underscore, hyphen. Min 3, max 50 characters.
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

## Get user profile IMPLEMENTED
Endpoint: GET `/users/profile`  
Headers: Authorization: Bearer `jwt-token`  
This uses the JWT to get the ID.  
No request body.  
Response:  
```
{
	"username": "john",
	"email": "john@gmail.com",
    "createdAt": "2026-04-22T11:56:26.350Z",
    "id": 502
}
```

## Update a user's name/email IMPLEMENTED
Endpoint: PATCH `/users/update`  
Headers: Authorization: Bearer `jwt-token`  
Uses the JWT to get the ID.
Request body:  
```
{
	"username": "newname",
	"email": "newemail@gmai.com"
}
```
Response:
```
{
	"username": "newname",
	"email": "newemail@gmail.com",
    "id": 502
}
```

## Register a gateway to a user IMPLEMENTED
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


## Get one gateway and its tower's statuses IMPLEMENTED
Warning: A gateway won't register its towers until it's been registered to a user. Only then will you be able to see which towers are registered to it and add assignments to them.  
Endpoint: GET `/gateways/:gatewayId/status`  
Headers: Authorization: Bearer `jwt-token`  
Response:
```
{
	"gatewayId": "737737ffa", 
	"gatewayName": "Home",
	"towers": [ 
		{ 
			"towerId": "838838883", 
			"towerName": "Living Room",
			"battery": 1.44, 
			"lastSeen": "2026-03-12T14:29:55Z", 
			"assignments": [
				{
					"assignmentId": 26, // our DB
					"departureOffset": -10, // must be <= 0
					"stopId": 1200, // generated in our database
					"lineId": 152, // from our DB
					"gtfsId": "U474Z5P", // from PID
					"stop": {
						"id": 1200,
						"slug": klicov",
						"name": Klíčov",
						"displayAscii": "Klicov"
					},
					"line": {
						"id": 12400, 
						"pidId": 152,
						"gtfsId": "U474Z5P" 
						"name": "152", 
						"displayAscii": "Ceskomoravska",
						"type": "bus", 
						"direction": "Českomoravská", 
					}
				}
			]
		}
	],
}
```

## List a user's gateways IMPLEMENTED
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

## Rename a gateway IMPLEMENTED
Endpoint: PATCH `/gateways/:gatewayId/rename`  
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

## Delete a gateway IMPLEMENTED
Endpoint: DELETE `/gateways/:gatewayId`  
Headers: Authorization: Bearer `jwt-token`  
Response:
```
{
	"deleteCount": 1
}
```

## Get one tower and its assignments IMPLEMENTED
This endpoint should be basically the same as "Get one gateway and its tower's statuses".  
Endpoint: GET `/towers/:towerId`  
Headers: Authorization: Bearer `jwt-token`  
```
{ 
	"id": "838838883", 
	"name": "Living Room",
	"battery": 1.44, 
	"lastSeen": "2026-03-12T14:29:55Z", 
	"assignments": [
		{
			"assignmentId": 26, // our DB
			"departureOffset": -10, // from -30 to 0 inclusive
			"stopId": 1200, // our DB
			"lineId": 152, // our DB
			"gtfsId": "U474Z5P" // from PID
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
	]
}
```

## Delete a tower IMPLEMENTED 
Unassign it from a gateway. First it has to be unpaired from the gateway, then use this endpoint, and then the gateway has to be restarted to remove it from memory. Then it can be paired to another gateway (which is done by the gateway itself).  
Endpoint: DELETE `/towers/:towerId`  
Headers: Authorization: Bearer `jwt-token`  
Response:  
```
{
	deleteCount: 1
}
```

## Add an assignment to a tower IMPLEMENTED
When creating the assignment make sure that both IDs use the internal `id` our DB generated and not the `pid_id`!
There's a limit of 2 assignments per tower so it'll fail if you try to add a third. You must delete one of them first.  
The stopId is assigned by the server.  
Endpoint: POST `/towers/:towerId/addAssignment`  
Headers: Authorization: Bearer `jwt-token`  
Request Body:  
```
{
	"assignment": {
			"departureOffset": -10, // -30 <= x <= 0 integer
			"lineId": 10988, // generated by our DB
	}
}
```

## Delete all assignments belonging to a tower IMPLEMENTED
Endpoint: DELETE `/towers/:towerId/assignments/deleteAll`  
Headers: Authorization: Bearer `jwt-token`
No request body.  
Response:  
```
{
    "deleteCount": 2
}
```

## Remove a tower's assignment IMPLEMENTED
Endpoint: DELETE `/towers/:towerId/assignments/:assignmentId`  
Headers: Authorization: Bearer `jwt-token`  
Response:
```
{
	"status": success
}
```

## Rename a tower IMPLEMENTED
Endpoint: PATCH `/towers/:towerId`  
Headers: Authorization: Bearer `jwt-token`
Request:
```
{
	name: "newtowername"
}
```
Response:
{
    "id": "547c65321d0b",
    "gateway_id": "c1895bf80e2b",
    "name": "newtowername",
    "battery": null,
    "last_seen": null,
    "created_at": "2026-04-25T15:35:15.095Z",
    "updated_at": "2026-04-25T15:46:39.769Z"
}

```

