import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import SignInRegister from '../components/SigninRegister';

const App = () => {

  const [socketConnected, setSocketConnected] = useState(false);

  useEffect(() => {

    // Used to connect to the socket server
    const socket = io('ws://localhost:5173');

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

      // Registration
      socket.emit('client:registration', userData, (err, message) => {
        if (err) {
          console.error('Error:', err);
        } else {
          console.log('Success:', message);
        }
        // Login
        socket.emit('client:login', userData, (err, message) => {
          if (err) {
            console.error('Error:', err);
          } else {
            console.log('Success:', message);
          }
          // Forgot password
          socket.emit('client:password_reset', { email: userData.email }, (err, message) => {
            if (err) {
              console.error('Error:', err);
            } else {
              console.log('Success:', message);
            }
            socket.emit('client:logout', (err, message) => {
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
    <SignInRegister/>
  );
};

export default App;
