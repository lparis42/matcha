import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, styles } from './button';
import { Link } from 'react-router-dom';

interface Geolocation {
  latitude: number | null;
  longitude: number | null;
}

const App: React.FC<{ socket: any }> = ({ socket }) => {
  const [username, setUsername] = useState<string>((Math.random().toString(36)).slice(2, 8));
  const [socketConnected, setSocketConnected] = useState<boolean>(false);
  const [geolocation, setGeolocation] = useState<Geolocation | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const eventReconnectAttempt = useCallback((attemptNumber: number) => {
    console.log('Reconnect attempt:', attemptNumber);
    socket.auth.token = localStorage.getItem("authentification_token");
  }, [socket]);

  const eventSocketDisconnect = useCallback(() => {
    console.log('Socket disconnected');
    setSocketConnected(false);
  }, []);

  const eventSocketError = useCallback((error: Error) => {
    console.error('Connection failed:', error);
  }, [socket]);

  const eventGeolocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
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

  const eventSession = useCallback((data: string, cb: (err?: Error) => void) => {
    console.log('Received new session:', data);
    localStorage.setItem("authentification_token", data);
  }, []);

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
  }, [eventReconnectAttempt, eventSocketDisconnect, eventSocketError, eventSession, eventGeolocation]);

  const eventRegistration = useCallback(() => {
    console.log('Emitting registration');
    const data = {
      username: username,
      password: 'testpassword',
      email: `${username}@client.com`,
      last_name: 'Test',
      first_name: 'User',
    };
    socket.emit('client:registration', data, (err: Error, message: string) => {
      if (err) {
        console.error('Error:', err);
      } else {
        console.log('Success:', message);
      }
    });
  }, [username]);

  const eventLogin = useCallback(() => {
    console.log('Emitting login');
    socket.emit('client:login', { email: `${username}@client.com`, password: 'testpassword' }, (err: Error, message: string) => {
      if (err) {
        console.error('Error:', err);
      } else {
        console.log('Success:', message);
      }
    });
  }, [username]);

  const eventPasswordReset = useCallback(() => {
    console.log('Emitting password reset');
    socket.emit('client:password_reset', { email: `${username}@client.com` }, (err: Error, message: string) => {
      if (err) {
        console.error('Error:', err);
      } else {
        console.log('Success:', message);
      }
    });
  }, [username]);

  const eventLogout = useCallback(() => {
    console.log('Emitting logout');
    socket.emit('client:logout', (err: Error, message: string) => {
      if (err) {
        console.error('Error:', err);
      } else {
        console.log('Success:', message);
      }
    });
  }, []);

  const eventUnregistration = useCallback(() => {
    console.log('Emitting unregistration');
    socket.emit('client:unregistration', (err: Error, message: string) => {
      if (err) {
        console.error('Error:', err);
      } else {
        console.log('Success:', message);
      }
    });
  }, []);

  const eventEdit = useCallback(() => {
    console.log('Emitting edit profile');
    const userData = {
      gender: 'Male',
      sexual_orientation: 'Heterosexual',
      biography: 'Test biography',
      pictures: [null, null, null, null, null],
    };
    socket.emit('client:edit', userData, (err: Error, message: string) => {
      if (err) {
        console.error('Error:', err);
      } else {
        console.log('Success:', message);
      }
    });
  }, []);

  const eventView = useCallback(() => {
    console.log('Emitting view profile');
    const target_account = Number(prompt("Please enter the target account:"));
    socket.emit('client:view', { target_account: target_account }, (err: Error, message: string) => {
      if (err) {
        console.error('Error:', err);
      } else {
        console.log('Success:', message);
      }
    });
  }, []);

  const eventLike = useCallback(() => {
    console.log('Emitting like profile');
    const target_account = prompt("Please enter the target account:");
    socket.emit('client:like', { target_account: target_account }, (err: Error, message: string) => {
      if (err) {
        console.error('Error:', err);
      } else {
        console.log('Success:', message);
      }
    });
  }, []);

  const eventUnLike = useCallback(() => {
    console.log('Emitting unlike profile');
    const target_account = prompt("Please enter the target account:");
    socket.emit('client:unlike', { target_account: target_account }, (err: Error, message: string) => {
      if (err) {
        console.error('Error:', err);
      } else {
        console.log('Success:', message);
      }
    });
  }, []);

  const eventViewers = useCallback(() => {
    console.log('Emitting viewers');
    socket.emit('client:viewers', (err: Error, message: string) => {
      if (err) {
        console.error('Error:', err);
      } else {
        console.log('Success:', message);
      }
    });
  }, []);

  const eventLikers = useCallback(() => {
    console.log('Emitting likers');
    socket.emit('client:likers', (err: Error, message: string) => {
      if (err) {
        console.error('Error:', err);
      } else {
        console.log('Success:', message);
      }
    });
  }, []);

  const eventChat = useCallback(() => {
    console.log('Emitting chat');
    const target_match = prompt("Please enter the target account:");
    const message = Math.random().toString(36).substring(3);
    socket.emit('client:chat', { match_id: target_match, message: message }, (err: Error, message: string) => {
      if (err) {
        console.error('Error:', err);
      } else {
        console.log('Success:', message);
      }
    });
  }, []);

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
  }, [eventSocketConnect]);

  return (
    <div>
      <div style={{ position: 'absolute' }}>
        <h1>Client Vite + React</h1>
        <p>{socketConnected ? 'Socket is connected' : 'Socket is disconnected'}</p>
        {geolocation ? (
          <>
            Latitude: {geolocation.latitude}, Longitude: {geolocation.longitude}
          </>
        ) : (
          'No position'
        )}
        <br /><Link to="/signin"> <button>Sign In</button> </Link>
        <br /><Link to="/signup"> <button>Sign Up</button> </Link>
        <br /><Link to="/profile"> <button>Profile</button> </Link>
      </div>
      <div style={styles.container}>
        <div style={styles.innerContainer}>
          <div style={styles.logoutInnerContainer}>
            <ul style={styles.ul}>
              <Button onClick={eventRegistration}>registration</Button>
              <Button onClick={eventLogin}>login</Button>
              <Button onClick={eventPasswordReset}>password reset</Button>
            </ul>
          </div>
          <div style={styles.loginInnerContainer}>
            <ul style={styles.ul}>
              <Button onClick={eventUnregistration}>unregistration</Button>
              <Button onClick={eventLogout}>logout</Button>
              <Button onClick={eventEdit}>edit profile</Button>
              <Button onClick={eventView}>view profile</Button>
              <Button onClick={eventLike}>like profile</Button>
              <Button onClick={eventUnLike}>unlike profile</Button>
              <Button onClick={eventViewers}>viewers</Button>
              <Button onClick={eventLikers}>likers</Button>
              <Button onClick={eventChat}>chat</Button>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;