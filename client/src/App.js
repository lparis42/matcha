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
        email: 'test@test.fr',
        last_name: 'Test',
        first_name: 'User',
        date_of_birth: '2000-01-01',
      };

      socket.emit('register', userData, (err, message) => {
        if (err) {
          console.error('Error:', err);
        } else {
          console.log('Success:', message);
        }
        socket.emit('login', userData, (err, message) => {
          if (err) {
            console.error('Error:', err);
          } else {
            console.log('Success:', message);
          }
        });
      });

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
      <h1>Client React</h1>
      <p>{socketConnected ? 'Socket is connected' : 'Socket is disconnected'}</p>
    </div>
  );
};

export default App;