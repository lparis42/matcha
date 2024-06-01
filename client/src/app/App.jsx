import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import SignInRegister from '../components/SigninRegister';
import io from 'socket.io-client';

const sessionID = localStorage.getItem("sessionID");
const socket = io({
  autoConnect: false,
  auth: {
    sessionID: sessionID
  }
});
socket.connect();

const App = () => {
  const [socketConnected, setSocketConnected] = useState(false);
  const [geolocation, setGeolocation] = useState(null);
  const [confirm, setConfirm] = useState(false);
  const location = useLocation();

  const handleSocketConnect = useCallback(() => {
    console.log('Socket connected');
    // Stockez l'identifiant de session dans le localStorage
    localStorage.setItem("sessionID", socket.id);
    setSocketConnected(true);
  }, []);

  const handleReconnectAttempt = useCallback((attemptNumber) => {
    console.log('Reconnect attempt:', attemptNumber);
    socket.auth.sessionID = localStorage.getItem("sessionID");
  }, []);

  const handleSocketDisconnect = useCallback(() => {
    console.log('Socket disconnected');
    setSocketConnected(false);
  }, []);

  const handleSocketError = useCallback((error) => {
    console.error('Connection failed:', error);
  }, []);

  const handleSession = useCallback((sessionID) => {
    console.log('Received sessionID:', sessionID);
    localStorage.setItem("sessionID", sessionID);
  }, []);

  const handleRequestGeolocation = useCallback(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setGeolocation({ latitude, longitude });
        socket.emit('client:geolocation', { latitude: latitude, longitude: longitude });
      },
      (error) => {
        console.error(error);
      },
      { enableHighAccuracy: true }
    );
  });

  const confirmRef = useRef(false);

  useEffect(() => {
    if (location.pathname === '/confirm' && !confirmRef.current) {
      confirmRef.current = true;
      console.log('location.pathname:', location.pathname);
      console.log('location.search:', location.search);
      const activation_key = new URLSearchParams(location.search).get('activation_key');
      socket.emit('client:registration:confirmation', { activation_key: activation_key }, (err, message) => {
        if (err) {
          console.error('Error:', err);
        } else {
          console.log('Success:', message);
          setConfirm(true);
        }
        confirmRef.current = false;
      });
    }
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (confirm) {
      console.log('Effect: login');
      socket.emit('client:login', { username: 'testuser', password: 'testpassword' }, (err, message) => {
        if (err) {
          console.error('Error:', err);
        } else {
          console.log('Success:', message);
        }
      });
    }
  }, [confirm]);

  useEffect(() => {
    if (socketConnected) {
      console.log('Effect: registration');
      const userData = {
        username: 'testuser',
        password: 'testpassword',
        email: 'email@client.com',
        last_name: 'Test',
        first_name: 'User',
        date_of_birth: '2000-01-01',
      };
      socket.emit('client:registration', userData, (err, message) => {
        if (err) {
          console.error('Error:', err);
        } else {
          console.log('Success:', message);
        }
      });
    }
  }, [socketConnected]);

  useEffect(() => {
    console.log('Setting up socket listeners');

    socket.on('server:session', handleSession);
    socket.on('connect', handleSocketConnect);
    socket.on('reconnect_attempt', handleReconnectAttempt);
    socket.on('disconnect', handleSocketDisconnect);
    socket.on('connect_error', handleSocketError);
    socket.on('server:request:geolocation', handleRequestGeolocation);

    return () => {
      socket.off('server:session', handleSession);
      socket.off('connect', handleSocketConnect);
      socket.off('reconnect_attempt', handleReconnectAttempt);
      socket.off('disconnect', handleSocketDisconnect);
      socket.off('connect_error', handleSocketError);
      socket.off('server:request:geolocation', handleRequestGeolocation);

      console.log('Removing socket listeners');
    };
  }, [handleSession, handleSocketConnect, handleReconnectAttempt, handleSocketDisconnect, handleSocketError, handleRequestGeolocation]);

  return (
    <div>
      <h1>Client Vite + React</h1>
      <p>{socketConnected ? 'Socket is connected' : 'Socket is disconnected'}</p>
      {geolocation ? (
        <>
          Latitude: {geolocation.latitude}, Longitude: {geolocation.longitude}
        </>
      ) : (
        'No position'
      )}
      <SignInRegister />
    </div>
  );
};

export default App;
