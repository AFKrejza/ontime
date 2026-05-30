4/04/2026

Gateway notes: 
- run bcg manually: `bcg --device COM6 --debug`, COM6 is the port on my desktop, check what it is on my laptop  
- the tower subscrtiption topic is 4 levels deep: `assignment/-/data/set`  
- MQTT publish topic is `node/tower-ontime:0/assignment/-/data/set`  
- The payload must be a JSON-encoded string with outer quotes.  

# Gateway – Tower
This API specification covers health monitoring and display data transmission.  

## Tower sends health data to Gateway  
Endpoint: Radio  
Description: Tower sends regular health updates and requests current display data  
Request Body:  
```
{ 
	"towerId": "tower_001", 
	"timestamp": "2026-03-12T14:30:00Z", 
	"status": { 
		"batteryVoltage": 1.5 // float
	}
} 
```

## Gateway sends display data to one tower via radio.
Described in server-gateway.md
