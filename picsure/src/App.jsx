import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import { ThemeProvider, makeStyles, createTheme } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import './App.css';

// Components
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Albums from './pages/Albums';
import AlbumDetail from './pages/AlbumDetail';
import CreateAlbum from './pages/CreateAlbum';
import CreatePost from './pages/CreatePost';
import { AuthProvider } from './context/AuthContext';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const useStyles = makeStyles((theme) => ({
  appContainer: {
    minHeight: '100vh',
    background: '#f8f9fa',
  },
  mainContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: theme.spacing(3),
  },
}));

function App() {
  const classes = useStyles();
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'friend_request',
      message: 'Alex sent you a friend request',
      timestamp: new Date(),
    },
    {
      id: 2,
      type: 'like',
      message: 'Sarah liked your photo',
      timestamp: new Date(),
    },
  ]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <div className={classes.appContainer}>
            <Navbar notifications={notifications} setNotifications={setNotifications} />
            <main className={classes.mainContent}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/albums" element={<Albums />} />
                <Route path="/albums/create" element={<CreateAlbum />} />
                <Route path="/albums/:id" element={<AlbumDetail />} />
                <Route path="/create-post" element={<CreatePost />} />
              </Routes>
            </main>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
