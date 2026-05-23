23/05/2026

# Server - Gateway
This spec describes gateway pairing, tower pairing, authentication, departure fetching, and departure distribution.,


## Gateway requests stop data from the server

This is actually the only endpoint that the gateway uses to interact with the server. Every minute, the gateway calls this endpoint and sends its ID, paired tower IDs, and authentication information.  

The signature, unixTime, and requestType variables relate to HMAC authentication. The server will read the secret stored in the database and generate the signature using the request type, gateway ID, and unix time that the gateway sent, and verify that the signatures match. The secret can be generated on the frontend, and must be copy/pasted to Node_Red by the user.  

Each gateway can have up to 5 towers, and each tower can have up to 2 departures.

Server logic:
1. Authentication & Verification: It first verifies that the gateway is assigned to a user. If it is, it then verifies the signature.
2. The server now verifies that each tower has either already been paired to the gateway or is not paired to any gateway. If not, it creates a new entry for each tower in the database.
3. It then reads all of the gateway's tower's assignments and makes a request to PID to fetch departures for those platforms.
4. PID returns a list of departures for each of those platforms and a departure that fulfills the criteria (correct line & time) is selected for each assignment.
5. The assignments are then encoded into the format as described in the Response section along with a timestamp and then sent to the gateway.
7. The gateway forwards this message to each tower. I decided to keep all towers on the same topic.

Endpoint: POST `/gateways/{gatewayId}/departures`  
Request Body:
```
{
	gatewayId: "c1895bf80e2b",
	unixTime: 1779545488497,
	signature: "e021913aba2a699622bb00eeb70b8d1aa5379a83ef2de6fa17f78e910bcd7135",
	requestType: "get_departures",
	"towerIds": [
		47774,
		72727,
		19992
	]
}
```

Response:  
The final result will be an array of all assignments of towers assigned to that gateway using a custom format. I decided to not use JSON since MQTT can only send 42 bytes at a time. Not having keys means the message size is reduced by roughly half.  
The charge is duplicated in each assignment to make parsing easier.  
```
	structure (not json):
	[
		time
		{
			towerId |
			charge |
			lineNumber |
			lineDirection |
			stopName |
			nextTime |
			leaveIn |
			type
		}
		{...like previous}
	]

	example:
	[14:25{547c65321d0b|70|B|Zlicin|Kolbenova|17:46|5m|1}{1547c65321d0b|99|177|Chodov|Vysocanska|17:52|15m|0}]
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
  "message": 'success' // or error on failure
} 
```
