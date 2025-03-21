import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import PhotoLibraryIcon from '@material-ui/icons/PhotoLibrary';
import GroupIcon from '@material-ui/icons/Group';
import SecurityIcon from '@material-ui/icons/Security';
import Paper from '@material-ui/core/Paper';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';
import CardActions from '@material-ui/core/CardActions';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import FavoriteIcon from '@material-ui/icons/Favorite';
import ChatBubbleOutlineIcon from '@material-ui/icons/ChatBubbleOutline';
import SendIcon from '@material-ui/icons/Send';
import BookmarkBorderIcon from '@material-ui/icons/BookmarkBorder';
import Box from '@material-ui/core/Box';
import Hidden from '@material-ui/core/Hidden';
import Divider from '@material-ui/core/Divider';
import AddIcon from '@material-ui/icons/Add';
import { useAuth } from '../context/AuthContext';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing(3),
    backgroundColor: '#fafafa',
  },
  hero: {
    textAlign: 'center',
    padding: theme.spacing(8, 0),
    backgroundColor: theme.palette.primary.main,
    color: 'white',
    marginBottom: theme.spacing(8),
  },
  heroTitle: {
    marginBottom: theme.spacing(4),
  },
  heroSubtitle: {
    marginBottom: theme.spacing(4),
  },
  featureCard: {
    height: '100%',
    textAlign: 'center',
    padding: theme.spacing(3),
  },
  featureIcon: {
    fontSize: '3rem',
    color: theme.palette.primary.main,
    marginBottom: theme.spacing(2),
  },
  ctaButton: {
    marginTop: theme.spacing(2),
  },
  secondaryButton: {
    marginTop: theme.spacing(2),
    marginLeft: theme.spacing(2),
  },
  ageWarning: {
    backgroundColor: theme.palette.error.light,
    color: theme.palette.error.contrastText,
    padding: theme.spacing(2),
    borderRadius: theme.spacing(1),
    marginBottom: theme.spacing(4),
    textAlign: 'center',
  },
  maxWidth: {
    maxWidth: 935,
    margin: '0 auto',
    padding: theme.spacing(0, 2),
    marginTop: theme.spacing(2),
  },
  storiesContainer: {
    display: 'flex',
    overflowX: 'auto',
    padding: theme.spacing(1.5, 0),
    marginBottom: theme.spacing(3),
    backgroundColor: 'white',
    borderRadius: theme.spacing(1),
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
    '&::-webkit-scrollbar': {
      display: 'none',
    },
    scrollbarWidth: 'none',
  },
  storyItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginRight: theme.spacing(2),
    cursor: 'pointer',
    padding: theme.spacing(1),
  },
  storyAvatar: {
    width: 66,
    height: 66,
    border: '3px solid #e1306c',
    padding: 2,
    backgroundColor: 'white',
    '& > *': {
      width: '100%',
      height: '100%',
    },
  },
  storyUsername: {
    fontSize: '12px',
    marginTop: theme.spacing(0.5),
    maxWidth: 64,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    textAlign: 'center',
    color: '#262626',
  },
  postsContainer: {
    marginBottom: theme.spacing(3),
  },
  post: {
    marginBottom: theme.spacing(2),
    borderRadius: theme.spacing(1),
    border: '1px solid #dbdbdb',
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
    backgroundColor: 'white',
  },
  postHeader: {
    padding: theme.spacing(1.5, 2),
  },
  postAvatar: {
    width: 32,
    height: 32,
  },
  postImage: {
    width: '100%',
    paddingTop: '100%',
    objectFit: 'cover',
  },
  postActions: {
    padding: theme.spacing(0, 1),
  },
  postContent: {
    padding: theme.spacing(1, 2),
  },
  postCaption: {
    fontSize: 14,
    marginBottom: theme.spacing(1),
  },
  postDate: {
    fontSize: 10,
    color: '#8e8e8e',
    textTransform: 'uppercase',
    marginTop: theme.spacing(1),
  },
  likeCount: {
    fontSize: 14,
    fontWeight: 600,
    marginBottom: theme.spacing(0.5),
  },
  commentIcon: {
    marginLeft: theme.spacing(1.5),
    marginRight: theme.spacing(1.5),
  },
  actionIcon: {
    color: '#262626',
    padding: theme.spacing(1),
    '&:hover': {
      color: theme.palette.primary.main,
    },
  },
  saveIcon: {
    marginLeft: 'auto',
  },
  sidebarContainer: {
    position: 'sticky',
    top: 90,
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(2, 0),
  },
  userAvatar: {
    width: 56,
    height: 56,
    marginRight: theme.spacing(2),
  },
  userName: {
    fontWeight: 600,
    color: '#262626',
  },
  fullName: {
    color: '#8e8e8e',
  },
  suggestionsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: theme.spacing(1.5, 0),
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: '#8e8e8e',
  },
  seeAllLink: {
    fontSize: 12,
    fontWeight: 600,
    color: '#262626',
    textDecoration: 'none',
  },
  suggestionItem: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(1, 0),
  },
  suggestionAvatar: {
    width: 32,
    height: 32,
    marginRight: theme.spacing(1.5),
  },
  suggestionUserInfo: {
    flex: 1,
  },
  suggestionUsername: {
    fontSize: 14,
    fontWeight: 600,
    color: '#262626',
  },
  suggestionReason: {
    fontSize: 12,
    color: '#8e8e8e',
  },
  followButton: {
    color: '#0095f6',
    fontWeight: 600,
    fontSize: 12,
    padding: 0,
    textTransform: 'none',
  },
  footer: {
    marginTop: theme.spacing(3),
    fontSize: 12,
    color: '#c7c7c7',
  },
  footerLinks: {
    display: 'flex',
    flexWrap: 'wrap',
    marginBottom: theme.spacing(1),
    '& > *': {
      marginRight: theme.spacing(1),
      marginBottom: theme.spacing(0.5),
      color: '#c7c7c7',
      textDecoration: 'none',
    },
  },
  emptyFeed: {
    textAlign: 'center',
    padding: theme.spacing(4),
    backgroundColor: 'white',
    borderRadius: theme.spacing(1),
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
  },
  emptyFeedIcon: {
    fontSize: 48,
    color: '#dbdbdb',
    marginBottom: theme.spacing(2),
  },
  emptyFeedText: {
    color: '#8e8e8e',
      marginBottom: theme.spacing(2),
  },
  createPostLink: {
    color: theme.palette.primary.main,
    textDecoration: 'none',
    fontWeight: 600,
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  createPostButton: {
    position: 'fixed',
    bottom: theme.spacing(4),
    right: theme.spacing(4),
    backgroundColor: theme.palette.primary.main,
    color: 'white',
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  },
  tabs: {
    marginBottom: theme.spacing(3),
    borderRadius: theme.spacing(1),
    backgroundColor: 'white',
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
  },
  albumGrid: {
    marginBottom: theme.spacing(3),
  },
  albumCard: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    cursor: 'pointer',
    transition: 'transform 0.2s',
    '&:hover': {
      transform: 'scale(1.02)',
    },
  },
  albumCardMedia: {
    paddingTop: '100%', // 1:1 aspect ratio
    backgroundSize: 'cover',
  },
  albumCardContent: {
    flexGrow: 1,
    padding: theme.spacing(1, 2),
  },
  albumTitle: {
    fontWeight: 600,
    marginBottom: theme.spacing(0.5),
  },
  albumInfo: {
    color: '#8e8e8e',
    fontSize: 12,
  },
}));

const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d`;
  if (hours > 0) return `${hours}h`;
  if (minutes > 0) return `${minutes}m`;
  return 'just now';
};

// Mock data for albums
const MOCK_ALBUMS = [
  {
    id: 1,
    title: "Summer Vacation",
    thumbnail: "https://source.unsplash.com/random/300x300/?summer",
    username: "emma_watson",
    userAvatar: "https://source.unsplash.com/random/32x32/?woman",
    photoCount: 24,
    timestamp: new Date(Date.now() - 3600000 * 24 * 2)
  },
  {
    id: 2,
    title: "City Landscapes",
    thumbnail: "https://source.unsplash.com/random/300x300/?city",
    username: "john_doe",
    userAvatar: "https://source.unsplash.com/random/32x32/?man",
    photoCount: 18,
    timestamp: new Date(Date.now() - 3600000 * 24 * 5)
  },
  {
    id: 3,
    title: "Food Photography",
    thumbnail: "https://source.unsplash.com/random/300x300/?food",
    username: "chef_julia",
    userAvatar: "https://source.unsplash.com/random/32x32/?chef",
    photoCount: 42,
    timestamp: new Date(Date.now() - 3600000 * 24 * 1)
  },
  {
    id: 4,
    title: "Nature Exploration",
    thumbnail: "https://source.unsplash.com/random/300x300/?nature",
    username: "mark_wild",
    userAvatar: "https://source.unsplash.com/random/32x32/?hiker",
    photoCount: 31,
    timestamp: new Date(Date.now() - 3600000 * 24 * 8)
  },
  {
    id: 5,
    title: "Street Art",
    thumbnail: "https://source.unsplash.com/random/300x300/?graffiti",
    username: "artistic_soul",
    userAvatar: "https://source.unsplash.com/random/32x32/?artist",
    photoCount: 16,
    timestamp: new Date(Date.now() - 3600000 * 24 * 3)
  },
  {
    id: 6,
    title: "Pet Photography",
    thumbnail: "https://source.unsplash.com/random/300x300/?pets",
    username: "animal_lover",
    userAvatar: "https://source.unsplash.com/random/32x32/?person",
    photoCount: 28,
    timestamp: new Date(Date.now() - 3600000 * 24 * 4)
  }
];

// Mock data for posts
const MOCK_POSTS = [
  {
    id: 101,
    username: "emma_watson",
    userAvatar: "https://source.unsplash.com/random/32x32/?woman",
    imageUrl: "https://source.unsplash.com/random/600x600/?beach",
    caption: "Beautiful day at the beach! 🏖️ #summer #vacation",
    likes: 124,
    liked: false,
    comments: [{user: "john_doe", text: "Looks amazing!"}],
    timestamp: new Date(Date.now() - 3600000 * 2)
  },
  {
    id: 102,
    username: "john_doe",
    userAvatar: "https://source.unsplash.com/random/32x32/?man",
    imageUrl: "https://source.unsplash.com/random/600x600/?city",
    caption: "City vibes 🏙️ #urban #photography",
    likes: 89,
    liked: false,
    comments: [{user: "chef_julia", text: "Great composition!"}],
    timestamp: new Date(Date.now() - 3600000 * 5)
  },
  {
    id: 103,
    username: "chef_julia",
    userAvatar: "https://source.unsplash.com/random/32x32/?chef",
    imageUrl: "https://source.unsplash.com/random/600x600/?food",
    caption: "Homemade pasta! 🍝 #cooking #foodie",
    likes: 212,
    liked: false,
    comments: [{user: "mark_wild", text: "Looks delicious!"}, {user: "artistic_soul", text: "Recipe please!"}],
    timestamp: new Date(Date.now() - 3600000 * 8)
  }
];

function Home() {
  const classes = useStyles();
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    // Fetch posts and albums from your backend
    const fetchData = async () => {
      try {
        // Replace with your actual API calls
        // const postsResponse = await fetch('/api/posts');
        // const postsData = await postsResponse.json();
        // setPosts(postsData);
        
        // const albumsResponse = await fetch('/api/albums');
        // const albumsData = await albumsResponse.json();
        // setAlbums(albumsData);
        
        // Using mock data for now
        setPosts(MOCK_POSTS);
        setAlbums(MOCK_ALBUMS);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLike = async (postId) => {
    try {
      // Replace with your actual API call
      // await fetch(`/api/posts/${postId}/like`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      // });
      
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 }
          : post
      ));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <div className={classes.root}>
      <div className={classes.maxWidth}>
        <Paper className={classes.tabs}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            centered
          >
            <Tab label="Feed" />
            <Tab label="Albums" />
          </Tabs>
        </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
            {loading ? (
              <div>Loading...</div>
            ) : (
              <>
                {tabValue === 0 && (
                  <div className={classes.postsContainer}>
                    {posts.length === 0 ? (
                      <div className={classes.emptyFeed}>
                        <PhotoLibraryIcon className={classes.emptyFeedIcon} />
                        <Typography variant="h6" className={classes.emptyFeedText}>
                          No posts yet
                </Typography>
                        <Link to="/create-post" className={classes.createPostLink}>
                          Create your first post
                        </Link>
              </div>
                    ) : (
                      posts.map((post) => (
              <Card key={post.id} className={classes.post}>
                <CardHeader
                  avatar={
                              <Avatar src={post.userAvatar} className={classes.postAvatar} />
                  }
                  action={
                              <IconButton>
                      <MoreHorizIcon />
                    </IconButton>
                  }
                            title={post.username}
                            subheader={formatTimestamp(post.timestamp)}
                />
                <CardMedia
                            component="img"
                            image={post.imageUrl}
                            alt={post.caption}
                  className={classes.postImage}
                          />
                          <CardActions className={classes.postActions}>
                            <IconButton onClick={() => handleLike(post.id)}>
                              {post.liked ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
                  </IconButton>
                            <IconButton className={classes.commentIcon}>
                    <ChatBubbleOutlineIcon />
                  </IconButton>
                            <IconButton className={classes.saveIcon}>
                    <BookmarkBorderIcon />
                  </IconButton>
                </CardActions>
                <CardContent className={classes.postContent}>
                            <Typography variant="body2" className={classes.likeCount}>
                              {post.likes} likes
                  </Typography>
                            <Typography variant="body2" className={classes.postCaption}>
                              <strong>{post.username}</strong> {post.caption}
                  </Typography>
                            <Typography variant="caption" className={classes.postDate}>
                    {formatTimestamp(post.timestamp)}
                  </Typography>
                </CardContent>
              </Card>
                      ))
                    )}
          </div>
                )}

                {tabValue === 1 && (
                  <div className={classes.albumGrid}>
                    <Grid container spacing={2}>
                      {albums.length === 0 ? (
                        <Grid item xs={12}>
                          <div className={classes.emptyFeed}>
                            <PhotoLibraryIcon className={classes.emptyFeedIcon} />
                            <Typography variant="h6" className={classes.emptyFeedText}>
                              No albums yet
                  </Typography>
                            <Link to="/albums/create" className={classes.createPostLink}>
                              Create your first album
                  </Link>
                </div>
                        </Grid>
                      ) : (
                        albums.map((album) => (
                          <Grid item xs={12} sm={6} md={4} key={album.id}>
                            <Card className={classes.albumCard} component={Link} to={`/albums/${album.id}`}>
                              <CardMedia
                                className={classes.albumCardMedia}
                                image={album.thumbnail}
                                title={album.title}
                              />
                              <CardContent className={classes.albumCardContent}>
                                <Typography variant="body1" className={classes.albumTitle}>
                                  {album.title}
                      </Typography>
                                <Typography variant="body2" className={classes.albumInfo}>
                                  By {album.username} • {album.photoCount} photos • {formatTimestamp(album.timestamp)}
                      </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))
                      )}
                    </Grid>
                  </div>
                )}
              </>
            )}
          </Grid>

          <Grid item xs={12} md={4}>
            <Hidden smDown>
              <div className={classes.sidebarContainer}>
                <Card>
                  <CardContent>
                    <Box className={classes.userInfo}>
                      <Avatar src={user?.avatar} className={classes.userAvatar} />
                      <Box>
                        <Typography variant="subtitle1" className={classes.userName}>
                          {user?.username}
                        </Typography>
                        <Typography variant="body2" className={classes.fullName}>
                          {user?.fullName}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </div>
            </Hidden>
          </Grid>
      </Grid>
      </div>

      {/* Create Post Button */}
      {tabValue === 0 ? (
        <Link to="/create-post">
          <Button
            variant="contained"
            color="primary"
            className={classes.createPostButton}
            startIcon={<AddIcon />}
          >
            Create Post
          </Button>
        </Link>
      ) : (
        <Link to="/albums/create">
          <Button
            variant="contained"
            color="primary"
            className={classes.createPostButton}
            startIcon={<AddIcon />}
          >
            Create Album
          </Button>
        </Link>
      )}
    </div>
  );
}

export default Home; 