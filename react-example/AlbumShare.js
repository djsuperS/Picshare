import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from './api';

const AlbumShare = () => {
  const { albumId } = useParams();
  const navigate = useNavigate();
  
  const [album, setAlbum] = useState(null);
  const [friends, setFriends] = useState([]);
  const [sharedWith, setSharedWith] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Album, vrienden, en bestaande permissies ophalen
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Album details ophalen
        const albumResponse = await api.albums.getAlbum(albumId);
        
        if (!albumResponse.success) {
          setError(albumResponse.data.message || 'Failed to fetch album');
          setLoading(false);
          return;
        }
        
        setAlbum(albumResponse.data);
        
        // Controleren of gebruiker de eigenaar is
        if (!albumResponse.data.permissions.is_owner) {
          setError('Only the album owner can share this album');
          setLoading(false);
          return;
        }
        
        // Vrienden ophalen
        const friendsResponse = await api.friends.getFriends();
        
        if (friendsResponse.success) {
          setFriends(friendsResponse.data || []);
        } else {
          setError(friendsResponse.data.message);
        }
        
        // Huidige permissies ophalen
        const permissionsResponse = await api.albumPermissions.getAlbumPermissions(albumId);
        
        if (permissionsResponse.success) {
          setSharedWith(permissionsResponse.data.records || []);
        } else {
          setError(permissionsResponse.data.message);
        }
      } catch (err) {
        setError('An error occurred while fetching data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [albumId]);
  
  // Album delen met een vriend
  const handleShareWithFriend = async (friendId) => {
    try {
      const { success, data } = await api.albumPermissions.addPermission({
        album_id: albumId,
        user_id: friendId,
        can_add_photos: true,
        can_delete_photos: false
      });
      
      if (success) {
        // Zoek de vriend op in de vriendenlijst
        const friend = friends.find(f => f.id === friendId);
        
        // Voeg de nieuwe permissie toe aan de lijst
        if (friend) {
          const newPermission = {
            id: data.id || Date.now(), // Fallback als geen ID wordt teruggegeven
            user_id: friendId,
            username: friend.username,
            profile_picture: friend.profile_picture,
            can_add_photos: true,
            can_delete_photos: false
          };
          
          setSharedWith([...sharedWith, newPermission]);
          setSuccess(`Album shared with ${friend.username}`);
          
          // Verwijder succes melding na 3 seconden
          setTimeout(() => {
            setSuccess(null);
          }, 3000);
        }
      } else {
        setError(data.message || 'Failed to share album');
      }
    } catch (err) {
      setError('An error occurred while sharing the album');
      console.error(err);
    }
  };
  
  // Permissie bijwerken
  const handleUpdatePermission = async (permissionId, canAddPhotos, canDeletePhotos) => {
    try {
      const { success, data } = await api.albumPermissions.updatePermission(permissionId, {
        can_add_photos: canAddPhotos,
        can_delete_photos: canDeletePhotos
      });
      
      if (success) {
        // Update de permissie in de lijst
        setSharedWith(sharedWith.map(permission => 
          permission.id === permissionId 
            ? { ...permission, can_add_photos: canAddPhotos, can_delete_photos: canDeletePhotos }
            : permission
        ));
        
        setSuccess('Permission updated successfully');
        
        // Verwijder succes melding na 3 seconden
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      } else {
        setError(data.message || 'Failed to update permission');
      }
    } catch (err) {
      setError('An error occurred while updating permission');
      console.error(err);
    }
  };
  
  // Delen met vriend stopzetten
  const handleRemoveSharing = async (permissionId) => {
    if (window.confirm('Are you sure you want to stop sharing this album with this user?')) {
      try {
        const { success, data } = await api.albumPermissions.deletePermission(permissionId);
        
        if (success) {
          // Verwijder de permissie uit de lijst
          setSharedWith(sharedWith.filter(permission => permission.id !== permissionId));
          setSuccess('Sharing removed successfully');
          
          // Verwijder succes melding na 3 seconden
          setTimeout(() => {
            setSuccess(null);
          }, 3000);
        } else {
          setError(data.message || 'Failed to remove sharing');
        }
      } catch (err) {
        setError('An error occurred while removing sharing');
        console.error(err);
      }
    }
  };
  
  // Lijst van vrienden filteren om alleen vrienden te tonen die nog geen toegang hebben
  const availableFriends = friends.filter(friend => 
    !sharedWith.some(permission => permission.user_id === friend.id)
  );
  
  if (loading) {
    return <div className="loading-indicator">Loading sharing options...</div>;
  }
  
  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
        <button onClick={() => navigate(`/albums/${albumId}`)}>Back to Album</button>
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
    <div className="album-share-container">
      <div className="album-share-header">
        <h1>Share Album: {album.album_name}</h1>
        <Link to={`/albums/${albumId}`} className="back-button">Back to Album</Link>
      </div>
      
      {success && <div className="success-message">{success}</div>}
      {error && <div className="error-message">{error}</div>}
      
      {/* Huidige gedeelde gebruikers */}
      <div className="shared-users-section">
        <h2>Shared With</h2>
        {sharedWith.length === 0 ? (
          <p className="no-shared-users">This album is not shared with anyone yet.</p>
        ) : (
          <div className="shared-users-list">
            {sharedWith.map(permission => (
              <div key={permission.id} className="shared-user-card">
                <div className="user-info">
                  <h3>{permission.username}</h3>
                </div>
                <div className="permission-options">
                  <div className="permission-checkbox">
                    <label>
                      <input 
                        type="checkbox"
                        checked={permission.can_add_photos}
                        onChange={(e) => handleUpdatePermission(
                          permission.id, 
                          e.target.checked,
                          permission.can_delete_photos
                        )}
                      />
                      Can add photos
                    </label>
                  </div>
                  <div className="permission-checkbox">
                    <label>
                      <input 
                        type="checkbox"
                        checked={permission.can_delete_photos}
                        onChange={(e) => handleUpdatePermission(
                          permission.id,
                          permission.can_add_photos,
                          e.target.checked
                        )}
                      />
                      Can delete photos
                    </label>
                  </div>
                  <button 
                    className="remove-sharing-button"
                    onClick={() => handleRemoveSharing(permission.id)}
                  >
                    Stop Sharing
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Deel met nieuwe vrienden */}
      <div className="share-with-friends-section">
        <h2>Share with Friends</h2>
        {availableFriends.length === 0 ? (
          <p className="no-available-friends">
            You have no friends to share with or all your friends already have access.
          </p>
        ) : (
          <div className="available-friends-list">
            {availableFriends.map(friend => (
              <div key={friend.id} className="available-friend-card">
                <div className="user-info">
                  <h3>{friend.username}</h3>
                  <p>{friend.email}</p>
                </div>
                <button 
                  className="share-button"
                  onClick={() => handleShareWithFriend(friend.id)}
                >
                  Share Album
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AlbumShare; 