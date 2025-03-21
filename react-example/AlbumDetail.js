import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from './api';

const AlbumDetail = () => {
  const { albumId } = useParams();
  const navigate = useNavigate();
  
  const [album, setAlbum] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [error, setError] = useState(null);
  const [photoUrl, setPhotoUrl] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  
  // Album en foto's ophalen bij laden van de component
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Album ophalen
        const albumResponse = await api.albums.getAlbum(albumId);
        
        if (!albumResponse.success) {
          setError(albumResponse.data.message || 'Failed to fetch album');
          setLoading(false);
          return;
        }
        
        setAlbum(albumResponse.data);
        
        // Foto's ophalen
        const photosResponse = await api.photos.getAlbumPhotos(albumId);
        
        if (photosResponse.success) {
          setPhotos(photosResponse.data.records || []);
        } else {
          setError(photosResponse.data.message);
        }
      } catch (err) {
        setError('An error occurred while fetching album data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [albumId]);
  
  // Foto toevoegen aan het album
  const handleAddPhoto = async (e) => {
    e.preventDefault();
    
    if (!photoUrl.trim()) {
      setError('Photo URL is required');
      return;
    }
    
    setIsUploadingPhoto(true);
    try {
      const { success, data } = await api.photos.uploadPhoto({
        album_id: albumId,
        photo_url: photoUrl
      });
      
      if (success) {
        setPhotoUrl('');
        
        // Nieuwe foto ophalen en toevoegen aan de lijst
        setPhotoLoading(true);
        const photosResponse = await api.photos.getAlbumPhotos(albumId);
        if (photosResponse.success) {
          setPhotos(photosResponse.data.records || []);
        }
        setPhotoLoading(false);
      } else {
        setError(data.message || 'Failed to add photo');
      }
    } catch (err) {
      setError('An error occurred while adding the photo');
      console.error(err);
    } finally {
      setIsUploadingPhoto(false);
    }
  };
  
  // Foto verwijderen
  const handleDeletePhoto = async (photoId) => {
    if (window.confirm('Are you sure you want to delete this photo?')) {
      try {
        const { success, data } = await api.photos.deletePhoto(photoId);
        
        if (success) {
          // Verwijder foto uit lokale state
          setPhotos(photos.filter(photo => photo.id !== photoId));
          // Als de verwijderde foto was geselecteerd, deselecteer deze
          if (selectedPhoto && selectedPhoto.id === photoId) {
            setSelectedPhoto(null);
          }
        } else {
          setError(data.message || 'Failed to delete photo');
        }
      } catch (err) {
        setError('An error occurred while deleting the photo');
        console.error(err);
      }
    }
  };
  
  // Controleren of gebruiker toegang heeft om foto's toe te voegen
  const canAddPhotos = album && (album.permissions.is_owner || album.permissions.can_add_photos);
  
  // Controleren of gebruiker toegang heeft om foto's te verwijderen
  const canDeletePhoto = (photo) => {
    if (!album) return false;
    return album.permissions.is_owner || album.permissions.can_delete_photos || photo.uploaded_by === album.user_id;
  };
  
  if (loading) {
    return <div className="loading-indicator">Loading album details...</div>;
  }
  
  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
        <button onClick={() => navigate('/albums')}>Back to Albums</button>
      </div>
    );
  }
  
  if (!album) {
    return (
      <div className="error-container">
        <div className="error-message">Album not found</div>
        <button onClick={() => navigate('/albums')}>Back to Albums</button>
      </div>
    );
  }
  
  return (
    <div className="album-detail-container">
      <div className="album-header">
        <h1>{album.album_name}</h1>
        <div className="album-actions">
          <Link to="/albums" className="back-button">Back to Albums</Link>
          
          {album.permissions.is_owner && (
            <>
              <Link to={`/albums/${albumId}/edit`} className="edit-button">
                Edit Album
              </Link>
              <Link to={`/albums/${albumId}/share`} className="share-button">
                Share Album
              </Link>
            </>
          )}
        </div>
      </div>
      
      {/* Formulier voor het toevoegen van een foto (alleen tonen als gebruiker rechten heeft) */}
      {canAddPhotos && (
        <form onSubmit={handleAddPhoto} className="add-photo-form">
          <h2>Add New Photo</h2>
          <div className="form-group">
            <input
              type="text"
              placeholder="Photo URL"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              disabled={isUploadingPhoto}
            />
            <button type="submit" disabled={isUploadingPhoto}>
              {isUploadingPhoto ? 'Adding...' : 'Add Photo'}
            </button>
          </div>
        </form>
      )}
      
      {/* Foutmelding weergeven */}
      {error && <div className="error-message">{error}</div>}
      
      {/* Foto's weergeven */}
      {photoLoading ? (
        <div className="loading-indicator">Loading photos...</div>
      ) : (
        <div className="photos-container">
          {photos.length === 0 ? (
            <p className="no-photos-message">
              {canAddPhotos 
                ? 'No photos in this album yet. Add your first photo!' 
                : 'No photos in this album yet.'}
            </p>
          ) : (
            <>
              {/* Grote weergave van geselecteerde foto */}
              {selectedPhoto && (
                <div className="selected-photo-container">
                  <div className="selected-photo">
                    <img src={selectedPhoto.photo_url} alt="Selected" />
                    <div className="photo-details">
                      <p>Uploaded by: {selectedPhoto.uploader_name}</p>
                      <p>Date: {new Date(selectedPhoto.uploaded_at).toLocaleString()}</p>
                      {canDeletePhoto(selectedPhoto) && (
                        <button 
                          className="delete-button"
                          onClick={() => handleDeletePhoto(selectedPhoto.id)}
                        >
                          Delete Photo
                        </button>
                      )}
                      <button 
                        className="close-button"
                        onClick={() => setSelectedPhoto(null)}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Grid van alle foto's */}
              <div className="photos-grid">
                {photos.map(photo => (
                  <div 
                    key={photo.id} 
                    className="photo-card"
                    onClick={() => setSelectedPhoto(photo)}
                  >
                    <div className="photo-thumbnail">
                      <img src={photo.photo_url} alt="Album" />
                    </div>
                    <div className="photo-overlay">
                      <p>By: {photo.uploader_name}</p>
                      {canDeletePhoto(photo) && (
                        <button 
                          className="delete-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePhoto(photo.id);
                          }}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AlbumDetail; 