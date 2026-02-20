# OnTime

## **Core functionality**
We’ll create a device that will show you live public transport data of a specific stop in Prague. It’ll show you your bus/tram/metro, when the next one is coming, whether it’s delayed, and when you should leave to get there on time.

The frontend will let you input your data (stop, line, walking distance), and the server will regularly query PID for live data, after which it'll send the data to the device which will display it on a screen. The device will also display a QR code which will take you straight to the website.

## Ideas and Planning

The server and website will both be hosted on Azure. I’ll implement some simple continuous deployment workflows like last semester. We’ll work on it the same way as before, with feature branches that we’ll regularly merge into the main branch. The main branch will be the deployment (stable) branch.

The server will store the requested stops in a json file. I don’t think we need a proper database for this project since it only has to support one IoT device, but we can quickly deploy a postgres instance if needed.

The Hardwario device will have to receive the data from our server and display it on a screen. Idk how to do that yet. Also the screen we’ll be using doesn’t have Hardwario-compatible drivers, so we’ll have to modify and create our own drivers. The device also won’t have any input, BUT we could add that with a rotary encoder and buttons, such as switching screens to show a different bus,changing the temperature reading from C to F, switching the clock from 24 to 12 hour, stuff like that. Basically a settings page. We could even implement a way to select a stop from the device itself, but that’s a stretch goal.

The QR code: We can easily automate creating the QR code. We’ll have to create a way to take this data and encode it, likely as a 2D array, and send it to the device.

The website should be pretty simple since it only needs to let you select a stop and input some basic data. Since there are around 1500 stops, I’ve prepared data to allow for really fast autosuggestions using a trie, but we can honestly just skip it and have a search button that does a linear search instead, which would probably take less than 1 second anyway. If we want it to be cross-platform, React Native is the logical choice. This is up to y’all, I don’t mind.

## **Timeline**
1. **Prepare basic test endpoints for the server to allow frontend development (20/2)**
    - Send the name+id of each stop **done**
    - Send all the lines in a stop **done**
    - Get a hardcoded bus from PID **done**
    - Receive a stop request from the frontend and make a PID request for it - done, but needs documentation.
2. **Build the website and have it change the current stop**
    - The website should have a login so that random people can’t mess with our stuff. We’ll have to use JSON web tokens again.
    - Testing whether the server updated should be easy: The server can be edited to make a request to PID every second so you don’t have to wait an entire minute to check if it worked. **Ask me to change it.**  
    - The website should also display which stop is being tracked.
3. **Design and implement the hardwario to server gateway**
4. **Finish the server**
    - The server will use node-schedule for requesting live data and it should be really straightforward to set it up. I’ll add everyone to a Postman group and I’ll add API documentation.
    - Update the current stop and have it fetch new data every minute and send it to the hardwario device
    - Update the current stop
5. **Integrate the frontend and backend**
6. **Deploy the frontend and backend to Azure**
7. **Create drivers for the screen (this’ll take a while)**
8. **Show the stop info on the device**
**MVP is done here. Additional goals are just a bonus.**
9. **Implement the QR code**
    - The server needs a QR code generator
    - Encode the QR code, send it to the device, and display it
11. **Add extra stuff to the device, like the time, temperature, settings, etc**
      - Even additional stops, like depending on the position of the rotary encoder, it would display a different bus. With 12 positions, it could display 12 different stops.
