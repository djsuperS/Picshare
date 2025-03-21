import { useState, useEffect } from 'react';
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
import AddAPhotoIcon from '@material-ui/icons/AddAPhoto';
import CancelIcon from '@material-ui/icons/Cancel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import Divider from '@material-ui/core/Divider';
import ImageList from '@material-ui/core/ImageList';
import ImageListItem from '@material-ui/core/ImageListItem';
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
    marginTop: theme.spacing(3),
    padding: theme.spacing(3),
    backgroundColor: 'white',
    borderRadius: theme.spacing(1),
    boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  imagePreview: {
    width: '100%',
    height: 300,
    backgroundColor: '#f5f5f5',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
    borderRadius: theme.spacing(1),
    overflow: 'hidden',
    position: 'relative',
  },
  imagePreviewImg: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  infoCard: {
    marginBottom: theme.spacing(3),
  },
  imagePlaceholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(2),
    backgroundColor: '#f5f5f5',
    borderRadius: theme.spacing(1),
    height: 300,
    cursor: 'pointer',
    border: '2px dashed #ccc',
  },
  imageIcon: {
    fontSize: 48,
    color: '#bbb',
    marginBottom: theme.spacing(1),
  },
  removeImage: {
    position: 'absolute',
    top: theme.spacing(1),
    right: theme.spacing(1),
    backgroundColor: 'rgba(0,0,0,0.5)',
    color: 'white',
    '&:hover': {
      backgroundColor: 'rgba(0,0,0,0.7)',
    },
  },
  imageList: {
    width: '100%',
    height: 150,
    marginTop: theme.spacing(2),
  },
  albumSelect: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  divider: {
    margin: theme.spacing(3, 0),
  },
}));

// Mock albums for selection
const MOCK_ALBUMS = [
  { id: 1, name: 'Summer Vacation' },
  { id: 2, name: 'Family Photos' },
  { id: 3, name: 'Travel Memories' },
  { id: 4, name: 'Food Photography' },
];

function CreatePost() {
  const classes = useStyles();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [postData, setPostData] = useState({
    caption: '',
    album: '',
    location: '',
  });
  const [images, setImages] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [albums, setAlbums] = useState([]);

  useEffect(() => {
    // In a real app, you would fetch the user's albums here
    // For now, we'll use mock data
    setAlbums(MOCK_ALBUMS);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPostData({ ...postData, [name]: value });
  };

  const handleImageChange = (e) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const newImages = [...images, ...selectedFiles];
      setImages(newImages);
      
      // Set the first image as preview if it's the first upload
      if (!imagePreview && selectedFiles.length > 0) {
        setImagePreview(URL.createObjectURL(selectedFiles[0]));
      }
    }
  };

  const handleRemoveImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
    
    // Update preview if the current preview was removed
    if (newImages.length > 0) {
      setImagePreview(URL.createObjectURL(newImages[0]));
    } else {
      setImagePreview(null);
    }
  };

  const handleSetPreview = (index) => {
    setImagePreview(URL.createObjectURL(images[index]));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (images.length === 0) {
      setError('Please select at least one image');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // In a real app, you would send the post data and images to your API
      // For now, we'll just simulate an API call with a timeout
      
      // const formData = new FormData();
      // formData.append('caption', postData.caption);
      // formData.append('album_id', postData.album);
      // formData.append('location', postData.location);
      
      // images.forEach((image, index) => {
      //   formData.append(`image_${index}`, image);
      // });
      
      // const response = await fetch('/api/posts', {
      //   method: 'POST',
      //   body: formData,
      // });
      
      // if (!response.ok) {
      //   throw new Error('Failed to create post');
      // }
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to home page after successful post creation
      navigate('/');
    } catch (error) {
      console.error('Error creating post:', error);
      setError('Failed to create post. Please try again.');
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
          Create New Post
        </Typography>
      </div>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper className={classes.form} component="form" onSubmit={handleSubmit}>
            <Typography variant="h6" gutterBottom>
              Upload Images
            </Typography>

            {imagePreview ? (
              <div className={classes.imagePreview}>
                <img
                  src={imagePreview}
                  alt="Preview"
                  className={classes.imagePreviewImg}
                />
                <IconButton 
                  className={classes.removeImage}
                  onClick={() => handleRemoveImage(0)}
                >
                  <CancelIcon />
                </IconButton>
              </div>
            ) : (
              <label htmlFor="image-upload">
                <div className={classes.imagePlaceholder}>
                  <AddAPhotoIcon className={classes.imageIcon} />
                  <Typography variant="body2" color="textSecondary">
                    Click to upload images
                  </Typography>
                </div>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
              </label>
            )}

            {images.length > 1 && (
              <ImageList rowHeight={100} className={classes.imageList} cols={4}>
                {images.map((image, index) => (
                  <ImageListItem key={index} onClick={() => handleSetPreview(index)}>
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Uploaded ${index}`}
                      style={{ height: '100%', cursor: 'pointer' }}
                    />
                  </ImageListItem>
                ))}
              </ImageList>
            )}

            <Button
              variant="outlined"
              component="label"
              startIcon={<AddAPhotoIcon />}
              style={{ marginTop: theme.spacing(2) }}
            >
              Add More Images
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
            </Button>

            <Divider className={classes.divider} />

            <Typography variant="h6" gutterBottom>
              Post Details
            </Typography>

            <TextField
              name="caption"
              label="Caption"
              variant="outlined"
              fullWidth
              margin="normal"
              multiline
              rows={3}
              value={postData.caption}
              onChange={handleInputChange}
            />

            <TextField
              name="location"
              label="Location (optional)"
              variant="outlined"
              fullWidth
              margin="normal"
              value={postData.location}
              onChange={handleInputChange}
            />

            <FormControl variant="outlined" fullWidth className={classes.albumSelect}>
              <InputLabel id="album-select-label">Add to Album (optional)</InputLabel>
              <Select
                labelId="album-select-label"
                id="album-select"
                name="album"
                value={postData.album}
                onChange={handleInputChange}
                label="Add to Album (optional)"
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {albums.map(album => (
                  <MenuItem key={album.id} value={album.id}>
                    {album.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

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
                  {loading ? 'Posting...' : 'Share Post'}
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card className={classes.infoCard}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tips for Better Posts
              </Typography>
              <Typography variant="body2" paragraph>
                • Upload high-quality images for the best presentation
              </Typography>
              <Typography variant="body2" paragraph>
                • Write a descriptive caption to engage your audience
              </Typography>
              <Typography variant="body2" paragraph>
                • Add a location to help others discover your content
              </Typography>
              <Typography variant="body2">
                • Organize your photos by adding them to albums
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
}

export default CreatePost; 