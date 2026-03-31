23/03/2026

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
Each tower should support up to 2 stops. If no stops were selected, all the fields must be empty strings or NULL. If only one stop was selected, the second one must have all its fields be empty strings (or just have the second object be NULL).
Body:  
```
{ 
	"timestamp": "2026-03-12T14:30:00Z", 
	"lines": [
		{
			"lineNumber": "136", // string, length 3
			"lineDirection": "Jizni Mesto", // string, length 15
			"stopName": "Vysocanska", // string, length 22, use the stop id which has no diacritics
			"nextTime": "15:50" // string, length 5
			"leaveIn": "10m", // string, length 3
			"type": "0", // The database stores the type as a string, so you gotta convert it to a number: enum from 0 to 5: 0 = bus, 1 = metro, 2 = tram, 3 = trolleybus, 4 = train, 5 = ferry; 
		},
		{
			like above
		}
	]
}  
```
