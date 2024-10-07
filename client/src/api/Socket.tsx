import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hook/useAuth";
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
  eventGeolocation: Function;
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
  const { setAccount } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const { toast } = useToast();

  console.log('SocketProvider render');
  const [socketConnected, setSocketConnected] = useState<boolean>(false);
  const [geolocation, setGeolocation] = useState<Geolocation | null>(null);

  const {receiveMessage } = useChatStore();

  useEffect(() => {
    fetch('https://localhost:2000', {
      method: 'GET',
      credentials: 'include',
    }).then(() => {
      console.log('Fetched');
      setSocket(io('https://localhost:2000', {
        secure: true,
        reconnection: true,
        rejectUnauthorized: true,
        withCredentials: true,
      }));
    }).catch(error => {
      console.error('Error fetching:', error);
    });
  }, []);

  useEffect(() => {
    if (socket !== null) {
      socket.on('connect', eventSocketConnect);
      socket.connect();
      console.log('Socket connection');
      return () => {
        socket.off('connect');
      };
    }
  }, [socket]);

  
  const sendtoast = (message: { title: string }) => {
    toast(message);
  };

  const eventNotifications = (notifications: any) => {
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
    toast({ title: 'Socket disconnected' });
    setSocketConnected(false);
  };

  const eventSocketError = (error: Error) => {
    console.error('Connection failed:', error);
  };

  const eventAccount = async (message) => {
    const [err, profile] = await eventView(message.account);
    setAccount(profile);
    console.log("Account", profile)
  }

  const eventGeolocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          //setGeolocation({ latitude, longitude });
          socket.emit('client:geolocation', { latitude, longitude }, () => {});
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

    const data: [err: Error, message: string] = await new Promise((resolve) => {
      socket.emit('client:registration', userdata, (err: Error, message: string) => {
        if (err) {
          sendtoast({ title: err.message });
          resolve([err, null]);
        } else {
          sendtoast({ title: "succefully register, validate your account with the link in email !" });
          resolve([null, message]);
        }
      });
    });
    return data;
  }, [socket])

  const eventLogin = useCallback(async (userdata: Login) => {
    if (socket === null) {
      return;
    }
    console.log('Emitting login');
    const data: [err: Error, message: string] = await new Promise((resolve) => {
      socket.emit('client:login', userdata, (err: Error, message: string) => {
        if (err) {
          sendtoast({ title: err.message });
          resolve([err, null]);
        } else {
          sendtoast({ title: "succefully login" });
          resolve([null, message]);
        }
      });
    });
    return data;
  }, [socket]);

  //to do
  //const eventPasswordReset = useCallback(() => {
  //  console.log('Emitting password reset');
  //  socket.emit('client:password_reset', { email: `${account}` }, (err: Error, message: string) => {
  //    if (err) {
  //      sendtoast({ title: err.message });
  //    } else {
  //      sendtoast({ title: 'password reset succefully, clic the link' });
  //    }
  //  });
  //}, [username]);

  const eventLogout = useCallback(() => {
    console.log('Emitting logout');
    socket.emit('client:logout', (err: Error, message: string) => {
      if (err) {
        sendtoast({ title: err.message });
      } else {
        setAccount(null);
      }
    });
  }, [socket]);

  const eventUnregistration = useCallback(() => {
    console.log('Emitting unregistration');
    socket.emit('client:unregistration', (err: Error, message: string) => {
      if (err) {
        sendtoast({ title: err.message });
      } else {
        sendtoast({ title: 'unregistration succefully' });
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
        setAccount(message);
        callback(null, message);
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
              resolve([null, listProfils]);
          }
      });
    });
    return data;
  }, [socket]);

  const eventView = useCallback(async (target_account: number) => {
    if (typeof target_account !== 'number')
      target_account = Number(prompt("Please enter the target account:"));
    const data: [err: Error, profile: object] = await new Promise((resolve) => {
      socket.emit('client:view', { target_account: target_account }, (err: Error, profile: object) => {
        if (err) {
          sendtoast({ title: err.message });
          resolve([err, null]);
        } else {
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
    const data: [err: Error, message: string] = await new Promise((resolve) => {
      socket.emit('client:chat', { target_account: target_match, message: tosent }, (err: Error, message: string) => {
        if (err) {
          sendtoast({ title: err.message });
          resolve([err, null]);
        } else {
          resolve([null, message]);
        }
      });
    });
    return data;
  }, [socket]);

  const eventChatHistories = useCallback(async () => {
    console.log('Emitting chat histories');
    const data: [err: Error, message: string] = await new Promise((resolve) => {
      socket.emit('client:chat_histories', (err: Error, message: string) => {
        if (err) {
          sendtoast({ title: err.message });
          resolve([err, null]);
        } else {
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
          resolve([null, message]);
        }
      });
    });
    return data;
  }, [socket]);

  const eventNewMessage = (data) => {
      receiveMessage(data)
  }

  const socketValue = {
    socket,
    socketConnected,
    geolocation,
    eventRegistration,
    eventLogin,
    //eventPasswordReset,
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
    eventGeolocation
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
