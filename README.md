# HKUCS FYP Back End Server for Ridesharing App

This repository implemented a Nodejs webserver for our ride-sharing app with two matching algorithms, an originated greedy algorithm and an advanced algorithm from the academic paper "On-demand high-capacity ride-sharing via dynamic trip-vehicle assignment" (https://www.pnas.org/content/114/3/462). Two algorithms are evaluated using both real-world test cases and a grid world simulator.

Project Homepage: https://i.cs.hku.hk/fyp/2018/fyp18028/
Also see the App repository: https://github.com/eric19960304/Ridesharing-App-For-HK

prerequisite:

1. nodejs version 10.x.x installed

2. clean mongodb running on localhost:27017 ( [Windows](https://stackoverflow.com/questions/20796714/how-do-i-start-mongo-db-from-windows) | [Mac](https://stackoverflow.com/questions/18452023/installing-and-running-mongodb-on-osx) )

3. yarn with version >=1.12.3 installed

4. redis running on port 6379 (default port)


Required enviroment variables in server (see `config.js` file):
* MONGODB_PASSWORD
* PROD
* JWT_SECRET
* GMAIL_PASSWORD (for hkucsfyp2018threeriders@gmail.com, you can change the email address in config.js)
* GOOGLE_MAP_API_KEY



To install all the packages (under project's root directory):

`yarn`

To run the server in development mode:

`yarn start`

To run the server in production mode (all env variables should be set):

`yarn run prod`


All Restful API endpoints:
```
/auth/login
/auth/signup
/auth/signup/activate/:token
/auth/reset-password/request
/auth/reset-password/:token                 // serve the reset password form
/auth/reset-password/:token                // handle reset password form
/api/secret/google-map-api-key 
/api/driver/update                         // for updating driver's current location
/api/driver/get-all-drivers-location       // for passenger to get all the drivers' current location
/api/rider/real-time-ride-request         // for passenger to sumbit ride request (start & end locations and other info)
/api/rider/get-all-real-time-ride-request // for driver to get all the ride requests and display to map when idle
/api/user/edit-profile
/api/user/edit-profile-with-password
/api/user/push-token
/api/user/unread-messages-count
/notify-match-result/real-time-ride       // for internal use only
```


# Matching Engine

prerequisite:

1. Python >=3.6

2. pip3 (which is for python 3) command avaliable in your terminal

3. clean mongodb running on localhost:27017 ( [Windows](https://stackoverflow.com/questions/20796714/how-do-i-start-mongo-db-from-windows) | [Mac](https://stackoverflow.com/questions/18452023/installing-and-running-mongodb-on-osx) )

4. redis running on port 6379 (default port)



To install all the packages:

`pip install -r requirements.txt` (under root directory)

To run the matching engine:

`python engine.py greedy` or `python engine.py dynamic` (under /matchingEngine directory)

where greedy means to use greedy algorihms and means to use "On-demand high-capacity ride-sharing via dynamic trip-vehicle assignment".


# Grid World Simulator

<img src="https://raw.githubusercontent.com/eric19960304/Ridesharing-App-For-HK-Back-End/master/images/demo/grid_world.png" width="500">

(image source: [website](https://towardsdatascience.com/training-an-agent-to-beat-grid-world-fac8a48109a8))

<img src="https://raw.githubusercontent.com/eric19960304/Ridesharing-App-For-HK-Back-End/master/images/testing/100_1000.png" width="900">


The grid world simulator will generate fixed number of drivers at the beginning at random locations and generate a sequences of random requests. Then, the grid world will pass the generated drivers and sequences of requests to both greedy and the "On-demand high-capacity ride-sharing via dynamic trip-vehicle assignment" (dynamic for short) for simulation. Every 10 time units, matching will be conducted, and matched drivers will start move toward their best routes to serve all the ongoing rides assigned to them. After the requests sequences is consumed, matching will not be conducted anymore, and the drivers will finish their remaining rides, then the simulation will end and statistics will be generated using matplotlib.


To run the simulator:

`python simulator.py` (under /matchingEngine directory)


you can adjust the parameters at the (almost) bottom of the simulator.py file.


# Integration Test


<img src="https://raw.githubusercontent.com/eric19960304/Ridesharing-App-For-HK-Back-End/master/images/testing/case2.png" width="900">

<img src="https://raw.githubusercontent.com/eric19960304/Ridesharing-App-For-HK-Back-End/master/images/testing/case2_ios_requests.png" width="400"> <img src="https://raw.githubusercontent.com/eric19960304/Ridesharing-App-For-HK-Back-End/master/images/testing/case2_ios_drivers.png" width="400">


Test Results:
- Greedy Algo.: (R1, D1)
- Dynamic Algo.: (R1, D2) & (R3, D1)


Steps to run integration test:

1. Redis, MongoDB, and the back-end server running

2. run the test script "caseStudy.py" (under /testing directory)

`python caseStudy.py 1` for case 1 or `python caseStudy.py 2` for case 2

3. [optional] you can now run the front end Expo client to observe the requests path and drivers icon

4. run the matching engine "engine.py" (under /matchingEngine directory) to see the result

`python engine.py greedy` and `python engine.py dynamic`



# List of used Redis keys

1. realTimeRideRequest

A redis list that act as a match queue, where each element in list is a JSON string representing a ride request from passengers.

Structure of a ride request JSON:
```
{
    id: string,
    userId: string,
    startLocation: {
        latitude: number,
        longitude: number
    },
    endLocation: {
        latitude: number,
        longitude: number
    }
    timestamp: number,
    estimatedOptimal: { distance: number, duration: number },   //  distance in meters, duration in seconds, calculated in front-end
}
```

2. driverLocation

A redis hash with driver's userId as key, a JSON string representing his/her location as value.

Structure of the location JSON:
```
{
    "location":  {
        "accuracy": number,
        "altitude": number,
        "altitudeAccuracy": number,
        "heading": number,
        "latitude": number,
        "longitude": number,
        "speed": number
    },
    "timestamp": number
}
```

3. driverOngoingRide

A redis hash with driver's userId as key, a JSON string representing a list of his/her matched and ongoing ride(s) details as value

Structure of the ride details JSON:
```
[
    {
        id: string,
        userId: string,   // matched rider id
        startLocation: {
            latitude: number,
            longitude: number
        },
        endLocation: {
            latitude: number,
            longitude: number
        }
        timestamp: number,
        isOnCar: false,     // indicate if the passenger is on the car. Detected everytime driver upload its location to server, assumming that the driver will pick up the passengers when they are close geographically
        estimatedOptimal: { distance: number, duration: number },  //  distance in meters, duration in seconds, calculated in front-end
        estimatedWaitingCost: { distance: number, duration: number }, // distance in meters, duration in seconds, calculated during matching
    },
    ...
]
```
