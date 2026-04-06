import fetch from 'node-fetch';

const testData = {
  offset: 5,
  stopName: 'Test Stop',
  stopId: 'teststop',
  line: {
    id: 1,
    name: '1',
    type: 'bus',
    direction: 'Test Direction',
    gtfsId: 'GTFS1'
  }
};

try {
  const response = await fetch('http://localhost:3000/addStop', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(testData)
  });

  console.log('Status:', response.status);
  const text = await response.text();
  console.log('Response:', text);
} catch (err) {
  console.error('Error:', err);
}