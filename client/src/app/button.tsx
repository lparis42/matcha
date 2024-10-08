import React from 'react';

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f0f0f0',
    margin: 0,
    padding: 0,
    border: 0,
  },
  innerContainer: {
    background: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
    width: 'auto',
    maxWidth: '50%',
    height: 'auto'
  },
  logoutInnerContainer: {
    backgroundColor: '#FFCCCC',
    padding: '10px', 
    width: '100%', 
    height: 'auto'
  },
  loginInnerContainer: {
    backgroundColor: '#CCFFCC',
    padding: '10px', 
    width: '100%', 
    height: 'auto'
  },
  ul: {
    color: 'blue',
    listStyleType: 'none',
    padding: 0,
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
  },

};

const Button = ({ onClick, children }) => {
  const styles = {
    button: {
      padding: '10px 20px',
      border: 'none',
      backgroundColor: '#007BFF',
      color: 'white',
      borderRadius: '4px',
      cursor: 'pointer',
      transition: 'background-color 0.3s',
      width: '100%',
    },
    buttonHover: {
      backgroundColor: '#0056b3',
    },
    li: {
      margin: '1px 1px',
      width: '30%',
    },
  };

  return (
    <li style={styles.li}>
      <button
        onClick={onClick}
        style={styles.button}
      >
        {children}
      </button>
    </li>
  );
};

export { Button, styles };
