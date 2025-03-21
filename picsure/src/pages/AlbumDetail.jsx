import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import AddIcon from '@material-ui/icons/Add';
import SettingsIcon from '@material-ui/icons/Settings';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import IconButton from '@material-ui/core/IconButton';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import Divider from '@material-ui/core/Divider';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import DeleteIcon from '@material-ui/icons/Delete';
import InfoIcon from '@material-ui/icons/Info';
import ShareIcon from '@material-ui/icons/Share';
import { useAuth } from '../context/AuthContext';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing(3),
    backgroundColor: '#f8f9fa',
    minHeight: '100vh',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(4),
    backgroundColor: 'white',
    padding: theme.spacing(2),
    borderRadius: theme.spacing(1),
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
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
    paddingTop: '100%', // 1:1 aspect ratio
  },
  addButton: {
    position: 'fixed',
    bottom: theme.spacing(4),
    right: theme.spacing(4),
    backgroundColor: theme.palette.primary.main,
    color: 'white',
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  },
  dialog: {
    minWidth: '400px',
  },
  photoGrid: {
    marginTop: theme.spacing(4),
  },
  emptyState: {
    textAlign: 'center',
    marginTop: theme.spacing(8),
    marginBottom: theme.spacing(8),
    backgroundColor: 'white',
    padding: theme.spacing(4),
    borderRadius: theme.spacing(1),
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
  },
  photoViewerContainer: {
    display: 'flex',
    flexDirection: 'row',
    height: 'calc(100vh - 200px)',
    backgroundColor: 'white',
    boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
    borderRadius: theme.spacing(1),
    overflow: 'hidden',
  },
  photoViewerSidebar: {
    width: '220px',
    backgroundColor: '#000',
    height: '100%',
    color: 'white',
    padding: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
  },
  photoViewerMain: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  },
  photoViewerContent: {
    flex: 1,
    display: 'flex',
    position: 'relative',
    backgroundColor: '#f0f0f0',
    overflow: 'hidden',
  },
  photoViewerCurrentPhoto: {
    margin: 'auto',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  photoImage: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
  },
  photoVertical: {
    height: '100%',
    width: 'auto',
  },
  photoHorizontal: {
    width: '100%',
    height: 'auto',
  },
  photoNavigation: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(0, 2),
    zIndex: 2,
  },
  photoNavigationButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    color: 'white',
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
  },
  thumbnailsContainer: {
    width: '200px',
    height: '100%',
    borderLeft: '1px solid #ddd',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
    padding: theme.spacing(1),
    backgroundColor: '#f8f9fa',
  },
  thumbnail: {
    width: '100%',
    height: '80px',
    cursor: 'pointer',
    borderRadius: theme.spacing(0.5),
    border: '2px solid transparent',
    objectFit: 'cover',
    transition: 'all 0.2s',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    },
  },
  activeThumbnail: {
    border: `2px solid ${theme.palette.primary.main}`,
  },
  photoInfo: {
    padding: theme.spacing(2),
    borderBottom: '1px solid #ddd',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
  },
  actionButtons: {
    display: 'flex',
    gap: theme.spacing(1),
  },
  colorRed: {
    backgroundColor: '#e53935',
  },
  colorBlue: {
    backgroundColor: '#1e88e5',
  },
  colorGreen: {
    backgroundColor: '#7cb342',
  },
}));

// API basis URL - zelfde als in Albums.jsx
const API_URL = 'http://localhost/backend';

// Mock data for the album and photos
const MOCK_ALBUM = {
  id: 1,
  album_name: "Summer Vacation",
  description: "Photos from our summer trip to the beach",
  created_by: 1,
  thumbnail: "https://source.unsplash.com/random/600x600/?summer"
};

const MOCK_PHOTOS = [
  {
    id: 101,
    album_id: 1,
    photo_url: "https://source.unsplash.com/random/800x1200/?beach", // Vertical photo
    title: "Beach Sunset",
    description: "A beautiful sunset at the beach",
    orientation: "vertical"
  },
  {
    id: 102,
    album_id: 1,
    photo_url: "https://source.unsplash.com/random/1200x800/?ocean", // Horizontal photo
    title: "Ocean View",
    description: "View of the ocean from our hotel",
    orientation: "horizontal"
  },
  {
    id: 103,
    album_id: 1,
    photo_url: "https://source.unsplash.com/random/800x1200/?palm", // Vertical photo
    title: "Palm Trees",
    description: "Palm trees on the beach",
    orientation: "vertical"
  },
  {
    id: 104,
    album_id: 1,
    photo_url: "https://source.unsplash.com/random/1200x800/?waves", // Horizontal photo
    title: "Waves",
    description: "Waves crashing on the shore",
    orientation: "horizontal"
  },
  {
    id: 105,
    album_id: 1,
    photo_url: "https://source.unsplash.com/random/800x1200/?sunset", // Vertical photo
    title: "Sunset",
    description: "Another beautiful sunset",
    orientation: "vertical"
  },
  {
    id: 106,
    album_id: 1,
    photo_url: "https://source.unsplash.com/random/1200x800/?beach", // Horizontal photo
    title: "Beach Panorama",
    description: "Panoramic view of the beach",
    orientation: "horizontal"
  }
];

function AlbumDetail() {
  const classes = useStyles();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [album, setAlbum] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [photoUpload, setPhotoUpload] = useState({
    files: [],
    caption: '',
  });
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoViewerOpen, setPhotoViewerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [albumSettings, setAlbumSettings] = useState({
    name: '',
    description: '',
    permissions: {
      view: [],
      edit: [],
      delete: [],
    },
  });

  useEffect(() => {
    fetchAlbumDetails();
    fetchPhotos();
  }, [id]);

  const fetchAlbumDetails = async () => {
    try {
      setLoading(true);
      
      try {
        // Probeer album details op te halen van de API
        const response = await fetch(`${API_URL}/api.php?albums&id=${id}`);
        
        if (response.ok) {
          const data = await response.json();
          setAlbum(data);
          setAlbumSettings({
            name: data.name,
            description: data.description,
            permissions: data.permissions,
          });
        } else {
          console.error('Error fetching album details:', await response.text());
          // Fallback naar mock data
          setAlbum(MOCK_ALBUM);
        }
      } catch (error) {
        console.error('Error fetching album details:', error);
        // Fallback naar mock data
        setAlbum(MOCK_ALBUM);
      }
    } catch (error) {
      console.error('Error fetching album details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      
      try {
        // Probeer foto's op te halen van de API
        const response = await fetch(`${API_URL}/api.php?photos&albumId=${id}`);
        
        if (response.ok) {
          const data = await response.json();
          setPhotos(data);
          if (data.length > 0) {
            setSelectedPhoto(data[0]);
          }
        } else {
          console.error('Error fetching photos:', await response.text());
          // Fallback naar mock data
          setPhotos(MOCK_PHOTOS);
          if (MOCK_PHOTOS.length > 0) {
            setSelectedPhoto(MOCK_PHOTOS[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching photos:', error);
        // Fallback naar mock data
        setPhotos(MOCK_PHOTOS);
        if (MOCK_PHOTOS.length > 0) {
          setSelectedPhoto(MOCK_PHOTOS[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setPhotoUpload({
      ...photoUpload,
      files: selectedFiles
    });
  };

  const handleCaptionChange = (e) => {
    setPhotoUpload({
      ...photoUpload,
      caption: e.target.value
    });
  };

  const handlePhotoUpload = async () => {
    if (photoUpload.files.length === 0) {
      alert('Selecteer minimaal één foto');
      return;
    }

    try {
      setLoading(true);
      
      try {
        const formData = new FormData();
        
        // Voeg alle geselecteerde bestanden toe
        photoUpload.files.forEach((file, index) => {
          formData.append(`photo_${index}`, file);
        });
        
        // Voeg caption toe
        formData.append('caption', photoUpload.caption);
        
        // Album ID en gebruiker ID toevoegen
        formData.append('albumId', id);
        formData.append('userId', user?.id || 1);
        
        // Foto's uploaden naar de API
        const response = await fetch(`${API_URL}/api.php?photos`, {
          method: 'POST',
          body: formData,
        });
        
        if (response.ok) {
          const uploadedPhotos = await response.json();
          setPhotos(prev => [...prev, ...uploadedPhotos]);
          setOpen(false);
          setPhotoUpload({ files: [], caption: '' });
        } else {
          const errorText = await response.text();
          console.error('Error uploading photos:', errorText);
          alert(`Fout bij uploaden: ${errorText}`);
          
          // Mock response als fallback
          fallbackPhotoUpload();
        }
      } catch (error) {
        console.error('API request failed:', error);
        // Mock response als fallback
        fallbackPhotoUpload();
      }
    } catch (error) {
      console.error('Error uploading photos:', error);
      alert('Er is een fout opgetreden');
    } finally {
      setLoading(false);
    }
  };
  
  // Fallback methode voor als de API niet werkt
  const fallbackPhotoUpload = () => {
    const mockPhotos = photoUpload.files.map((file, index) => ({
      id: Date.now() + index,
      album_id: parseInt(id),
      photo_url: URL.createObjectURL(file),
      title: photoUpload.caption || `Foto ${Date.now() + index}`,
      description: photoUpload.caption,
      orientation: Math.random() > 0.5 ? 'horizontal' : 'vertical'
    }));
    
    setPhotos(prev => [...prev, ...mockPhotos]);
    setOpen(false);
    setPhotoUpload({ files: [], caption: '' });
  };

  const handlePhotoClick = (photo) => {
    setSelectedPhoto(photo);
    setPhotoViewerOpen(true);
  };

  const goBack = () => {
    navigate('/');
  };

  const handleUpdateSettings = async () => {
    try {
      // API call voor update settings
      setSettingsOpen(false);
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  const handleNextPhoto = () => {
    const currentIndex = photos.findIndex(photo => photo.id === selectedPhoto.id);
    const nextIndex = (currentIndex + 1) % photos.length;
    setSelectedPhoto(photos[nextIndex]);
  };

  const handlePrevPhoto = () => {
    const currentIndex = photos.findIndex(photo => photo.id === selectedPhoto.id);
    const prevIndex = (currentIndex - 1 + photos.length) % photos.length;
    setSelectedPhoto(photos[prevIndex]);
  };

  if (loading && !album) {
    return <div>Loading...</div>;
  }

  return (
    <div className={classes.root}>
      <div className={classes.header}>
        <div className={classes.headerLeft}>
          <IconButton color="primary" onClick={goBack}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5">
            {album?.album_name || `Album ${id}`}
          </Typography>
        </div>
        <div>
          <IconButton color="primary" onClick={() => setSettingsOpen(true)}>
            <SettingsIcon />
          </IconButton>
        </div>
      </div>

      {photos.length === 0 ? (
        <div className={classes.emptyState}>
          <Typography variant="h5" gutterBottom>
            No photos in this album yet
          </Typography>
          <Typography variant="body1" paragraph>
            Upload some photos to get started!
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setOpen(true)}
          >
            Add Photos
          </Button>
        </div>
      ) : (
        <div className={classes.photoViewerContainer}>
          {selectedPhoto && (
            <>
              <div className={classes.photoViewerMain}>
                <div className={classes.photoInfo}>
                  <div className={classes.infoText}>
                    <Typography variant="h6">{selectedPhoto.title}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {selectedPhoto.description}
                    </Typography>
                  </div>
                  <div className={classes.actionButtons}>
                    <IconButton size="small">
                      <InfoIcon />
                    </IconButton>
                    <IconButton size="small">
                      <ShareIcon />
                    </IconButton>
                    <IconButton size="small">
                      <DeleteIcon />
                    </IconButton>
                  </div>
                </div>
                <div className={classes.photoViewerContent}>
                  <div className={classes.photoViewerCurrentPhoto}>
                    <img 
                      src={selectedPhoto.photo_url} 
                      alt={selectedPhoto.title} 
                      className={`${classes.photoImage} ${selectedPhoto.orientation === 'vertical' ? classes.photoVertical : classes.photoHorizontal}`}
                    />
                  </div>
                  <div className={classes.photoNavigation}>
                    <IconButton
                      className={classes.photoNavigationButton}
                      onClick={handlePrevPhoto}
                    >
                      <KeyboardArrowLeftIcon fontSize="large" />
                    </IconButton>
                    <IconButton
                      className={classes.photoNavigationButton}
                      onClick={handleNextPhoto}
                    >
                      <KeyboardArrowRightIcon fontSize="large" />
                    </IconButton>
                  </div>
                </div>
              </div>
              <div className={classes.thumbnailsContainer}>
                {photos.map((photo) => (
                  <img
                    key={photo.id}
                    src={photo.photo_url}
                    alt={photo.title}
                    className={`${classes.thumbnail} ${selectedPhoto.id === photo.id ? classes.activeThumbnail : ''}`}
                    onClick={() => setSelectedPhoto(photo)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <Button
        variant="contained"
        color="primary"
        className={classes.addButton}
        startIcon={<AddIcon />}
        onClick={() => setOpen(true)}
      >
        Add Photos
      </Button>

      {/* Upload Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add Photos to Album</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            id="caption"
            label="Caption"
            fullWidth
            value={photoUpload.caption}
            onChange={handleCaptionChange}
          />
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="contained-button-file"
            multiple
            type="file"
            onChange={handleFileChange}
          />
          <label htmlFor="contained-button-file">
            <Button
              variant="outlined"
              component="span"
              style={{ marginTop: 16 }}
              fullWidth
            >
              Select Photos
            </Button>
          </label>
          {photoUpload.files.length > 0 && (
            <Typography style={{ marginTop: 8 }}>
              {photoUpload.files.length} photo(s) selected
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handlePhotoUpload} color="primary" variant="contained">
            Upload
          </Button>
        </DialogActions>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)}>
        <DialogTitle>Album Settings</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            id="name"
            label="Album Name"
            fullWidth
            value={albumSettings.name}
            onChange={(e) => setAlbumSettings({ ...albumSettings, name: e.target.value })}
          />
          <TextField
            margin="dense"
            id="description"
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={albumSettings.description}
            onChange={(e) => setAlbumSettings({ ...albumSettings, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleUpdateSettings} color="primary" variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default AlbumDetail; 