29/03/2026

# Server - Gateway
This API specification covers Tower registration, status updates, and stop data distribution.


## Gateway requests stop data from the Server NOT IMPLEMENTED
This must support multiple towers, and each tower can have up to 2 departures.  
If it has only one departure, set the second departure’s properties as empty strings "".  
If PID didn't return any departures (failed API call / departure not found in the response), set the nextTime and leaveIn as empty strings.  
displayData is an array containing one entry per tower. Each entry's departures array can contain up to 2 departures.  
The server must: read the database to read all of that gateway's tower->stop assignments, then make one request to PID, format it, and send the response. It's described a bit better in `./server-pid.md`  

Endpoint: GET `/gateway/{gatewayId}/departures`  
Headers: Authorization: Bearer gateway-token (23/03 ignore the header for the MVP)  
Response: 
```
{ 
	"timestamp": "2026-03-12T14:30:00Z", 
	"displayData": [
		{
			"towerId": "tower_001",
			"departures": [
				{
					"lineNumber": "136", // string, length 3
					"lineDirection": "Jizni Mesto", // string, length 15
					"stopName": "Vysocanska", // string, length 22, use the stop id which has no diacritics
					"nextTime": "15:50" // string, length 5
					"leaveIn": "10m", // string, length 3
					"type": "0", // number, enum from 0 to 5: 0 = bus, 1 = metro, 2 = tram, 3 = trolleybus, 4 = train, 5 = ferry;
				}
			]
		}
	]
}
```

## Gateway registers new towers NOT IMPLEMENTED
Endpoint: POST `/api/gateway/register`  
Headers: Authorization: Bearer gateway-token  
Request Body:  
```
{ 
	"gatewayId": "gateway_001", 
	"location": "Living Room", 
	"towers": [ 
		{ 
			"towerId": "tower_001"
		} 
	] 
} 
```
Response:  
```
{ 
	"gatewayToken": "eyJhbGciOiJIUzI1NiIs...", 
	"registeredTowers": ["tower_001"], 
}
```


## Gateway sends connected towers status NOT IMPLEMENTED
Endpoint: POST `/api/gateway/status`  
Headers: Authorization: Bearer gateway-token  
Request Body: 
```
{ 
	"gatewayId": "gateway_001", 
	"timestamp": "2026-03-12T14:30:00Z", 
	"towers": [ 
		{ 
			"towerId": "tower_001", 
			"connected": true, 
			"firmwareVersion": "1.0.0",
			"lastSeen": "2026-03-12T14:29:55Z", 
			"voltage": 1.48
		}, 
		{ 
			"towerId": "tower_002", 
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

