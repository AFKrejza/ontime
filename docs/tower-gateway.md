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
Each tower should support 2 stops. If no stops were selected, all the fields must be empty strings. If only one stop was selected, the second one must have all its fields be empty strings.
Response Body:  
```
{ 
	"timestamp": "2026-03-12T14:30:00Z", 
	"lines": [
		{
			"headsign": "136 Jizni Mesto", // string
			"stop_name": "Vysocanska", // string
			"type": "0", // number (enum) from 0 to 5: 0 = bus, 1 = metro, 2 = tram, 3 = trolleybus, 4 = train, 5 = ferry
			"leave_in": "10m", // string length 3
			"next_time": "15:50", // string length 5
		},
		{
			"headsign": "151 Ceskomoravska", // string
			"stop_name": "Klicov", // string
			"type": "0", // number (enum) from 0 to 5: 0 = bus, 1 = metro, 2 = tram, 3 = trolleybus, 4 = train, 5 = ferry
			"leave_in": "10m", // string length 3
			"next_time": "15:50", // string length 5
		}
	]
}  
```
