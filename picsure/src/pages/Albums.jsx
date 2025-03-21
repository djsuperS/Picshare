import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import TextField from '@material-ui/core/TextField';
import AddIcon from '@material-ui/icons/Add';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    cursor: 'pointer',
    transition: 'transform 0.2s',
    '&:hover': {
      transform: 'scale(1.02)',
    },
  },
  cardMedia: {
    paddingTop: '56.25%', // 16:9
  },
  cardContent: {
    flexGrow: 1,
  },
  addButton: {
    position: 'fixed',
    bottom: theme.spacing(4),
    right: theme.spacing(4),
  },
  dialog: {
    minWidth: '400px',
  },
}));

// API basis URL - verander dit naar het pad naar uw PHP backend
const API_URL = 'http://localhost/backend';

function Albums({ user }) {
  const classes = useStyles();
  const navigate = useNavigate();
  const [albums, setAlbums] = useState([]);
  const [open, setOpen] = useState(false);
  const [newAlbum, setNewAlbum] = useState({
    name: '',
    description: '',
    thumbnail: null,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAlbums();
  }, [user]);

  const fetchAlbums = async () => {
    try {
      setLoading(true);
      // Mock data gebruiken als fallback voor het geval de API niet werkt
      let data = [];
      
      try {
        const userId = user?.id || 1; // Default userId voor tests
        const response = await fetch(`${API_URL}/api.php?albums&userId=${userId}`);
        
        if (response.ok) {
          data = await response.json();
        } else {
          console.error('API request failed:', await response.text());
          // Fallback naar mock data
          data = mockAlbums;
        }
      } catch (error) {
        console.error('Error fetching from API:', error);
        // Fallback naar mock data
        data = mockAlbums;
      }
      
      setAlbums(data);
    } catch (error) {
      console.error('Error fetching albums:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAlbum = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      try {
        const formData = new FormData();
        formData.append('name', newAlbum.name);
        formData.append('description', newAlbum.description);
        formData.append('userId', user?.id || 1); // Default userId voor tests
        
        if (newAlbum.thumbnail) {
          formData.append('thumbnail', newAlbum.thumbnail);
        }
        
        // Correcte URL voor de API aanroep
        const response = await fetch(`${API_URL}/api.php?albums`, {
          method: 'POST',
          body: formData,
          // Geen Content-Type header, laat de browser dit automatisch instellen voor multipart/form-data
        });
        
        if (response.ok) {
          const albumData = await response.json();
          setAlbums([...albums, albumData]);
          setOpen(false);
          setNewAlbum({ name: '', description: '', thumbnail: null });
        } else {
          const errorText = await response.text();
          console.error('Failed to create album:', errorText);
          setErrors({ submit: `Failed to create album: ${errorText}` });
          
          // Fallback naar client-side mock data creatie
          fallbackCreateAlbum();
        }
      } catch (error) {
        console.error('API request failed:', error);
        // Fallback naar client-side mock data creatie
        fallbackCreateAlbum();
      }
    } catch (error) {
      setErrors({ submit: 'An error occurred' });
      console.error('Error creating album:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Fallback functie voor als de API niet werkt
  const fallbackCreateAlbum = () => {
    const newAlbumData = {
      id: Math.floor(Math.random() * 1000) + 10,
      album_name: newAlbum.name,
      description: newAlbum.description,
      thumbnail: newAlbum.thumbnail ? URL.createObjectURL(newAlbum.thumbnail) : 'https://images.unsplash.com/photo-1557682250-f37ae56bf55e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      created_by: user?.id || 1
    };
    
    setAlbums([...albums, newAlbumData]);
    setOpen(false);
    setNewAlbum({ name: '', description: '', thumbnail: null });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!newAlbum.name) {
      newErrors.name = 'Album name is required';
    }
    if (!newAlbum.description) {
      newErrors.description = 'Description is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewAlbum(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewAlbum(prev => ({
        ...prev,
        thumbnail: file
      }));
    }
  };
  
  // Mock data voor albums als fallback
  const mockAlbums = [
    {
      id: 1,
      album_name: 'Vakantie 2024',
      description: 'Onze zomervakantie in Spanje',
      thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      created_by: 1
    },
    {
      id: 2,
      album_name: 'Familie',
      description: 'Foto\'s van familiebijeenkomsten',
      thumbnail: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      created_by: 1
    },
    {
      id: 3,
      album_name: 'Natuur',
      description: 'Mooie natuurfoto\'s',
      thumbnail: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      created_by: 1
    }
  ];

  return (
    <div className={classes.root}>
      {loading && <Typography>Loading...</Typography>}
      
      <Grid container spacing={4}>
        {albums.map((album) => (
          <Grid item key={album.id} xs={12} sm={6} md={4}>
            <Card
              className={classes.card}
              onClick={() => navigate(`/albums/${album.id}`)}
            >
              <CardMedia
                className={classes.cardMedia}
                image={album.thumbnail && album.thumbnail.startsWith('/uploads') 
                  ? `${API_URL}${album.thumbnail}` 
                  : album.thumbnail || '/placeholder.jpg'}
                title={album.album_name || album.name}
              />
              <CardContent className={classes.cardContent}>
                <Typography gutterBottom variant="h5" component="h2">
                  {album.album_name || album.name}
                </Typography>
                <Typography>
                  {album.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Button
        variant="contained"
        color="primary"
        className={classes.addButton}
        startIcon={<AddIcon />}
        onClick={() => setOpen(true)}
      >
        Create Album
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Create New Album</DialogTitle>
        <DialogContent className={classes.dialog}>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Album Name"
            type="text"
            fullWidth
            value={newAlbum.name}
            onChange={handleChange}
            error={!!errors.name}
            helperText={errors.name}
          />
          <TextField
            margin="dense"
            name="description"
            label="Description"
            type="text"
            fullWidth
            multiline
            minRows={4}
            value={newAlbum.description}
            onChange={handleChange}
            error={!!errors.description}
            helperText={errors.description}
          />
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="thumbnail-upload"
            type="file"
            onChange={handleThumbnailChange}
          />
          <label htmlFor="thumbnail-upload">
            <Button
              component="span"
              variant="outlined"
              color="primary"
              style={{ marginTop: '16px' }}
            >
              Upload Thumbnail
            </Button>
          </label>
          {newAlbum.thumbnail && (
            <Typography variant="body2" style={{ marginTop: '8px' }}>
              {newAlbum.thumbnail.name}
            </Typography>
          )}
          {errors.submit && (
            <Typography color="error" style={{ marginTop: '8px' }}>
              {errors.submit}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleCreateAlbum} color="primary" disabled={loading}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default Albums; 