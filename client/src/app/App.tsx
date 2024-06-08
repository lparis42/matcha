import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, styles } from './button';
import { Link } from 'react-router-dom';

import { useSocket } from '@/api/Socket';

const App = () => {

  const { socketConnected, geolocation, eventRegistration,
    eventLogin,
    eventPasswordReset,
    eventUnregistration,
    eventLogout,
    eventEdit,
    eventView,
    eventLike,
    eventUnLike,
    eventViewers,
    eventLikers,
    eventChat} = useSocket();

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
