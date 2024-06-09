import { useCallback } from "react";
import io from 'socket.io-client';

export type Register = {
    username: string;
    password: string;
    email: string;
    last_name: string;
    first_name: string;
    date_of_birth: string;
}

export type Login = {
  username: string;
  password: string;
}

const authentification_token = localStorage.getItem('authentification_token');
const socket = io({
  autoConnect: false,
  auth: {
    token: authentification_token
  }
});

const handleReconnectAttempt = (attemptNumber) => {
    console.log('Reconnect attempt:', attemptNumber);
    socket.auth.token = localStorage.getItem("authentification_token");
  }

  const handleSocketDisconnect = () => {
    console.log('Socket disconnected');
  }

  const handleSocketError = (error) => {
    console.error('Connection failed:', error);
  }

  const handleSession = (data, cb) => {
    console.log('Received new session:', data);
    localStorage.setItem("authentification_token", data);
    cb();
  }

  const handleRequestGeolocation = () => {
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
  }

  const handleLocationPathname = () => {
    if (location.pathname === '/confirm' && location.search.includes('activation_key')) {
      const activation_key = new URLSearchParams(location.search).get('activation_key');
      console.log('Emitting registration confirmation:', activation_key);
      socket.emit('client:registration:confirmation', { activation_key: activation_key }, (err, message) => {
        if (err) {
          console.error('Error:', err);
        } else {
          console.log('Success:', message);
        }
        //navigate('/');
      });
    }
  }

  // Logout functionalities

export const emitRegistration = (userData: Register | null) => {
    console.log('Emitting registration');
    if (!userData)
      userData = {
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

  export const emitLogin = (userData: Login | null) => {
    console.log('Emitting login');
    if (!userData)
      userData = {
        username: 'testuser',
        password: 'testpassword',
      };
    socket.emit('client:login', userData, (err, message) => {
      if (err) {
        console.error('Error:', err);
      } else {
        console.log('Success:', message);
      }
    });
  }

  const emitPasswordReset = () => {
    console.log('Emitting password reset');
    socket.emit('client:passwordreset', { email: 'email@client.com' }, (err, message) => {
      if (err) {
        console.error('Error:', err);
      } else {
        console.log('Success:', message);
      }
    });
  }

  // Login functionalities

  const emitLogout = () => {
    console.log('Emitting logout');
    socket.emit('client:logout', (err, message) => {
      if (err) {
        console.error('Error:', err);
      } else {
        console.log('Success:', message);
      }
    });
  }

  const emitUnregistration = () => {
    console.log('Emitting unregistration');
    socket.emit('client:unregistration', (err, message) => {
      if (err) {
        console.error('Error:', err);
      } else {
        console.log('Success:', message);
      }
    });
  }

  const handleEditProfile = () => {
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
  }

  const handleViewProfile = () => {
    console.log('Emitting view profile');
    socket.emit('client:view', { username: 'testuser' }, (err, message) => {
      if (err) {
        console.error('Error:', err);
      } else {
        console.log('Success:', message);
      }
    });
  }

  const handleLikeProfile = () => {
    console.log('Emitting like profile');
    socket.emit('client:like', { username: 'testuser' }, (err, message) => {
      if (err) {
        console.error('Error:', err);
      } else {
        console.log('Success:', message);
      }
    });
  }

  const handleUnLikeProfile = () => {
    console.log('Emitting unlike profile');
    socket.emit('client:unlike', { username: 'testuser' }, (err, message) => {
      if (err) {
        console.error('Error:', err);
      } else {
        console.log('Success:', message);
      }
    });
  }
