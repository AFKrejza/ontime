31/03/2026

# Server - Gateway
This API specification covers Tower registration, status updates, and stop data distribution.


## Gateway requests stop data from the Server
This must support up to 5 towers, and each tower can have up to 2 departures.  
If it has only one departure, set the second departure’s properties as empty strings "" (or NULL it?).  
If PID didn't return any departures (failed API call / departure not found in the response), set the nextTime and leaveIn as empty strings.  
displayData is an array containing one entry per tower. Each entry's departures array can contain up to 2 departures.  
The server must:  
- Verify that those towers belong to that gateway  
- read the database to read all of that gateway's tower->stop assignments  
- make one request to PID, format it, and send the response.  
It's described a bit better in `./server-pid.md`  

Endpoint: GET `/gateway/{gatewayId}/departures`  
Headers: Authorization: Bearer gateway-token (23/03 ignore the header for the MVP)  
Request Body:
```
{
	"towerIds": [
		47774,
		72727,
		19992
	]
}
```

Response: 
```
{ 
	"timestamp": "2026-03-12T14:30:00Z", 
	"displayData": [
		{
			"towerId": 42345,
			"departures": [
				{
					"lineNumber": "136", // string, length 3
					"lineDirection": "Jizni Mesto", // string, length 15
					"stopName": "Vysocanska", // string, length 22, use display_ascii
					"nextTime": "15:50" // string, length 5
					"leaveIn": "10m", // string, length 3
					"type": 0, // The database stores the type as a string, so you gotta convert it to a number: enum from 0 to 5: 0 = bus, 1 = metro, 2 = tram, 3 = trolleybus, 4 = train, 5 = ferry; 
				}
			]
		}
	]
}
```

## Gateway registers new towers
Endpoint: POST `/api/gateway/register`  
Headers: Authorization: Bearer gateway-token  
Request Body:  
```
{ 
	"gatewayId": 1222223, 
	"name": "Living Room", 
	"towers": [ 
		{ 
			"towerId": 77b23727
		} 
	] 
} 
```
Response:  
```
{ 
	"gatewayToken": "eyJhbGciOiJIUzI1NiIs...", 
	"registeredTowers": [345727], 
}
```


## Gateway sends connected towers status
Endpoint: POST `/api/gateway/status`  
Headers: Authorization: Bearer gateway-token  
Request Body: 
```
{ 
	"gatewayId": 727777, 
	"timestamp": "2026-03-12T14:30:00Z", 
	"towers": [ 
		{ 
			"towerId": 5345454, 
			"connected": true, 
			"firmwareVersion": "1.0.0",
			"lastSeen": "2026-03-12T14:29:55Z", 
			"voltage": 1.48
		}, 
		{ 
			"towerId": "78567657", 
			"connected": false, 
			"firmwareVersion": "1.0.0",
			"lastSeen": "2026-03-12T14:20:00Z",
			‘voltage”: 1.44
		} 
	]
} 
```

Response:
```
{ 
  "success": true, 
} 
```

## Gateway registers itself to a user
Endpoint: POST `/api/users/{userId}/gateway/register`  
Headers: Authorization: Bearer gateway-token  
Request Body:  
```
{
	"id": 3622662 // some kind of unique device identifier
} 
```
Response:  
```
201
```
