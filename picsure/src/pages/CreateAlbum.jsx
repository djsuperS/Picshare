import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import PhotoIcon from '@material-ui/icons/Photo';
import { useAuth } from '../context/AuthContext';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing(3),
    backgroundColor: '#f8f9fa',
    minHeight: 'calc(100vh - 64px)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(4),
    gap: theme.spacing(2),
  },
  form: {
    width: '100%',
    maxWidth: 600,
    marginTop: theme.spacing(3),
    padding: theme.spacing(3),
    backgroundColor: 'white',
    borderRadius: theme.spacing(1),
    boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  thumbnailPreview: {
    width: '100%',
    height: 200,
    backgroundColor: '#f5f5f5',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
    borderRadius: theme.spacing(1),
    overflow: 'hidden',
    position: 'relative',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  infoCard: {
    marginBottom: theme.spacing(3),
  },
  thumbnailPlaceholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(2),
    backgroundColor: '#f5f5f5',
    borderRadius: theme.spacing(1),
    height: 200,
    cursor: 'pointer',
    border: '2px dashed #ccc',
  },
  thumbnailIcon: {
    fontSize: 48,
    color: '#bbb',
    marginBottom: theme.spacing(1),
  },
}));

function CreateAlbum() {
  const classes = useStyles();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [albumData, setAlbumData] = useState({
    title: '',
    description: '',
    privacy: 'public',
  });
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAlbumData({ ...albumData, [name]: value });
  };

  const handleThumbnailChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!albumData.title.trim()) {
      setError('Album title is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // You can replace this with your actual API call
      // For now, we'll just simulate an API call with a timeout
      // const formData = new FormData();
      // formData.append('title', albumData.title);
      // formData.append('description', albumData.description);
      // formData.append('privacy', albumData.privacy);
      // if (thumbnail) {
      //   formData.append('thumbnail', thumbnail);
      // }
      
      // const response = await fetch('/api/albums', {
      //   method: 'POST',
      //   body: formData,
      // });
      
      // if (!response.ok) {
      //   throw new Error('Failed to create album');
      // }
      
      // const data = await response.json();
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to the newly created album
      // In a real app, you would use the ID from the API response
      const mockAlbumId = Math.floor(Math.random() * 1000) + 1;
      navigate(`/albums/${mockAlbumId}`);
    } catch (error) {
      console.error('Error creating album:', error);
      setError('Failed to create album. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <div className={classes.root}>
      <div className={classes.header}>
        <IconButton onClick={handleCancel}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" component="h1">
          Create New Album
        </Typography>
      </div>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper className={classes.form} component="form" onSubmit={handleSubmit}>
            <Typography variant="h6" gutterBottom>
              Album Details
            </Typography>

            <TextField
              name="title"
              label="Album Title"
              variant="outlined"
              fullWidth
              margin="normal"
              value={albumData.title}
              onChange={handleInputChange}
              required
            />

            <TextField
              name="description"
              label="Description"
              variant="outlined"
              fullWidth
              margin="normal"
              multiline
              rows={4}
              value={albumData.description}
              onChange={handleInputChange}
            />

            <TextField
              name="privacy"
              select
              label="Privacy"
              value={albumData.privacy}
              onChange={handleInputChange}
              SelectProps={{
                native: true,
              }}
              variant="outlined"
              fullWidth
              margin="normal"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="friends">Friends Only</option>
            </TextField>

            <Typography variant="subtitle1" gutterBottom style={{ marginTop: 16 }}>
              Album Thumbnail
            </Typography>

            {thumbnailPreview ? (
              <div className={classes.thumbnailPreview}>
                <img
                  src={thumbnailPreview}
                  alt="Thumbnail preview"
                  className={classes.thumbnailImage}
                />
              </div>
            ) : (
              <label htmlFor="thumbnail-upload">
                <div className={classes.thumbnailPlaceholder}>
                  <PhotoIcon className={classes.thumbnailIcon} />
                  <Typography variant="body2" color="textSecondary">
                    Click to upload a thumbnail image
                  </Typography>
                </div>
                <input
                  id="thumbnail-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  style={{ display: 'none' }}
                />
              </label>
            )}

            {error && (
              <Typography variant="body2" color="error" style={{ marginTop: 16 }}>
                {error}
              </Typography>
            )}

            <Grid container spacing={2} style={{ marginTop: 16 }}>
              <Grid item xs={12} sm={6}>
                <Button
                  variant="outlined"
                  color="primary"
                  fullWidth
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Album'}
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card className={classes.infoCard}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tips for Creating Albums
              </Typography>
              <Typography variant="body2" paragraph>
                • Choose a descriptive title for your album
              </Typography>
              <Typography variant="body2" paragraph>
                • Add a detailed description to help others understand what your album is about
              </Typography>
              <Typography variant="body2" paragraph>
                • Select an eye-catching thumbnail to make your album stand out
              </Typography>
              <Typography variant="body2">
                • Set the appropriate privacy level depending on who you want to share with
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
}

export default CreateAlbum; 