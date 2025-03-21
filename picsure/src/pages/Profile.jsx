import { useState, useEffect } from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import EditIcon from '@material-ui/icons/Edit';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import GridOnIcon from '@material-ui/icons/GridOn';
import BookmarkBorderIcon from '@material-ui/icons/BookmarkBorder';
import AccountBoxIcon from '@material-ui/icons/AccountBox';
import SettingsIcon from '@material-ui/icons/Settings';
import Divider from '@material-ui/core/Divider';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: 935,
    margin: '0 auto',
    padding: theme.spacing(3),
  },
  profileHeader: {
    display: 'flex',
    marginBottom: theme.spacing(5),
    [theme.breakpoints.down('xs')]: {
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
    },
  },
  avatarSection: {
    marginRight: theme.spacing(8),
    display: 'flex',
    justifyContent: 'center',
    [theme.breakpoints.down('xs')]: {
      marginRight: 0,
      marginBottom: theme.spacing(3),
    },
  },
  avatar: {
    width: 150,
    height: 150,
    border: '1px solid #dbdbdb',
  },
  profileInfo: {
    flex: 1,
  },
  profileUsernameLine: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
    [theme.breakpoints.down('xs')]: {
      justifyContent: 'center',
      flexDirection: 'column',
    },
  },
  username: {
    fontSize: 28,
    fontWeight: 300,
    lineHeight: '32px',
    marginRight: theme.spacing(2),
  },
  editProfileButton: {
    height: 30,
    fontSize: 14,
    fontWeight: 600,
    textTransform: 'none',
    padding: '0 24px',
    backgroundColor: 'transparent',
    border: '1px solid #dbdbdb',
    borderRadius: 4,
    marginRight: theme.spacing(1),
    '&:hover': {
      backgroundColor: '#fafafa',
    },
  },
  settingsButton: {
    padding: 8,
  },
  statsList: {
    display: 'flex',
    marginBottom: theme.spacing(2),
    '& > *': {
      marginRight: theme.spacing(4),
      fontSize: 16,
    },
    [theme.breakpoints.down('xs')]: {
      justifyContent: 'space-around',
      '& > *': {
        marginRight: 0,
      },
    },
  },
  statItem: {
    '& span': {
      fontWeight: 600,
    },
  },
  fullName: {
    fontSize: 16,
    fontWeight: 600,
    marginBottom: theme.spacing(0.5),
  },
  bioText: {
    fontSize: 16,
    lineHeight: 1.5,
  },
  website: {
    color: '#00376b',
    fontWeight: 600,
    textDecoration: 'none',
  },
  highlights: {
    display: 'flex',
    overflowX: 'auto',
    padding: theme.spacing(2, 0),
    '&::-webkit-scrollbar': {
      display: 'none',
    },
    scrollbarWidth: 'none',
  },
  highlightItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginRight: theme.spacing(4),
  },
  highlightAvatar: {
    width: 77,
    height: 77,
    border: '1px solid #dbdbdb',
    padding: 3,
    marginBottom: theme.spacing(1),
    '& > *': {
      border: '1px solid #dbdbdb',
    },
  },
  highlightName: {
    fontSize: 12,
    color: '#262626',
  },
  tabsRoot: {
    borderTop: '1px solid #dbdbdb',
    marginBottom: theme.spacing(2),
  },
  tab: {
    textTransform: 'none',
    fontSize: 12,
    fontWeight: 600,
    minWidth: 'auto',
    padding: '12px 0',
    marginRight: theme.spacing(6),
    '&.Mui-selected': {
      color: '#262626',
    },
    '& .MuiTab-wrapper': {
      flexDirection: 'row',
      '& > *:first-child': {
        marginBottom: '0 !important',
        marginRight: theme.spacing(1),
      },
    },
  },
  tabIndicator: {
    backgroundColor: '#262626',
  },
  postsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 28,
    [theme.breakpoints.down('xs')]: {
      gap: 3,
    },
  },
  postItem: {
    position: 'relative',
    paddingBottom: '100%',
    backgroundColor: '#fafafa',
    cursor: 'pointer',
    '&:hover $postOverlay': {
      opacity: 1,
    },
  },
  postImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  postOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.3)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0,
    transition: 'opacity 0.2s ease',
  },
  postStats: {
    display: 'flex',
    color: 'white',
    fontWeight: 600,
    '& > *': {
      display: 'flex',
      alignItems: 'center',
      marginRight: theme.spacing(3),
      '& svg': {
        marginRight: theme.spacing(1),
      },
    },
  },
  noPostsMessage: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    padding: theme.spacing(4),
    color: '#8e8e8e',
  },
  dialog: {
    minWidth: '400px',
  },
  uploadButton: {
    display: 'none',
  },
}));

// Mock data for photo posts
const MOCK_POSTS = [
  {
    id: 1,
    image: 'https://source.unsplash.com/random/600x600?nature',
    likes: 142,
    comments: 24,
  },
  {
    id: 2,
    image: 'https://source.unsplash.com/random/600x600?city',
    likes: 89,
    comments: 12,
  },
  {
    id: 3,
    image: 'https://source.unsplash.com/random/600x600?people',
    likes: 217,
    comments: 32,
  },
  {
    id: 4,
    image: 'https://source.unsplash.com/random/600x600?food',
    likes: 55,
    comments: 4,
  },
  {
    id: 5,
    image: 'https://source.unsplash.com/random/600x600?travel',
    likes: 76,
    comments: 8,
  },
  {
    id: 6,
    image: 'https://source.unsplash.com/random/600x600?animals',
    likes: 93,
    comments: 15,
  },
  {
    id: 7,
    image: 'https://source.unsplash.com/random/600x600?architecture',
    likes: 45,
    comments: 5,
  },
  {
    id: 8,
    image: 'https://source.unsplash.com/random/600x600?interior',
    likes: 112,
    comments: 18,
  },
  {
    id: 9,
    image: 'https://source.unsplash.com/random/600x600?fashion',
    likes: 133,
    comments: 22,
  },
];

// Mock highlights
const MOCK_HIGHLIGHTS = [
  { id: 1, name: 'Travel', image: 'https://source.unsplash.com/random/150x150?travel' },
  { id: 2, name: 'Food', image: 'https://source.unsplash.com/random/150x150?food' },
  { id: 3, name: 'Friends', image: 'https://source.unsplash.com/random/150x150?people' },
  { id: 4, name: 'Nature', image: 'https://source.unsplash.com/random/150x150?nature' },
];

function Profile({ user, setUser }) {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    username: '',
    fullName: '',
    bio: '',
    website: '',
    email: '',
    phone: '',
    profilePicture: null,
  });
  const [errors, setErrors] = useState({});
  const [tabValue, setTabValue] = useState(0);
  const [stats, setStats] = useState({
    posts: MOCK_POSTS.length,
    followers: 348,
    following: 283,
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.name || '',
        fullName: user.name || '',
        bio: user.bio || 'Loving life and sharing moments ✨',
        website: user.website || 'https://picsure.com',
        email: user.email || '',
        phone: user.phone || '',
        profilePicture: user.profilePicture,
      });
    }
  }, [user]);

  const handleEdit = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData(prev => ({
          ...prev,
          profilePicture: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!profileData.username) {
      newErrors.username = 'Username is required';
    }
    if (!profileData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      newErrors.email = 'Email is invalid';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    // Update user data
    const updatedUser = {
      ...user,
      name: profileData.username,
      email: profileData.email,
      profilePicture: profileData.profilePicture,
      bio: profileData.bio,
      website: profileData.website,
    };

    setUser(updatedUser);
    setOpen(false);
  };

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '32px' }}>
        <Typography variant="h5">Please login to view your profile</Typography>
      </div>
    );
  }

  return (
    <div className={classes.root}>
      <div className={classes.profileHeader}>
        <div className={classes.avatarSection}>
          <Avatar
            src={profileData.profilePicture}
            className={classes.avatar}
            alt={profileData.username}
          />
        </div>
        
        <div className={classes.profileInfo}>
          <div className={classes.profileUsernameLine}>
            <Typography component="h1" className={classes.username}>
              {profileData.username}
            </Typography>
            <Button
              variant="outlined"
              className={classes.editProfileButton}
              onClick={handleEdit}
            >
              Edit Profile
            </Button>
            <Button className={classes.settingsButton}>
              <SettingsIcon />
            </Button>
          </div>
          
          <div className={classes.statsList}>
            <Typography component="span" className={classes.statItem}>
              <span>{stats.posts}</span> posts
            </Typography>
            <Typography component="span" className={classes.statItem}>
              <span>{stats.followers}</span> followers
            </Typography>
            <Typography component="span" className={classes.statItem}>
              <span>{stats.following}</span> following
            </Typography>
          </div>
          
          <div>
            <Typography className={classes.fullName}>
              {profileData.fullName}
            </Typography>
            <Typography className={classes.bioText}>
              {profileData.bio}
            </Typography>
            <Typography>
              <a href={profileData.website} className={classes.website} target="_blank" rel="noopener noreferrer">
                {profileData.website}
              </a>
            </Typography>
          </div>
        </div>
      </div>
      
      {/* Story Highlights */}
      <div className={classes.highlights}>
        {MOCK_HIGHLIGHTS.map(highlight => (
          <div key={highlight.id} className={classes.highlightItem}>
            <div className={classes.highlightAvatar}>
              <Avatar src={highlight.image} alt={highlight.name} />
            </div>
            <Typography className={classes.highlightName}>
              {highlight.name}
            </Typography>
          </div>
        ))}
      </div>
      
      <div className={classes.tabsRoot}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          centered
          classes={{ indicator: classes.tabIndicator }}
        >
          <Tab 
            icon={<GridOnIcon />} 
            label="POSTS" 
            className={classes.tab}
          />
          <Tab 
            icon={<BookmarkBorderIcon />} 
            label="SAVED" 
            className={classes.tab}
          />
          <Tab 
            icon={<AccountBoxIcon />} 
            label="TAGGED" 
            className={classes.tab}
          />
        </Tabs>
      </div>
      
      {/* Photo Grid */}
      <div className={classes.postsGrid}>
        {tabValue === 0 && MOCK_POSTS.length > 0 ? (
          MOCK_POSTS.map(post => (
            <div key={post.id} className={classes.postItem}>
              <img 
                src={post.image} 
                alt={`Post ${post.id}`} 
                className={classes.postImage}
              />
              <div className={classes.postOverlay}>
                <div className={classes.postStats}>
                  <div>
                    <FavoriteIcon /> {post.likes}
                  </div>
                  <div>
                    <ChatBubbleOutlineIcon /> {post.comments}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className={classes.noPostsMessage}>
            <Typography variant="body1">
              {tabValue === 0 
                ? "No posts yet." 
                : tabValue === 1 
                  ? "No saved posts yet." 
                  : "No tagged posts yet."}
            </Typography>
          </div>
        )}
      </div>
      
      {/* Edit Profile Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <Avatar src={profileData.profilePicture} style={{ width: 100, height: 100 }} />
          </div>
          
          <input
            accept="image/*"
            className={classes.uploadButton}
            id="profile-picture"
            type="file"
            onChange={handleFileChange}
          />
          <label htmlFor="profile-picture" style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <Button
              component="span"
              variant="outlined"
              startIcon={<CloudUploadIcon />}
            >
              Change Profile Picture
            </Button>
          </label>
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                name="username"
                label="Username"
                value={profileData.username}
                onChange={handleChange}
                variant="outlined"
                fullWidth
                error={!!errors.username}
                helperText={errors.username}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="fullName"
                label="Full Name"
                value={profileData.fullName}
                onChange={handleChange}
                variant="outlined"
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="bio"
                label="Bio"
                value={profileData.bio}
                onChange={handleChange}
                variant="outlined"
                multiline
                rows={3}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="website"
                label="Website"
                value={profileData.website}
                onChange={handleChange}
                variant="outlined"
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="email"
                label="Email"
                value={profileData.email}
                onChange={handleChange}
                variant="outlined"
                fullWidth
                error={!!errors.email}
                helperText={errors.email}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="phone"
                label="Phone Number"
                value={profileData.phone}
                onChange={handleChange}
                variant="outlined"
                fullWidth
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary" variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default Profile; 