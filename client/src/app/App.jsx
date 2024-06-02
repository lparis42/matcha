import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SignInRegister from '../components/SigninRegister';
import io from 'socket.io-client';

const authentification_token = localStorage.getItem('authentification_token');
const socket = io({
  autoConnect: false,
  auth: {
    token: authentification_token
  }
});
console.log('Connecting with auth session:', socket);

const App = () => {
  const [socketConnected, setSocketConnected] = useState(false);
  const [geolocation, setGeolocation] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const handleSocketConnect = useCallback(() => {
    console.log('Socket connected');

    socket.on('server:session', handleSession);
    socket.on('reconnect_attempt', handleReconnectAttempt);
    socket.on('disconnect', handleSocketDisconnect);
    socket.on('connect_error', handleSocketError);
    socket.on('server:request:geolocation', handleRequestGeolocation);

    setSocketConnected(true);

    return () => {
      socket.off('server:session', handleSession);
      socket.off('reconnect_attempt', handleReconnectAttempt);
      socket.off('disconnect', handleSocketDisconnect);
      socket.off('connect_error', handleSocketError);
      socket.off('server:request:geolocation', handleRequestGeolocation);
    };
  }, []);

  const handleReconnectAttempt = useCallback((attemptNumber) => {
    console.log('Reconnect attempt:', attemptNumber);
    socket.auth.token = localStorage.getItem("authentification_token");
  }, []);

  const handleSocketDisconnect = useCallback(() => {
    console.log('Socket disconnected');
    setSocketConnected(false);
  }, []);

  const handleSocketError = useCallback((error) => {
    console.error('Connection failed:', error);
  }, []);

  const handleSession = useCallback((data, cb) => {
    console.log('Received new session:', data);
    localStorage.setItem("authentification_token", data);
    cb();
  }, []);

  const handleRequestGeolocation = useCallback(() => {
    if (navigator.geolocation) {
      //navigator.geolocation.watchPosition( // to get continuous updates
      navigator.geolocation.getCurrentPosition( // to get a single update
        (position) => {
          const { latitude, longitude } = position.coords;
          setGeolocation({ latitude, longitude });
          socket.emit('client:geolocation', { latitude, longitude });
          console.log('Emitting geolocation:', latitude, longitude);
        },
        (error) => {       
          socket.emit('client:geolocation', { latitude: null, longitude: null });
          console.error(`Error: ${error.message}`);
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  }, []);

  const handleLocationPathname = useCallback(() => {
    if (location.pathname === '/confirm' && location.search.includes('activation_key')) {
      const activation_key = new URLSearchParams(location.search).get('activation_key');
      console.log('Emitting registration confirmation:', activation_key);
      socket.emit('client:registration:confirmation', { activation_key: activation_key }, (err, message) => {
        if (err) {
          console.error('Error:', err);
        } else {
          console.log('Success:', message);
        }
        navigate('/');
      });
    }
  }, [location.pathname, location.search]);

  // Logout functionalities

  const emitRegistration = useCallback(() => {
    console.log('Emitting registration');
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
  }, []);

  const emitLogin = useCallback(() => {
    console.log('Emitting login');
    socket.emit('client:login', { username: 'testuser', password: 'testpassword' }, (err, message) => {
      if (err) {
        console.error('Error:', err);
      } else {
        console.log('Success:', message);
      }
    });
  }, []);

  const emitPasswordReset = useCallback(() => {
    console.log('Emitting password reset');
    socket.emit('client:passwordreset', { email: 'email@client.com' }, (err, message) => {
      if (err) {
        console.error('Error:', err);
      } else {
        console.log('Success:', message);
      }
    });
  }, []);

  // Login functionalities

  const emitLogout = useCallback(() => {
    console.log('Emitting logout');
    socket.emit('client:logout', (err, message) => {
      if (err) {
        console.error('Error:', err);
      } else {
        console.log('Success:', message);
      }
    });
  }, []);

  const emitUnregistration = useCallback(() => {
    console.log('Emitting unregistration');
    socket.emit('client:unregistration', (err, message) => {
      if (err) {
        console.error('Error:', err);
      } else {
        console.log('Success:', message);
      }
    });
  }, []);

  const handleEditProfile = useCallback(() => {
    console.log('Emitting edit profile');
    const userData = {
      gender: 'Male',
      sexual_orientation: 'Heterosexual',
      biography: 'Test biography',
    };
    socket.emit('client:edit', userData, (err, message) => {
      if (err) {
        console.error('Error:', err);
      } else {
        console.log('Success:', message);
      }
    });
  }, []);

  const handleViewProfile = useCallback(() => {
    console.log('Emitting view profile');
    socket.emit('client:view', { username: 'testuser' }, (err, message) => {
      if (err) {
        console.error('Error:', err);
      } else {
        console.log('Success:', message);
      }
    });
  }, []);

  const handleLikeProfile = useCallback(() => {
    console.log('Emitting like profile');
    socket.emit('client:like', { username: 'testuser' }, (err, message) => {
      if (err) {
        console.error('Error:', err);
      } else {
        console.log('Success:', message);
      }
    });
  }, []);

  const handleUnLikeProfile = useCallback(() => {
    console.log('Emitting unlike profile');
    socket.emit('client:unlike', { username: 'testuser' }, (err, message) => {
      if (err) {
        console.error('Error:', err);
      } else {
        console.log('Success:', message);
      }
    });
  }, []);

  // useEffects

  useEffect(() => {
    if (socketConnected) {
      handleLocationPathname();
    }
  }, [socketConnected, handleLocationPathname]);

  useEffect(() => {
    socket.connect();
    socket.on('connect', handleSocketConnect);
    return () => {
      socket.off('connect', handleSocketConnect);
    };
  }, [socket, handleSocketConnect]);

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
      <br /><br />Test logout functionalities:
      <br /><button onClick={emitRegistration}>Try registration</button>
      <br /><button onClick={emitLogin}>Try login</button>
      <br /><button onClick={emitPasswordReset}>Try password reset</button>

      <br /><br />Test login functionalities:
      <br /><button onClick={emitUnregistration}>Try unregistration</button>
      <br /><button onClick={emitLogout}>Try logout</button>
      <br /><button onClick={handleEditProfile}>Try edit profile</button>
      <br /><button onClick={handleViewProfile}>Try view profile</button>
      <br /><button onClick={handleLikeProfile}>Try like profile</button>
      <br /><button onClick={handleUnLikeProfile}>Try unlike profile</button>
      
      <SignInRegister />
    </div>
  );
};

export default App;
