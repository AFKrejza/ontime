27/04/2026

# OUT OF DATE


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

Endpoint: GET `/gateways/{gatewayId}/departures`  
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
The gateway must first be assigned to a user via `/gateways/register` in client-server.md.  
The gateway will repeatedly try to register its towers but the server will only accept it once it exists in the database, meaning once a user has registered it.  
Endpoint: POST `/gateways/:gatewayId/towers/register`  
Headers: Authorization: Bearer gateway-token  
Request Body:  
```
{ 
	"gatewayId": 1222223, 
	"name": "Living Room", 
	"towers": [ 
		77b23727
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


## Gateway sends tower health data IMPLEMENTED
Each tower will periodically send its health data to the gateway, which will then forward it to the server.  
Towers send a string of length 16 which contains the tower ID and the charge level, separated by a comma.  
The charge can be any value from 100 at 3 volts to 0 at 2 volts.  
If the tower isn't using its battery, it'll send -1.  
Endpoint: POST `/gateways/health`  
Request Body:  
```
{ 
	"gatewayId": 727777,
	"towerId": 5345454, 
	"charge": "76"
} 
```

Response:
```
{ 
  "message": 1 // or 0 if it failed to update
} 
```

## Gateway registers itself to a user IMPLEMENTED
Endpoint: POST `/gateways/register`  
Headers: Authorization: Bearer gateway-token  
Request Body:  
```
{
	"id": "3622662aac" // the radio dongle ID
} 
```
Response:  
```
201
```

## Gateway sends tower health/battery data to the server IMPLEMENTED
Endpoint: POST `/gateways/health`  
Request Body:
```
{
	"gatewayId": "4994994",
	"towerId": 53444bce,
	"charge": 44 // percentage
}
```