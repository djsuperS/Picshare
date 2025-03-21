import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from './api';

const AlbumsList = () => {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Albums ophalen bij laden van de component
  useEffect(() => {
    fetchAlbums();
  }, []);

  // Albums ophalen van de API
  const fetchAlbums = async () => {
    setLoading(true);
    try {
      const { success, data } = await api.albums.getAlbums();
      
      if (success) {
        setAlbums(data.records || []);
        setError(null);
      } else {
        setError(data.message || 'Failed to fetch albums');
      }
    } catch (err) {
      setError('An error occurred while fetching albums');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Nieuw album aanmaken
  const handleCreateAlbum = async (e) => {
    e.preventDefault();
    
    if (!newAlbumName.trim()) {
      setError('Album name is required');
      return;
    }
    
    setIsCreating(true);
    try {
      const { success, data } = await api.albums.createAlbum({
        album_name: newAlbumName
      });
      
      if (success) {
        setNewAlbumName('');
        // Albums opnieuw ophalen om het nieuwe album te tonen
        fetchAlbums();
      } else {
        setError(data.message || 'Failed to create album');
      }
    } catch (err) {
      setError('An error occurred while creating the album');
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  // Album verwijderen
  const handleDeleteAlbum = async (albumId) => {
    if (window.confirm('Are you sure you want to delete this album?')) {
      try {
        const { success, data } = await api.albums.deleteAlbum(albumId);
        
        if (success) {
          // Verwijder album uit lokale state
          setAlbums(albums.filter(album => album.id !== albumId));
        } else {
          setError(data.message || 'Failed to delete album');
        }
      } catch (err) {
        setError('An error occurred while deleting the album');
        console.error(err);
      }
    }
  };

  return (
    <div className="albums-container">
      <h1>My Albums</h1>
      
      {/* Formulier voor het aanmaken van een nieuw album */}
      <form onSubmit={handleCreateAlbum} className="new-album-form">
        <h2>Create New Album</h2>
        <div className="form-group">
          <input
            type="text"
            placeholder="Album name"
            value={newAlbumName}
            onChange={(e) => setNewAlbumName(e.target.value)}
            disabled={isCreating}
          />
          <button type="submit" disabled={isCreating}>
            {isCreating ? 'Creating...' : 'Create Album'}
          </button>
        </div>
      </form>
      
      {/* Foutmelding weergeven */}
      {error && <div className="error-message">{error}</div>}
      
      {/* Laadstatus weergeven */}
      {loading ? (
        <div className="loading-indicator">Loading albums...</div>
      ) : (
        <div className="albums-list">
          {albums.length === 0 ? (
            <p>No albums found. Create your first album!</p>
          ) : (
            <div className="albums-grid">
              {albums.map(album => (
                <div key={album.id} className="album-card">
                  <Link to={`/albums/${album.id}`}>
                    <div className="album-thumbnail">
                      {album.thumbnail ? (
                        <img src={album.thumbnail} alt={album.album_name} />
                      ) : (
                        <div className="no-thumbnail">No Image</div>
                      )}
                    </div>
                    <div className="album-details">
                      <h3>{album.album_name}</h3>
                      <p>Created: {new Date(album.created_at).toLocaleDateString()}</p>
                      {!album.is_owner && (
                        <p className="shared-album">
                          Shared by: {album.creator_name}
                        </p>
                      )}
                    </div>
                  </Link>
                  {album.is_owner && (
                    <div className="album-actions">
                      <Link to={`/albums/${album.id}/edit`} className="edit-button">
                        Edit
                      </Link>
                      <button 
                        className="delete-button"
                        onClick={() => handleDeleteAlbum(album.id)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AlbumsList; 