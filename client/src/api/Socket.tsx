import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

export type Register = {
  username: string;
  password: string;
  email: string;
  last_name: string;
  first_name: string;
}

export type Login = {
  email: string;
  password: string;
}

interface Geolocation {
  latitude: number | null;
  longitude: number | null;
}

interface SocketValue {
  socket: SocketIOClient.Socket;
  socketConnected: boolean;
  geolocation: Geolocation; // Replace with the actual type
  eventRegistration: Function; // Replace with the actual type
  eventLogin: Function; // Replace with the actual type
  eventPasswordReset: Function; // Replace with the actual type
  eventLogout: Function; // Replace with the actual type
  eventUnregistration: Function; // Replace with the actual type
  eventEdit: Function; // Replace with the actual type
  eventView: Function; // Replace with the actual type
  eventLike: Function; // Replace with the actual type
  eventUnLike: Function; // Replace with the actual type
  eventViewers: Function; // Replace with the actual type
  eventLikers: Function; // Replace with the actual type
  eventChat: Function; // Replace with the actual type
  eventBrowsing: Function; // Replace with the actual type
}

const SocketContext = createContext()

export const useSocket = (): SocketValue => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

let socket;

await fetch('https://localhost:444', { // To get credentials when using client dev live server
  method: 'GET',
  credentials: 'include',
}).then(() => {
  socket = io('https://localhost:444', {
    secure: true,
    reconnection: true,
    rejectUnauthorized: true,
    withCredentials: true,
  });
}).catch(error => {
  console.error('Error fetching:', error);
});

export const SocketProvider = ({ children }) => {
  console.log('SocketProvider');
  const [username, setUsername] = useState<string>((Math.random().toString(36)).slice(2, 8));
  const [log, setLog] = useState<boolean>(false);
  const [socketConnected, setSocketConnected] = useState<boolean>(false);
  const [geolocation, setGeolocation] = useState<Geolocation | null>(null);
  // const location = useLocation();
  // const navigate = useNavigate();

  const eventReconnectAttempt = useCallback((attemptNumber: number) => {
    console.log('Reconnect attempt:', attemptNumber);
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

  // const eventLocationPathname = useCallback(() => {
  //  if (location.pathname === '/confirm' && location.search.includes('activation_key')) {
  //    const activation_key = new URLSearchParams(location.search).get('activation_key');
  //    console.log('Emitting registration confirmation:', activation_key);
  //    socket.emit('client:registration_confirmation', { activation_key: activation_key }, (err, message) => {
  //      if (err) {
  //        console.error('Error:', err);
  //      } else {
  //        console.log('Success:', message);
  //      }
  //      navigate('/');
  //    });
  //  }
  // }, [socket, location, navigate]);


  const eventSocketConnect = useCallback(() => {
    console.log('Socket connected');

    socket.on('reconnect_attempt', eventReconnectAttempt);
    socket.on('disconnect', eventSocketDisconnect);
    socket.on('connect_error', eventSocketError);

    socket.on('server:geolocation', eventGeolocation);

    setSocketConnected(true);

    return () => {
      socket.off('reconnect_attempt', eventReconnectAttempt);
      socket.off('disconnect', eventSocketDisconnect);
      socket.off('connect_error', eventSocketError);

      socket.off('server:geolocation', eventGeolocation);
    };
  }, [eventReconnectAttempt, eventSocketDisconnect, eventSocketError, eventGeolocation]);

  const eventRegistration = useCallback((data: Register) => {
    console.log('Emitting registration', typeof data);
    if (data === undefined) {
      data = {
        username: username,
        password: 'testpassword',
        email: `${username}@client.com`,
        last_name: 'Test',
        first_name: 'User'
      };
      console.log('Emitting registration 2');
    }
    console.log('Emitting registration 3');

    socket.emit('client:registration', data, (err: Error, message: string) => {
      if (err) {
        console.error('Error:', err);
      } else {
        console.log('Success:', message);
      }
    });
  }, [username])

  const eventLogin = useCallback((data: Login) => {
    console.log('Emitting login');
    if (!data) {
      data = { email: `${username}@client.com`, password: 'testpassword' }
    }
    socket.emit('client:login', data, (err: Error, message: string) => {
      if (err) {
        console.error('Error:', err);
      } else {
        console.log('Success:', message);
        setLog(true);
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
        setLog(false);
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

  const eventBrowsing = useCallback((callback: (err: Error | null, listProfils?: object[]) => void) => {
    console.log('Emitting browse profile');
    socket.emit('client:browsing', { browsing_start: 0, browsing_stop: 10 }, (err: Error, listProfils: object[]) => {
      if (err) {
        console.error('Error:', err);
      } else {
        console.log('Success:', listProfils);
        callback(null, listProfils);
      }
    });
  }, []);

  const eventView = useCallback((target_account: number, callback: (err: Error | null, profile?: object) => void) => {
    console.log('Emitting view profile', target_account);
    if (typeof target_account !== 'number')
      target_account = Number(prompt("Please enter the target account:"));
    socket.emit('client:view', { target_account: target_account }, (err: Error, profile: object) => {
      if (err) {
        console.error('Error:', err);
        callback(err);
      } else {
        console.log('Success:', profile);
        callback(null, profile);
      }
    });
  }, []);

  const eventLike = useCallback((target_account: number, callback: (err: Error | null, message?: string) => void) => {
    console.log('Emitting like profile');
    if (typeof target_account !== 'number')
      target_account = Number(prompt("Please enter the target account:"));
    socket.emit('client:like', { target_account: target_account }, (err: Error, message: string) => {
      if (err) {
        console.error('Error:', err);
        callback(err);
      } else {
        console.log('Success:', message);
        callback(null, message);
      }
    });
  }, []);

  const eventUnLike = useCallback((target_account: number, callback: (err: Error | null, message?: string) => void) => {
    console.log('Emitting unlike profile');
    if (typeof target_account !== 'number')
      target_account = Number(prompt("Please enter the target account:"));
    socket.emit('client:unlike', { target_account: target_account }, (err: Error, message: string) => {
      if (err) {
        console.error('Error:', err);
        callback(err);
      } else {
        console.log('Success:', message);
        callback(null, message);
      }
    });
  }, []);

  const eventViewers = useCallback((callback: (err: Error | null, message?: string) => void) => {
    console.log('Emitting viewers');
    socket.emit('client:viewers', (err: Error, message: string) => {
      if (err) {
        console.error('Error:', err);
        callback(err);
      } else {
        console.log('Success:', message);
        callback(null, message);
      }
    });
  }, []);

  const eventLikers = useCallback((callback: (err: Error | null, message?: string) => void) => {
    console.log('Emitting likers');
    socket.emit('client:likers', (err: Error, message: string) => {
      if (err) {
        console.error('Error:', err);
        callback(err);
      } else {
        console.log('Success:', message);
        callback(null, message);
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

  //useEffect(() => {
  //  if (socketConnected) {
  //    eventLocationPathname();
  //  }
  //}, [socketConnected, eventLocationPathname]);

  useEffect(() => {
    console.log('SocketProvider useEffect');
    socket.connect();
    socket.on('connect', eventSocketConnect);
    return () => {
      socket.off('connect', eventSocketConnect);
    };
  }, [eventSocketConnect]);

  const socketValue = {
    socket,
    socketConnected,
    geolocation,
    eventRegistration,
    eventLogin,
    eventPasswordReset,
    eventLogout,
    eventUnregistration,
    eventEdit,
    eventView,
    eventLike,
    eventUnLike,
    eventViewers,
    eventLikers,
    eventChat,
    eventBrowsing,
    log
  }

  return (
    <SocketContext.Provider value={socketValue}>
      {children}
    </SocketContext.Provider>
  );
};
