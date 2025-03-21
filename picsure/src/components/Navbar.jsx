import { Link } from 'react-router-dom';
import { useState } from 'react';
import NotificationsIcon from '@material-ui/icons/Notifications';
import AccountCircle from '@material-ui/icons/AccountCircle';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import IconButton from '@material-ui/core/IconButton';
import Avatar from '@material-ui/core/Avatar';
import Badge from '@material-ui/core/Badge';
import Divider from '@material-ui/core/Divider';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import SettingsIcon from '@material-ui/icons/Settings';
import PersonIcon from '@material-ui/icons/Person';
import HomeIcon from '@material-ui/icons/Home';
import ExploreIcon from '@material-ui/icons/Explore';
import AddBoxIcon from '@material-ui/icons/AddBox';
import FavoriteIcon from '@material-ui/icons/FavoriteBorder';
import SearchIcon from '@material-ui/icons/Search';
import InputBase from '@material-ui/core/InputBase';
import { makeStyles } from '@material-ui/core/styles';
import Notifications from './Notifications';
import { alpha } from '@material-ui/core/styles/colorManipulator';
import { useAuth } from '../context/AuthContext';
import { Button } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  navBar: {
    background: '#ffffff',
    borderBottom: '1px solid #dbdbdb',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    padding: theme.spacing(1, 0),
  },
  navContainer: {
    maxWidth: '975px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '60px',
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
  },
  logo: {
    fontWeight: 700,
    fontSize: '1.5rem',
    color: '#262626',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
  },
  search: {
    position: 'relative',
    borderRadius: '8px',
    backgroundColor: alpha('#efefef', 0.9),
    '&:hover': {
      backgroundColor: alpha('#efefef', 1),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(3),
      width: 'auto',
    },
    display: 'flex',
    alignItems: 'center',
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#8e8e8e',
  },
  inputRoot: {
    color: '#262626',
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
    fontSize: '14px',
  },
  navActions: {
    display: 'flex',
    alignItems: 'center',
  },
  navIcons: {
    display: 'flex',
    alignItems: 'center',
    marginRight: theme.spacing(2),
  },
  icon: {
    color: '#262626',
    margin: theme.spacing(0, 1),
    padding: 8,
    '&:hover': {
      color: '#8e8e8e',
    },
  },
  avatar: {
    width: 28,
    height: 28,
    border: '1px solid #dbdbdb',
    '&:hover': {
      cursor: 'pointer',
    },
  },
  menuItem: {
    padding: theme.spacing(1, 2),
    minWidth: 200,
    fontSize: '14px',
  },
  menuIcon: {
    minWidth: 35,
    color: '#262626',
  },
  activeIcon: {
    color: '#262626',
  },
  addPostButton: {
    color: '#262626',
    '&:hover': {
      color: '#8e8e8e',
    },
  },
  mobileNav: {
    display: 'none',
    [theme.breakpoints.down('xs')]: {
      display: 'flex',
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: '#ffffff',
      borderTop: '1px solid #dbdbdb',
      justifyContent: 'space-around',
      padding: theme.spacing(1, 0),
    },
  },
}));

function Navbar({ notifications, setNotifications }) {
  const classes = useStyles();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);
  const [searchValue, setSearchValue] = useState('');

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
  };

  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
  };

  return (
    <nav className={classes.navBar}>
      <div className={classes.navContainer}>
        <div className={classes.logoSection}>
          <Link to="/" className={classes.logo}>
            <span style={{ 
              fontFamily: "'Billabong', cursive", 
              fontSize: '28px'
            }}>
              PicSure
            </span>
          </Link>
        </div>

        <div className={classes.search}>
          <div className={classes.searchIcon}>
            <SearchIcon fontSize="small" />
          </div>
          <InputBase
            placeholder="Search…"
            classes={{
              root: classes.inputRoot,
              input: classes.inputInput,
            }}
            value={searchValue}
            onChange={handleSearchChange}
            inputProps={{ 'aria-label': 'search' }}
          />
        </div>

        <div className={classes.navActions}>
          {user ? (
            <div className={classes.navIcons}>
              <IconButton 
                component={Link} 
                to="/" 
                className={classes.icon} 
                aria-label="home"
              >
                <HomeIcon />
              </IconButton>
              
              <IconButton 
                component={Link} 
                to="/explore" 
                className={classes.icon} 
                aria-label="explore"
              >
                <ExploreIcon />
              </IconButton>
              
              <IconButton 
                component={Link}
                to="/create-post"
                className={classes.icon} 
                aria-label="add post"
              >
                <AddBoxIcon />
              </IconButton>
              
              <Notifications 
                notifications={notifications}
                setNotifications={setNotifications}
              />

              <Avatar 
                src={user?.avatar} 
                className={classes.avatar}
                onClick={handleMenu}
                alt={user?.username || "User"}
              />
              
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={menuOpen}
                onClose={handleClose}
              >
                <MenuItem 
                  component={Link} 
                  to="/profile" 
                  className={classes.menuItem}
                  onClick={handleClose}
                >
                  <ListItemIcon>
                    <PersonIcon className={classes.menuIcon} />
                  </ListItemIcon>
                  Profile
                </MenuItem>
                <MenuItem 
                  component={Link} 
                  to="/settings" 
                  className={classes.menuItem}
                  onClick={handleClose}
                >
                  <ListItemIcon>
                    <SettingsIcon className={classes.menuIcon} />
                  </ListItemIcon>
                  Settings
                </MenuItem>
                <Divider />
                <MenuItem 
                  className={classes.menuItem}
                  onClick={handleLogout}
                >
                  <ListItemIcon>
                    <ExitToAppIcon className={classes.menuIcon} />
                  </ListItemIcon>
                  Logout
                </MenuItem>
              </Menu>
            </div>
          ) : (
            <div className={classes.navIcons}>
              <Button
                component={Link}
                to="/login"
                color="primary"
                variant="contained"
                size="small"
                style={{ marginRight: 8 }}
              >
                Login
              </Button>
              <Button
                component={Link}
                to="/register"
                color="secondary"
                variant="outlined"
                size="small"
              >
                Register
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile bottom navigation */}
      {user && (
        <div className={classes.mobileNav}>
          <IconButton component={Link} to="/" className={classes.icon}>
            <HomeIcon />
          </IconButton>
          <IconButton component={Link} to="/explore" className={classes.icon}>
            <ExploreIcon />
          </IconButton>
          <IconButton className={classes.icon}>
            <AddBoxIcon />
          </IconButton>
          <IconButton component={Link} to="/profile" className={classes.icon}>
            <PersonIcon />
          </IconButton>
        </div>
      )}
    </nav>
  );
}

export default Navbar; 