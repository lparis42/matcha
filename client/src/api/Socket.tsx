import { Message } from "@/components/data";
import { useToast } from "@/components/ui/use-toast";
import { useAccountStore } from "../../src/store";
import useChatStore from "@/store";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {io, Socket} from 'socket.io-client';

interface SocketError {
  message: string;
  status?: number;
}

interface User {
    id: number;
    gender: string;
    sexual_orientation: string;
    first_name: string;
    last_name: string;
    email: string;
    birth_date: Date;
    biography: string;
    interests: string[];
    pictures: string[];
    location: string;
    fame_rating: number;
    avatar: string;
    name: string;
    username: string;
    date_of_birth: string;
    online: boolean;
    last_connection: string;
    common_tags: number[];
    geolocation: {lat: number, lng: number};
    messages: Message[];
    distance: number;
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
  notifications: any[];
  clearNotifications: Function;
  eventBlock: Function;
  eventReport: Function;
  eventLocationPathname: Function;
  eventLocationPathnamePW: Function;
  eventGeolocation: Function;
  eventAccount: Function;
  eventHaveliked: Function;
}

const GeolocationPositionErrorNames = {
  1: 'PERMISSION_DENIED',
  2: 'POSITION_UNAVAILABLE',
  3: 'TIMEOUT',
};

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
  const { setAccount } = useAccountStore();
  const [notifications, setNotifications] = useState<any[]>([]);
  const { toast } = useToast();

  const [socketConnected, setSocketConnected] = useState<boolean>(false);

  const {receiveMessage } = useChatStore();

  const globalConnection = () => {
    try {
      fetch(`https://${window.location.hostname}:2000/`, {
        method: 'GET',
        credentials: 'include',
      }).then(() => {
        try {
        setSocket(io(`https://${window.location.hostname}:2000/`, {
          secure: true,
          reconnection: true,
          rejectUnauthorized: true,
          withCredentials: true,
        }));}
        catch (e)
        {
          toast({title: e})
        }
      }).catch(error => {
        console.error('Error fetching:', error);
      });
    }
    catch (e) {
      toast({title: e})
    }
  }

  useEffect(() => {
    globalConnection();
  }, []);

  useEffect(() => {
    if (socket !== null) {
      socket.on('connect', eventSocketConnect);
      try {
        socket.connect();
      }
      catch (e) {
        toast({title: e})
      }
      return () => {
        socket.off('connect');
      };
    }
  }, [socket]);

  
  const sendtoast = (message: { title: string }) => {
    toast(message);
  };

  const checkerror = (error: SocketError) => {
    if (error.status === 401) {
      setAccount(null);
    }
  };

  const eventNotifications = (notifications: any) => {
    setNotifications(prev => [...prev, notifications]);
    if (notifications.type === "chat")
    {
      eventNewMessage(notifications.message)
    }
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

    return () => {
      socket.off('server:notification')
      socket.off('reconnect_attempt');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('server:chat');
    };
  };

  const eventReconnectAttempt = () => {
  };

  const eventSocketDisconnect = () => {
    toast({ title: 'Socket disconnected' });
    setSocketConnected(false);
  };

  const eventSocketError = (error: Error) => {
    try {
      globalConnection();
    }
    catch (e) {
      toast({title: error.message});
    }
    
  };

  const eventAccount = async (message) => {
    if (message.account == null) {
      setAccount(null);
      return;
    }
    const [err, profile ] = await eventView(message.account);
    setAccount(profile as User);
  }

  const eventGeolocation = useCallback(async () => {
    const data: [err: GeolocationPositionError, message: { latitude: number, longitude: number}] = await new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            //socket.emit('client:geolocation', { latitude, longitude }, () => {});
            resolve([null, { latitude, longitude }]);
          },
          (error) => {
            //socket.emit('client:geolocation', { latitude: null, longitude: null });
            toast({ title: `Geolocation error: ${GeolocationPositionErrorNames[error.code]}` });
            resolve([error, null]);
          }
        );
      } else {
        alert("Geolocation is not supported by this browser.");
      }
    });
    return data;
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

  const eventLocationPathnamePW = useCallback(async (activation_key, new_password) => {
    const data: [err: Error, message: string] = await new Promise((resolve) => {
      socket.emit('client:password_reset_confirmation', { activation_key: activation_key, new_password: new_password }, (err, message) => {
        if (err) {
          toast({ title: err.message });
          resolve([err, null]);
        } else {
          //toast({ title: message });
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

  const eventPasswordReset = useCallback((email) => {
   socket.emit('client:password_reset', { email: email }, (err: Error) => {
     if (err) {
       sendtoast({ title: err.message });
     } else {
       sendtoast({ title: 'password reset succefully, click the link send by email and your password will be in the mail' });
     }
   });
  }, [socket]);

  const eventLogout = useCallback(() => {
    socket.emit('client:logout', (err: Error) => {
      if (err) {
        sendtoast({ title: err.message });
      } else {
        setAccount(null);
      }
    });
  }, [socket]);

  const eventUnregistration = useCallback(() => {
    socket.emit('client:unregistration', (err: Error) => {
      if (err) {
        sendtoast({ title: err.message });
      } else {
        sendtoast({ title: 'unregistration succefully' });
      }
    });
  }, []);

  const eventEdit = useCallback((userData, callback: (err: SocketError | null, profile: User) => void) => {
    if (socket === null) {
      return;
    }
    socket.emit('client:edit', userData, (err: SocketError, message: User) => {
      if (err) {
        checkerror(err);
        sendtoast({ title: err.message });
        callback(err, null);
      } else {
        setAccount(message);
        callback(null, message);
      }
    });
  }, [socket]);

  const eventBrowsing = useCallback(async (browsing_start: number = 0, browsing_stop: number = 20, sort: string = "fame_rating") => {
    const data: [err: SocketError, listProfils: object[]] = await new Promise((resolve) => {
      socket.emit('client:browsing', { browsing_start, browsing_stop, sort }, (err: SocketError, listProfils: object[]) => {
          if (err) {
              checkerror(err);
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
    const data: [err: SocketError, profile: object] = await new Promise((resolve) => {
      socket.emit('client:view', { target_account: target_account }, (err: SocketError, profile: User) => {
        if (err) {
          checkerror(err);
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
      if (typeof target_account !== 'number')
        target_account = Number(prompt("Please enter the target account:"));
      const data: [err: SocketError, message: object] = await new Promise((resolve) => {
        socket.emit('client:like', { target_account: target_account }, (err: SocketError, data: object) => {
          if (err) {
            checkerror(err);
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
    if (typeof target_account !== 'number')
      target_account = Number(prompt("Please enter the target account:"));
    const data: [err: SocketError, message: string] = await new Promise((resolve) => {
      socket.emit('client:unlike', { target_account: target_account }, (err: SocketError, message: string) => {
        if (err) {
          checkerror(err);
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
    const data: [err: SocketError, message: string] = await new Promise((resolve) => {
      socket.emit('client:viewers', (err: SocketError, message: string) => {
        if (err) {
          checkerror(err);
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
    const data: [err: SocketError, message: string] = await new Promise((resolve) => {
      socket.emit('client:likers', (err: SocketError, message: string) => {
        if (err) {
          checkerror(err);
          sendtoast({ title: err.message });
          resolve([err, null]);
        } else {
          resolve([null, message]);
        }
      });
    });
    return data;
  }, [socket]);

  const eventHaveliked = useCallback(async (target_account: number) => {
    const data: [err: SocketError, message: string] = await new Promise((resolve) => {
      socket.emit('client:haveliked', { target_account: target_account }, (err: SocketError, message: string) => {
        if (err) {
          checkerror(err);
          sendtoast({ title: err.message });
          resolve([err, null]);
        } else {
          resolve([null, message]);
        }
      });
    });
    return data;
  }, [socket]);

  const eventMatch = useCallback((callback: (err: SocketError | null, message?: string) => void) => {
    socket.emit('client:matchs', (err: SocketError, message: string) => {
      if (err) {
        checkerror(err);
        sendtoast({ title: err.message });
        callback(err);
      } else {
        callback(null, message);
      }
    });
  }, []);


  const eventChat = useCallback(async (target_match: number, tosent: string) => {
    if (target_match === null || tosent === null)
    {
      target_match = Number(prompt("Please enter the target account:"));
      tosent = Math.random().toString(36).substring(3);
    }
    const data: [err: SocketError, message: string] = await new Promise((resolve) => {
      socket.emit('client:chat', { target_account: target_match, message: tosent }, (err: SocketError, message: string) => {
        if (err) {
          checkerror(err);
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
    const data: [err: SocketError, message: string] = await new Promise((resolve) => {
      socket.emit('client:chat_histories', (err: SocketError, message: string) => {
        if (err) {
          checkerror(err);
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
    if (typeof target_account !== 'number')
      target_account = Number(prompt("Please enter the target account:"));
    const data: [err: SocketError, message: string] = await new Promise((resolve) => {
      socket.emit('client:block', { target_account: target_account }, (err: SocketError, message: string) => {
        if (err) {
          checkerror(err);
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
    if (typeof target_account !== 'number')
      target_account = Number(prompt("Please enter the target account:"));
    const data: [err: SocketError, message: string] = await new Promise((resolve) => {
      socket.emit('client:report', { target_account: target_account }, (err: SocketError, message: string) => {
        if (err) {
          checkerror(err);
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
    eventLocationPathname,
    eventLocationPathnamePW,
    eventGeolocation,
    eventAccount,
    eventHaveliked,
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
