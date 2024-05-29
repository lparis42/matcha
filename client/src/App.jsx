import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const App = () => {

  const [socketConnected, setSocketConnected] = useState(false);

  useEffect(() => {

    // Used to connect to the socket server
    const socket = io({ autoconnect: false });

    // Used to detect when the socket is connected
    socket.on('connect', () => {
      console.log('Socket connected');

      const userData = {
        username: 'testuser',
        password: 'testpassword',
        email: 'email@client.com',
        last_name: 'Test',
        first_name: 'User',
        date_of_birth: '2000-01-01',
      };
      
      // For testing purposes ****************************************************

      // Register
      socket.emit('register', userData, (err, message) => {
        if (err) {
          console.error('Error:', err);
        } else {
          console.log('Success:', message);
        }
        // Login
        socket.emit('login', userData, (err, message) => {
          if (err) {
            console.error('Error:', err);
          } else {
            console.log('Success:', message);
          }
          // Forgot password
          socket.emit('forgot', { email: userData.email }, (err, message) => {
            if (err) {
              console.error('Error:', err);
            } else {
              console.log('Success:', message);
            }
            socket.emit('logout', (err, message) => {
              if (err) {
                console.error('Error:', err);
              } else {
                console.log('Success:', message);
              }
            });
          });
        });
      });

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
    </div>
  );
};

export default App;