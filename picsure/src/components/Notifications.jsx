import { useState } from 'react';
import NotificationsIcon from '@material-ui/icons/Notifications';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Badge from '@material-ui/core/Badge';
import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import { makeStyles } from '@material-ui/core/styles';
import { format, formatDistanceToNow } from 'date-fns';

const useStyles = makeStyles((theme) => ({
  icon: {
    color: '#262626',
    margin: theme.spacing(0, 1),
    padding: 8,
    '&:hover': {
      color: '#8e8e8e',
    },
  },
  menu: {
    width: 360,
    maxHeight: 480,
    overflow: 'auto',
    padding: 0,
    borderRadius: '6px',
    boxShadow: '0 0 5px rgba(0,0,0,0.1)',
  },
  menuHeader: {
    padding: theme.spacing(2),
    fontWeight: 600,
    fontSize: '16px',
    borderBottom: '1px solid #efefef',
  },
  emptyText: {
    padding: theme.spacing(4),
    textAlign: 'center',
    color: '#8e8e8e',
    fontSize: '14px',
  },
  notificationItem: {
    padding: theme.spacing(1.5),
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    transition: 'background-color 0.2s',
    '&:hover': {
      backgroundColor: '#fafafa',
    },
  },
  notificationContent: {
    flex: 1,
  },
  notificationText: {
    fontSize: '14px',
    lineHeight: 1.4,
  },
  notificationActions: {
    display: 'flex',
    gap: theme.spacing(1),
    marginTop: theme.spacing(1),
  },
  acceptButton: {
    backgroundColor: '#0095f6',
    color: 'white',
    fontWeight: 600,
    fontSize: '12px',
    textTransform: 'none',
    padding: '3px 12px',
    '&:hover': {
      backgroundColor: '#1877f2',
    },
  },
  declineButton: {
    backgroundColor: '#efefef',
    color: '#262626',
    fontWeight: 600,
    fontSize: '12px',
    textTransform: 'none',
    padding: '3px 12px',
    '&:hover': {
      backgroundColor: '#dbdbdb',
    },
  },
  notificationTime: {
    fontSize: '11px',
    color: '#8e8e8e',
    marginTop: theme.spacing(0.5),
  },
  avatar: {
    width: 44,
    height: 44,
  },
}));

function Notifications({ notifications = [], setNotifications }) {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleAcceptFriendRequest = (notificationId) => {
    // TODO: Implement friend request acceptance
    setNotifications(notifications.filter(n => n.id !== notificationId));
  };

  const handleDeclineFriendRequest = (notificationId) => {
    // TODO: Implement friend request decline
    setNotifications(notifications.filter(n => n.id !== notificationId));
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    if (Date.now() - date.getTime() < 24 * 60 * 60 * 1000) {
      return formatDistanceToNow(date, { addSuffix: true });
    }
    return format(date, 'MMM d');
  };

  return (
    <>
      <IconButton 
        className={classes.icon}
        aria-label="notifications"
        onClick={handleClick}
      >
        <Badge badgeContent={notifications.length} color="secondary" overlap="rectangular">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          className: classes.menu,
        }}
        getContentAnchorEl={null}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Typography className={classes.menuHeader}>
          Notifications
        </Typography>
        
        {notifications.length === 0 ? (
          <Typography className={classes.emptyText}>
            You don't have any notifications yet
          </Typography>
        ) : (
          notifications.map((notification) => (
            <MenuItem key={notification.id} className={classes.notificationItem} disableRipple>
              <Avatar 
                src={notification.avatar || `https://i.pravatar.cc/150?u=${notification.id}`} 
                className={classes.avatar}
              />
              <div className={classes.notificationContent}>
                <Typography variant="body2" className={classes.notificationText}>
                  <strong>{notification.sender || 'Someone'}</strong> {notification.message}
                </Typography>
                <Typography className={classes.notificationTime}>
                  {formatTimestamp(notification.timestamp)}
                </Typography>
                
                {notification.type === 'friend_request' && (
                  <div className={classes.notificationActions}>
                    <Button
                      size="small"
                      variant="contained"
                      className={classes.acceptButton}
                      onClick={() => handleAcceptFriendRequest(notification.id)}
                      disableElevation
                    >
                      Confirm
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      className={classes.declineButton}
                      onClick={() => handleDeclineFriendRequest(notification.id)}
                      disableElevation
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
}

export default Notifications; 