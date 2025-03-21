import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from './api';

const AlbumEdit = () => {
  const { albumId } = useParams();
  const navigate = useNavigate();
  
  const [albumName, setAlbumName] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  
  // Album ophalen bij laden van de component
  useEffect(() => {
    const fetchAlbum = async () => {
      setLoading(true);
      try {
        const { success, data } = await api.albums.getAlbum(albumId);
        
        if (success) {
          setAlbumName(data.album_name);
          setThumbnail(data.thumbnail || '');
          setError(null);
        } else {
          setError(data.message || 'Failed to fetch album details');
          navigate('/albums');
        }
      } catch (err) {
        setError('An error occurred while fetching album');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAlbum();
  }, [albumId, navigate]);
  
  // Album bijwerken
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!albumName.trim()) {
      setError('Album name is required');
      return;
    }
    
    setSaving(true);
    try {
      const { success, data } = await api.albums.updateAlbum(albumId, {
        album_name: albumName,
        thumbnail: thumbnail
      });
      
      if (success) {
        navigate(`/albums/${albumId}`);
      } else {
        setError(data.message || 'Failed to update album');
      }
    } catch (err) {
      setError('An error occurred while updating the album');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return <div className="loading-indicator">Loading album details...</div>;
  }
  
  return (
    <div className="album-edit-container">
      <div className="album-edit-header">
        <h1>Edit Album</h1>
        <Link to={`/albums/${albumId}`} className="back-button">Back to Album</Link>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="album-edit-form">
        <div className="form-group">
          <label htmlFor="albumName">Album Name</label>
          <input
            type="text"
            id="albumName"
            value={albumName}
            onChange={(e) => setAlbumName(e.target.value)}
            required
            disabled={saving}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="thumbnail">Thumbnail URL (optional)</label>
          <input
            type="text"
            id="thumbnail"
            value={thumbnail}
            onChange={(e) => setThumbnail(e.target.value)}
            placeholder="Enter image URL for album thumbnail"
            disabled={saving}
          />
        </div>
        
        {thumbnail && (
          <div className="thumbnail-preview">
            <h3>Thumbnail Preview</h3>
            <img src={thumbnail} alt="Thumbnail preview" />
          </div>
        )}
        
        <div className="form-actions">
          <button 
            type="submit" 
            className="save-button"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          
          <button 
            type="button" 
            className="cancel-button"
            onClick={() => navigate(`/albums/${albumId}`)}
            disabled={saving}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AlbumEdit; 