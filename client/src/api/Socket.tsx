import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import {io, Socket} from 'socket.io-client';

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
  socket: Socket;
  socketConnected: boolean;
  geolocation: Geolocation;
  eventRegistration: Function;
  eventLogin: Function;
  eventPasswordReset: Function;
  eventLogout: Function;
  eventUnregistration: Function;
  eventEdit: Function;
  eventView: Function;
  eventLike: Function;
  eventUnLike: Function;
  eventViewers: Function;
  eventLikers: Function;
  eventChat: Function;
  eventBrowsing: Function;
  eventMatch: Function;
  eventChatHistories: Function;
  subListenChat: Function;
  user: any;
}

const SocketContext = createContext(null);

export const useSocket = (): SocketValue => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [user, setUser] = useState<any | null>(null);

  console.log('SocketProvider');
  const [username, setUsername] = useState<string>((Math.random().toString(36)).slice(2, 8));
  const [log, setLog] = useState<boolean>(false);
  const [socketConnected, setSocketConnected] = useState<boolean>(false);
  const [geolocation, setGeolocation] = useState<Geolocation | null>(null);
  // const location = useLocation();
  // const navigate = useNavigate();

  useEffect(() => {
    fetch('https://localhost:444', { // To get credentials when using client dev live server
      method: 'GET',
      credentials: 'include',
    }).then(() => {
      setSocket(io('https://localhost:444', {
        secure: false,
        reconnection: true,
        rejectUnauthorized: true,
        withCredentials: true,
      }));
    }).catch(error => {
      console.error('Error fetching:', error);
    });
  }, []);

  useEffect(() => {
    console.log('SocketProvider useEffect');
    if (socket !== null) {
      socket.connect();
      socket.on('connect', eventSocketConnect);
      return () => {
        socket.off('connect');
      };
    }
  }, [socket]);

  useEffect(() => {
    if (user === null) {
      return;
    }

    socket.on('server:chat', eventListenChat)
    socket.on('server:like', (data) => {})
    socket.on('server:unlike', (data) => {})
    socket.on('server:view', (data) => {})
    socket.on('server:match', (data) => {})

    return () => {
      socket.off('server:chat')
      socket.off('server:like')
      socket.off('server:unlike')
      socket.off('server:view')
      socket.off('server:match')
    }
  }, [user]);

  //useEffect(() => {
  //  if (socketConnected) {
  //    eventLocationPathname();
  //  }
  //}, [socketConnected, eventLocationPathname]);

  const eventSocketConnect = () => {
    if (socket === null) {
      return;
    }

    socket.on('reconnect_attempt', eventReconnectAttempt);
    socket.on('disconnect', eventSocketDisconnect);
    socket.on('connect_error', eventSocketError);

    setSocketConnected(true);
    console.log('Socket connected');

    return () => {
      socket.off('reconnect_attempt');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('server:chat')
    };
  };

  const eventReconnectAttempt = (attemptNumber: number) => {
    console.log('Reconnect attempt:', attemptNumber);
  };

  const eventSocketDisconnect = () => {
    console.log('Socket disconnected');
    setSocketConnected(false);
  };

  const eventSocketError = (error: Error) => {
    console.error('Connection failed:', error);
  };

  useEffect(() => {
    if (!socketConnected) {
      return;
    }
    socket.emit('client:get_current_user', (response) => {
      console.log(response);
    });
  }, [socketConnected]);

  //const eventGeolocation = useCallback(() => {
  //  if (navigator.geolocation) {
  //    navigator.geolocation.getCurrentPosition(
  //      (position) => {
  //        const { latitude, longitude } = position.coords;
  //        setGeolocation({ latitude, longitude });
  //        socket.emit('client:geolocation', { latitude, longitude });
  //        console.log('Emitting geolocation:', latitude, longitude);
  //      },
  //      (error) => {
  //        socket.emit('client:geolocation', { latitude: null, longitude: null });
  //        console.error(`Error: ${error.message}`);
  //      }
  //    );
  //  } else {
  //    alert("Geolocation is not supported by this browser.");
  //  }
  //}, [socket]);

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



  const eventRegistration = useCallback((data: Register) => {
    if (socket === null) {
      return;
    }
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
  }, [username, socket])

  const eventLogin = useCallback((data: Login) => {
    if (socket === null) {
      return;
    }
    console.log('Emitting login');
    if (!data) {
      data = { email: `${username}@client.com`, password: 'testpassword' }
    }
    socket.emit('client:login', data, (err: Error, message: string) => {
      if (err) {
        console.error('Error:', err);
      } else {
        console.log('Success:', message);
        setUser(message);
        setLog(true);
      }
    });
  }, [username, socket]);

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
    if (socket === null) {
      return;
    }
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
        setUser(message);
      }
    });
  }, [socket, user]);

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

  const eventMatch = useCallback((callback: (err: Error | null, message?: string) => void) => {
    console.log('Emitting Match');
    // const target_match = prompt("Please enter the target account:");
    // const message = Math.random().toString(36).substring(3);
    socket.emit('client:matchs', (err: Error, message: string) => {
      if (err) {
        console.error('Error:', err);
        callback(err);
      } else {
        console.log('Success:', message);
        callback(null, message);
      }
    });
  }, []);


  const eventChat = useCallback((target_match: number, tosent: string, callback: (err: Error | null, message?: string) => void) => {
    console.log('Emitting chat');
    if (target_match === null || tosent === null)
    {
      target_match = Number(prompt("Please enter the target account:"));
      tosent = Math.random().toString(36).substring(3);
    }
    console.log(target_match, tosent)
    socket.emit('client:chat', { target_account: target_match, message: tosent }, (err: Error, message: string) => {
      if (err) {
        console.error('Error:', err);
        callback(err)
      } else {
        console.log('Success:', message);
        callback(null, message)
      }
    });
  }, []);

  const eventChatHistories = useCallback((callback: (err: Error | null, message?: string) => void) => {
    console.log('Emitting chat');
    socket.emit('client:chat_histories', (err: Error, message: string) => {
      if (err) {
        console.error('Error:', err);
        callback(err);
      } else {
        console.log('Success:', message);
        callback(null, message);
      }
    });
  }, []);

  const eventListenChat = (data) => {
      console.log("CHAT RCEIVED", data)
  }

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
    eventMatch,
    eventChatHistories,
    //subListenChat,
    log
  }

  if (socket === null) {
    return <div>loading...</div>
  }

  return (
    <SocketContext.Provider value={socketValue}>
      {children}
    </SocketContext.Provider>
  );
};
