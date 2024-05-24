import React, { useEffect, useState } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

const App = () => {
  const [data, setData] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);

  useEffect(() => {
    // Used to fetch data from the server
    const fetchData = async () => {
      try {
        const response = await axios.get('https://localhost:443/robots.txt');
        setData(response.data);
      } catch (error) {
        console.error('Error fetching data', error);
      }
    };
    fetchData();

    // Used to connect to the socket server
    const socket = io('https://localhost:443', {
      withCredentials: true,
    });

    // Used to detect when the socket is connected
    socket.on('connect', () => {
      console.log('Socket connected');
      setSocketConnected(true);
    });

    // Used to detect when the socket is disconnected
    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setSocketConnected(false);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      <h1>Client React</h1>
      <p>{socketConnected ? 'Socket is connected' : 'Socket is disconnected'}</p>
      {data ? (
        <div>
          <h2>Data from server:</h2>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      ) : (
        <p>Loading data...</p>
      )}
    </div>
  );
};

export default App;
