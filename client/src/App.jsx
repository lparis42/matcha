import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

import axios from 'axios';

async function reverseGeocode(latitude, longitude) {
  try {
    const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
    return response.data.display_name;
  } catch (error) {
    throw new Error('Request failed');
  }
}

const App = () => {

  const [socketConnected, setSocketConnected] = useState(false);
  const [position, setPosition] = useState(false);

  useEffect(() => {

    // Used to connect to the socket server
    const socket = io({ withCredentials: true, autoconnect: false });

    // Used to detect when the socket is connected
    socket.on('connect', async () => {
      console.log('Socket connected');

      const userData = {
        username: 'testuser',
        password: 'testpassword',
        email: 'email@client.com',
        last_name: 'Test',
        first_name: 'User',
        date_of_birth: '2000-01-01',
      };

      const geolocation = await new Promise((resolve, reject) => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        } else {
          reject(new Error('Geolocation is not supported by this browser.'));
        }
      });
      const address = await reverseGeocode(geolocation.coords.latitude, geolocation.coords.longitude);

      const newPosition = {
        latitude: geolocation.coords.latitude,
        longitude: geolocation.coords.longitude,
        address: address
      };

      socket.emit('client:gps', newPosition);
      setPosition(newPosition);

      // For testing purposes ****************************************************

      // Registration
      // socket.emit('client:registration', userData, (err, message) => {
      //   if (err) {
      //     console.error('Error:', err);
      //   } else {
      //     console.log('Success:', message);
      //   }
      //   // Login
      //   socket.emit('client:login', userData, (err, message) => {
      //     if (err) {
      //       console.error('Error:', err);
      //     } else {
      //       console.log('Success:', message);
      //     }
      //     // Forgot password
      //     socket.emit('client:passwordreset', { email: userData.email }, (err, message) => {
      //       if (err) {
      //         console.error('Error:', err);
      //       } else {
      //         console.log('Success:', message);
      //       }
      //       socket.emit('client:logout', (err, message) => {
      //         if (err) {
      //           console.error('Error:', err);
      //         } else {
      //           console.log('Success:', message);
      //         }
      //       });
      //     });
      //   });
      // });

      // End of testing *************************************************************

      setSocketConnected(true);
    });

    // Used to detect when the socket is disconnected
    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setSocketConnected(false);
    });

    // Used to detect when the socket connection fails
    socket.on('connect_error', (error) => {
      console.error('Connection failed:', error);
    });

    // Connect manually
    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      <h1>Client Vite + React</h1>
      <p>{socketConnected ? 'Socket is connected' : 'Socket is disconnected'}</p>
      {position 
    ? <>
        Latitude: {position.latitude}, 
        Longitude: {position.longitude} 
        <br />
        Address: {position.address}
      </>
    : 'No position'
  }    </div>
  );
};

export default App;