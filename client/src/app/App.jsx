import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Signup from '@/components/Signup';
import io from 'socket.io-client';
import { Button, styles } from './button';

const authentification_token = localStorage.getItem('authentification_token');
const socket = io({
  autoConnect: false,
  auth: {
    token: authentification_token
  }
});

const App = () => {
  const [username, setUsername] = useState((Math.random().toString(36)).slice(2, 8));
  const [socketConnected, setSocketConnected] = useState(false);
  const [geolocation, setGeolocation] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const eventReconnectAttempt = useCallback((attemptNumber) => {
    console.log('Reconnect attempt:', attemptNumber);
    socket.auth.token = localStorage.getItem("authentification_token");
  }, [socket]);

  const eventSocketDisconnect = useCallback(() => {
    console.log('Socket disconnected');
    setSocketConnected(false);
  }, []);

  const eventSocketError = useCallback((error) => {
    console.error('Connection failed:', error);
  }, [socket]);

  const eventGeolocation = useCallback(() => {
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
  }, [socket]);

  const eventLocationPathname = useCallback(() => {
    if (location.pathname === '/confirm' && location.search.includes('activation_key')) {
      const activation_key = new URLSearchParams(location.search).get('activation_key');
      console.log('Emitting registration confirmation:', activation_key);
      socket.emit('client:registration_confirmation', { activation_key: activation_key }, (err, message) => {
        if (err) {
          console.error('Error:', err);
        } else {
          console.log('Success:', message);
        }
        navigate('/');
      });
    }
  }, [socket, location, navigate]);

  const eventSession = useCallback((data, cb) => {
    console.log('Received new session:', data);
    localStorage.setItem("authentification_token", data);
  }, [socket]);

  const eventSocketConnect = useCallback(() => {
    console.log('Socket connected');

    socket.on('reconnect_attempt', eventReconnectAttempt);
    socket.on('disconnect', eventSocketDisconnect);
    socket.on('connect_error', eventSocketError);

    socket.on('server:session', eventSession);
    socket.on('server:geolocation', eventGeolocation);

    setSocketConnected(true);

    return () => {
      socket.off('reconnect_attempt', eventReconnectAttempt);
      socket.off('disconnect', eventSocketDisconnect);
      socket.off('connect_error', eventSocketError);

      socket.off('server:session', eventSession);
      socket.off('server:geolocation', eventGeolocation);
    };
  }, [socket, eventReconnectAttempt, eventSocketDisconnect, eventSocketError, eventSession, eventGeolocation]);

  // Logout functionalities

  const eventRegistration = useCallback(() => {
    console.log('Emitting registration');
    const userData = {
      username: username,
      password: 'testpassword',
      email: `${username}@client.com`,
      last_name: 'Test',
      first_name: 'User',
    };
    socket.emit('client:registration', userData, (err, message) => {
      if (err) {
        console.error('Error:', err);
      } else {
        console.log('Success:', message);
      }
    });
  }, [socket]);

  const eventLogin = useCallback(() => {
    console.log('Emitting login');
    socket.emit('client:login', { email: `${username}@client.com`, password: 'testpassword' }, (err, message) => {
      if (err) {
        console.error('Error:', err);
      } else {
        console.log('Success:', message);
      }
    });
  }, [socket]);

  const eventPasswordReset = useCallback(() => {
    console.log('Emitting password reset');
    socket.emit('client:password_reset', { email: `${username}@client.com`, }, (err, message) => {
      if (err) {
        console.error('Error:', err);
      } else {
        console.log('Success:', message);
      }
    });
  }, [socket]);

  // Login functionalities

  const eventLogout = useCallback(() => {
    console.log('Emitting logout');
    socket.emit('client:logout', (err, message) => {
      if (err) {
        console.error('Error:', err);
      } else {
        console.log('Success:', message);
      }
    });
  }, [socket]);

  const eventUnregistration = useCallback(() => {
    console.log('Emitting unregistration');
    socket.emit('client:unregistration', (err, message) => {
      if (err) {
        console.error('Error:', err);
      } else {
        console.log('Success:', message);
      }
    });
  }, [socket]);

  const eventEdit = useCallback(() => {
    console.log('Emitting edit profile');
    const userData = {
      gender: 'Male',
      sexual_orientation: 'Heterosexual',
      biography: 'Test biography',
      pictures: ['picture1'],
    };
    socket.emit('client:edit', userData, (err, message) => {
      if (err) {
        console.error('Error:', err);
      } else {
        console.log('Success:', message);
      }
    });
  }, [socket]);

  const eventView = useCallback(() => {
    console.log('Emitting view profile');
    let target_account = prompt("Please enter the target account:");
    socket.emit('client:view', { target_account: target_account }, (err, message) => {
      if (err) {
        console.error('Error:', err);
      } else {
        console.log('Success:', message);
      }
    });
  }, [socket]);

  const eventLike = useCallback(() => {
    console.log('Emitting like profile');
    let target_account = prompt("Please enter the target account:");
    socket.emit('client:like', { target_account: target_account }, (err, message) => {
      if (err) {
        console.error('Error:', err);
      } else {
        console.log('Success:', message);
      }
    });
  }, [socket]);

  const eventUnLike = useCallback(() => {
    console.log('Emitting unlike profile');
    let target_account = prompt("Please enter the target account:");
    socket.emit('client:unlike', { target_account: target_account }, (err, message) => {
      if (err) {
        console.error('Error:', err);
      } else {
        console.log('Success:', message);
      }
    });
  }, [socket]);

  const eventViewers = useCallback(() => {
    console.log('Emitting viewers');
    socket.emit('client:viewers', (err, message) => {
      if (err) {
        console.error('Error:', err);
      } else {
        console.log('Success:', message);
      }
    });
  }, [socket]);

  const eventLikers = useCallback(() => {
    console.log('Emitting likers');
    socket.emit('client:likers', (err, message) => {
      if (err) {
        console.error('Error:', err);
      } else {
        console.log('Success:', message);
      }
    });
  }, [socket]);

  const eventChat = useCallback(() => {
    console.log('Emitting chat');
    let target_match = prompt("Please enter the target account:");
    const message = Math.random().toString(36).substring(3);
    socket.emit('client:chat', { match_id: target_match, message: message }, (err, message) => {
      if (err) {
        console.error('Error:', err);
      } else {
        console.log('Success:', message);
      }
    });
  }, [socket]);

  // useEffects

  useEffect(() => {
    if (socketConnected) {
      eventLocationPathname();
    }
  }, [socketConnected, eventLocationPathname]);

  useEffect(() => {
    socket.connect();
    socket.on('connect', eventSocketConnect);
    return () => {
      socket.off('connect', eventSocketConnect);
    };
  }, [socket, eventSocketConnect]);

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
    </div>
  );
};

export default App;
