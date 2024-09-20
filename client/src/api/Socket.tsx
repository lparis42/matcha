import { useToast } from "@/components/ui/use-toast";
import useChatStore from "@/store";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import {io, Socket} from 'socket.io-client';

interface User {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  biography: string;
  gender: string;
  sexual_orientation: string;
  common_tags: string[];
  pictures: string[];
  date_of_birth: Date;
}

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
  user: User;
  notifications: any[];
  clearNotifications: Function;
  eventBlock: Function;
  eventReport: Function;
  eventLocationPathname: Function;
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
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const { toast } = useToast();

  console.log('SocketProvider');
  const [username, setUsername] = useState<string>((Math.random().toString(36)).slice(2, 8));
  const [socketConnected, setSocketConnected] = useState<boolean>(false);
  const [geolocation, setGeolocation] = useState<Geolocation | null>(null);

  const {receiveMessage } = useChatStore();

  useEffect(() => {
    fetch('https://localhost:2000', { // To get credentials when using client dev live server
      method: 'GET',
      credentials: 'include',
    }).then(() => {
      setSocket(io('https://localhost:2000', {
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

  
  const sendtoast = (message: { title: string }) => {
    toast(message);
  };

  const eventNotifications = (notifications: any) => {
    console.log('Notifications:', notifications);
    if (notifications.type === "chat")
    {
      eventNewMessage(notifications.message)
    }
    else
      setNotifications(prev => [...prev, notifications]);
  };

  const clearNotifications = () => {
    setNotifications([]);
  }

  const eventSocketConnect = () => {
    if (socket === null) {
      return;
    }

    socket.on('server:notification', eventNotifications);
    socket.on('reconnect_attempt', eventReconnectAttempt);
    socket.on('disconnect', eventSocketDisconnect);
    socket.on('connect_error', eventSocketError);
    socket.on('server:account', eventAccount);

    setSocketConnected(true);
    console.log('Socket connected');

    return () => {
      socket.off('server:notification')
      socket.off('reconnect_attempt');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('server:chat');
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

  const eventAccount = async (message) => {
    console.log('Account:', message);
    const [err, profile] = await eventView(message.account);
    setUser(profile);
    console.log("VIEW PROFILE", profile)
  }

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

  const eventLocationPathname = useCallback(async (activation_key) => {
    const data: [err: Error, message: string] = await new Promise((resolve) => {
      socket.emit('client:registration_confirmation', { activation_key: activation_key }, (err, message) => {
        if (err) {
          toast({ title: err.message });
          resolve([err, null]);
        } else {
          toast({ title: message });
          resolve([null, message]);
        }
      });
    });
    return data;
  }, [socket]);

  const eventRegistration = useCallback(async (userdata: Register) => {
    if (socket === null) {
      return;
    }
    console.log('Emitting registration');
    if (userdata === undefined) {
      userdata = {
        username: username,
        password: 'testpassword',
        email: `${username}@client.com`,
        last_name: 'Test',
        first_name: 'User'
      };
    }

    const data: [err: Error, message: string] = await new Promise((resolve) => {
      socket.emit('client:registration', userdata, (err: Error, message: string) => {
        if (err) {
          sendtoast({ title: err.message });
          resolve([err, null]);
        } else {
          sendtoast({ title: "succefully register" });
          resolve([null, message]);
        }
      });
    });
    return data;
  }, [username, socket])

  const eventLogin = useCallback(async (userdata: Login) => {
    if (socket === null) {
      return;
    }
    console.log('Emitting login');
    if (!userdata) {
      userdata = { email: `${username}@client.com`, password: 'testpassword' }
    }
    const data: [err: Error, message: string] = await new Promise((resolve) => {
      socket.emit('client:login', userdata, (err: Error, message: string) => {
        if (err) {
          sendtoast({ title: err.message });
          resolve([err, null]);
        } else {
          sendtoast({ title: "succefully login" });
          console.log('Success:', message);
          resolve([null, message]);
        }
      });
    });
    return data;
  }, [username, socket]);

  const eventPasswordReset = useCallback(() => {
    console.log('Emitting password reset');
    socket.emit('client:password_reset', { email: `${username}@client.com` }, (err: Error, message: string) => {
      if (err) {
        sendtoast({ title: err.message });
      } else {
        console.log('Success:', message);
      }
    });
  }, [username]);

  const eventLogout = useCallback(() => {
    console.log('Emitting logout');
    socket.emit('client:logout', (err: Error, message: string) => {
      if (err) {
        sendtoast({ title: err.message });
      } else {
        console.log('Success:', message);
        setLog(false);
        setUser(null);
      }
    });
  }, [socket]);

  const eventUnregistration = useCallback(() => {
    console.log('Emitting unregistration');
    socket.emit('client:unregistration', (err: Error, message: string) => {
      if (err) {
        sendtoast({ title: err.message });
      } else {
        console.log('Success:', message);
      }
    });
  }, []);

  const eventEdit = useCallback((userData, callback: (err: Error | null, profile: User) => void) => {
    if (socket === null) {
      return;
    }
    console.log('Emitting edit profile');
    socket.emit('client:edit', userData, (err: Error, message: User) => {
      if (err) {
        sendtoast({ title: err.message });
        callback(err, null);
      } else {
        console.log('Success:', message);
        setUser(message);
        callback(null, message);
        // eventView(user.id).then((data) => {
        //   if (data === null)
        //     setUser(data[1]);
        // });
      }
    });
  }, [socket, user]);

  const eventBrowsing = useCallback(async (browsing_start: number = 0, browsing_stop: number = 20, sort: string = "fame_rating") => {
    console.log('Emitting browse profile');
    const data: [err: Error, listProfils: object[]] = await new Promise((resolve) => {
      socket.emit('client:browsing', { browsing_start, browsing_stop, sort }, (err: Error, listProfils: object[]) => {
          if (err) {
              sendtoast({ title: err.message });
              resolve([err, null]);
          } else {
              console.log('Success:', listProfils);
              resolve([null, listProfils]);
          }
      });
    });
    console.log('Data:', data);
    return data;
  }, [socket]);

  const eventView = useCallback(async (target_account: number) => {
    console.log('Emitting view profile', target_account);
    if (typeof target_account !== 'number')
      target_account = Number(prompt("Please enter the target account:"));
    const data: [err: Error, profile: object] = await new Promise((resolve) => {
      socket.emit('client:view', { target_account: target_account }, (err: Error, profile: object) => {
        if (err) {
          sendtoast({ title: err.message });
          resolve([err, null]);
        } else {
          console.log('Success:', profile);
          resolve([null, profile]);
        }
      });
    });
    return data;
  }, [socket]);

  const eventLike = useCallback(async (target_account: number) => {
      console.log('Emitting like profile');
      if (typeof target_account !== 'number')
        target_account = Number(prompt("Please enter the target account:"));
      const data: [err: Error, message: object] = await new Promise((resolve) => {
        socket.emit('client:like', { target_account: target_account }, (err: Error, data: object) => {
          if (err) {
            sendtoast({ title: err.message });
            resolve([err, null]);
          } else {
            console.log('Success:', data);
            resolve([null, data]);
          }
        });
      });
      return data;
  }, [socket]);

  const eventUnLike = useCallback(async (target_account: number) => {
    console.log('Emitting unlike profile');
    if (typeof target_account !== 'number')
      target_account = Number(prompt("Please enter the target account:"));
    const data: [err: Error, message: string] = await new Promise((resolve) => {
      socket.emit('client:unlike', { target_account: target_account }, (err: Error, message: string) => {
        if (err) {
          sendtoast({ title: err.message });
          resolve([err, null]);
        } else {
          console.log('Success:', message);
          resolve([null, message]);
        }
      });
    });
    return data;
  }, [socket]);

  const eventViewers = useCallback(async () => {
    console.log('Emitting viewers');
    const data: [err: Error, message: string] = await new Promise((resolve) => {
      socket.emit('client:viewers', (err: Error, message: string) => {
        if (err) {
          sendtoast({ title: err.message });
          resolve([err, null]);
        } else {
          console.log('Success:', message);
          resolve([null, message]);
        }
      });
    });
    return data;
  }, [socket]);

  const eventLikers = useCallback(async () => {
    console.log('Emitting likers');
    const data: [err: Error, message: string] = await new Promise((resolve) => {
      socket.emit('client:likers', (err: Error, message: string) => {
        if (err) {
          sendtoast({ title: err.message });
          resolve([err, null]);
        } else {
          console.log('Success:', message);
          resolve([null, message]);
        }
      });
    });
    return data;
  }, [socket]);

  const eventMatch = useCallback((callback: (err: Error | null, message?: string) => void) => {
    console.log('Emitting Match');
    // const target_match = prompt("Please enter the target account:");
    // const message = Math.random().toString(36).substring(3);
    socket.emit('client:matchs', (err: Error, message: string) => {
      if (err) {
        sendtoast({ title: err.message });
        callback(err);
      } else {
        console.log('Success:', message);
        callback(null, message);
      }
    });
  }, []);


  const eventChat = useCallback(async (target_match: number, tosent: string) => {
    console.log('Emitting chat');
    if (target_match === null || tosent === null)
    {
      target_match = Number(prompt("Please enter the target account:"));
      tosent = Math.random().toString(36).substring(3);
    }
    console.log(target_match, tosent)
    const data: [err: Error, message: string] = await new Promise((resolve) => {
      socket.emit('client:chat', { target_account: target_match, message: tosent }, (err: Error, message: string) => {
        if (err) {
          sendtoast({ title: err.message });
          resolve([err, null]);
        } else {
          console.log('Success:', message);
          resolve([null, message]);
        }
      });
    });
    return data;
  }, [socket]);

  const eventChatHistories = useCallback(async () => {
    console.log('Emitting chat');
    const data: [err: Error, message: string] = await new Promise((resolve) => {
      socket.emit('client:chat_histories', (err: Error, message: string) => {
        if (err) {
          sendtoast({ title: err.message });
          resolve([err, null]);
        } else {
          console.log('Success:', message);
          resolve([null, message]);
        }
      });
    });
    return data;
  }, [socket]);

  const eventBlock = useCallback(async (target_account: number) => {
    console.log('Emitting block profile');
    if (typeof target_account !== 'number')
      target_account = Number(prompt("Please enter the target account:"));
    const data: [err: Error, message: string] = await new Promise((resolve) => {
      socket.emit('client:block', { target_account: target_account }, (err: Error, message: string) => {
        if (err) {
          sendtoast({ title: err.message });
          resolve([err, null]);
        } else {
          console.log('Success:', message);
          resolve([null, message]);
        }
      });
    });
    return data;
  }, [socket]);

  const eventReport = useCallback(async (target_account: number) => {
    console.log('Emitting report profile');
    if (typeof target_account !== 'number')
      target_account = Number(prompt("Please enter the target account:"));
    const data: [err: Error, message: string] = await new Promise((resolve) => {
      socket.emit('client:report', { target_account: target_account }, (err: Error, message: string) => {
        if (err) {
          sendtoast({ title: err.message });
          resolve([err, null]);
        } else {
          console.log('Success:', message);
          resolve([null, message]);
        }
      });
    });
    return data;
  }, [socket]);

  const eventNewMessage = (data) => {
      console.log("CHAT RECEIVED", data)
      receiveMessage(data)
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
    notifications,
    clearNotifications,
    eventBlock,
    eventReport,
    user,
    eventLocationPathname,
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
