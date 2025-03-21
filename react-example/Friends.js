import React, { useState, useEffect } from 'react';
import api from './api';

const Friends = () => {
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  
  // Ophalen van vrienden, verzoeken en gebruikers bij laden van de component
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Haal vrienden op
        const friendsResponse = await api.friends.getFriends();
        
        if (friendsResponse.success) {
          setFriends(friendsResponse.data || []);
        } else {
          setError(friendsResponse.data.message);
        }
        
        // Haal ontvangen vriendschapsverzoeken op
        const requestsResponse = await api.friends.getFriendRequests();
        
        if (requestsResponse.success) {
          setPendingRequests(requestsResponse.data || []);
        } else {
          setError(requestsResponse.data.message);
        }
        
        // Haal verzonden vriendschapsverzoeken op
        const sentResponse = await api.friends.getSentFriendRequests();
        
        if (sentResponse.success) {
          setSentRequests(sentResponse.data || []);
        } else {
          setError(sentResponse.data.message);
        }
        
        // Haal alle gebruikers op
        const usersResponse = await api.users.getAllUsers();
        
        if (usersResponse.success) {
          setUsers(usersResponse.data.records || []);
        } else {
          setError(usersResponse.data.message);
        }
      } catch (err) {
        setError('An error occurred while fetching friends data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Filter gebruikers op basis van zoekterm en verwijder vrienden en gebruikers met verzoeken
  useEffect(() => {
    if (!users || users.length === 0) {
      setFilteredUsers([]);
      return;
    }
    
    // IDs van huidige vrienden en verzonden/ontvangen verzoeken
    const friendIds = friends.map(friend => friend.id);
    const pendingIds = pendingRequests.map(req => req.user_id);
    const sentIds = sentRequests.map(req => req.friend_id);
    
    // Filter gebruikers op zoekterm en verwijder reeds verbonden gebruikers
    const filtered = users.filter(user => {
      // Zoek op naam of e-mail
      const matchesSearch = (
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      // Verwijder huidige gebruiker, vrienden en gebruikers met openstaande verzoeken
      const isNotConnected = (
        !friendIds.includes(user.id) &&
        !pendingIds.includes(user.id) &&
        !sentIds.includes(user.id)
      );
      
      return matchesSearch && isNotConnected;
    });
    
    setFilteredUsers(filtered);
  }, [users, friends, pendingRequests, sentRequests, searchTerm]);
  
  // Vriendschapsverzoek versturen
  const handleSendRequest = async (userId) => {
    try {
      const { success, data } = await api.friends.sendFriendRequest({
        friend_id: userId
      });
      
      if (success) {
        // Voeg verzoek toe aan verzonden verzoeken
        const userToAdd = users.find(user => user.id === userId);
        setSentRequests([...sentRequests, {
          id: data.id || Date.now(), // Fallback als geen ID wordt teruggegeven
          friend_id: userId,
          friend_name: userToAdd ? userToAdd.username : 'User',
          friend_email: userToAdd ? userToAdd.email : '',
          status: 'pending'
        }]);
      } else {
        setError(data.message || 'Failed to send friend request');
      }
    } catch (err) {
      setError('An error occurred while sending friend request');
      console.error(err);
    }
  };
  
  // Vriendschapsverzoek accepteren
  const handleAcceptRequest = async (requestId) => {
    try {
      const { success, data } = await api.friends.acceptFriendRequest(requestId);
      
      if (success) {
        // Verplaats verzoek van pending naar vrienden
        const request = pendingRequests.find(req => req.id === requestId);
        if (request) {
          setPendingRequests(pendingRequests.filter(req => req.id !== requestId));
          setFriends([...friends, {
            id: request.user_id,
            username: request.user_name,
            email: request.user_email
          }]);
        }
      } else {
        setError(data.message || 'Failed to accept friend request');
      }
    } catch (err) {
      setError('An error occurred while accepting friend request');
      console.error(err);
    }
  };
  
  // Vriendschapsverzoek weigeren
  const handleRejectRequest = async (requestId) => {
    try {
      const { success, data } = await api.friends.rejectFriendRequest(requestId);
      
      if (success) {
        // Verwijder verzoek uit pending
        setPendingRequests(pendingRequests.filter(req => req.id !== requestId));
      } else {
        setError(data.message || 'Failed to reject friend request');
      }
    } catch (err) {
      setError('An error occurred while rejecting friend request');
      console.error(err);
    }
  };
  
  // Vriendschap verwijderen
  const handleRemoveFriend = async (friendId) => {
    if (window.confirm('Are you sure you want to remove this friend?')) {
      try {
        const { success, data } = await api.friends.removeFriend(friendId);
        
        if (success) {
          // Verwijder vriend uit lijst
          setFriends(friends.filter(friend => friend.id !== friendId));
        } else {
          setError(data.message || 'Failed to remove friend');
        }
      } catch (err) {
        setError('An error occurred while removing friend');
        console.error(err);
      }
    }
  };
  
  // Verzonden vriendschapsverzoek annuleren
  const handleCancelRequest = async (requestId) => {
    try {
      const { success, data } = await api.friends.cancelFriendRequest(requestId);
      
      if (success) {
        // Verwijder verzoek uit verzonden verzoeken
        setSentRequests(sentRequests.filter(req => req.id !== requestId));
      } else {
        setError(data.message || 'Failed to cancel friend request');
      }
    } catch (err) {
      setError('An error occurred while canceling friend request');
      console.error(err);
    }
  };
  
  if (loading) {
    return <div className="loading-indicator">Loading friends...</div>;
  }
  
  return (
    <div className="friends-container">
      <h1>Friends</h1>
      
      {/* Foutmelding weergeven */}
      {error && <div className="error-message">{error}</div>}
      
      {/* Sectie voor openstaande vriendschapsverzoeken */}
      {pendingRequests.length > 0 && (
        <div className="friend-requests-section">
          <h2>Friend Requests</h2>
          <div className="friend-request-list">
            {pendingRequests.map(request => (
              <div key={request.id} className="friend-request-card">
                <div className="user-info">
                  <h3>{request.user_name}</h3>
                  <p>{request.user_email}</p>
                </div>
                <div className="request-actions">
                  <button 
                    className="accept-button"
                    onClick={() => handleAcceptRequest(request.id)}
                  >
                    Accept
                  </button>
                  <button 
                    className="reject-button"
                    onClick={() => handleRejectRequest(request.id)}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Huidige vrienden sectie */}
      <div className="friends-section">
        <h2>Your Friends</h2>
        {friends.length === 0 ? (
          <p className="no-friends-message">
            You don't have any friends yet. Search for users to add friends.
          </p>
        ) : (
          <div className="friends-list">
            {friends.map(friend => (
              <div key={friend.id} className="friend-card">
                <div className="user-info">
                  <h3>{friend.username}</h3>
                  <p>{friend.email}</p>
                </div>
                <div className="friend-actions">
                  <button 
                    className="remove-button"
                    onClick={() => handleRemoveFriend(friend.id)}
                  >
                    Remove Friend
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Verzonden verzoeken sectie */}
      {sentRequests.length > 0 && (
        <div className="sent-requests-section">
          <h2>Sent Requests</h2>
          <div className="sent-request-list">
            {sentRequests.map(request => (
              <div key={request.id} className="sent-request-card">
                <div className="user-info">
                  <h3>{request.friend_name}</h3>
                  <p>{request.friend_email}</p>
                </div>
                <div className="request-actions">
                  <button 
                    className="cancel-button"
                    onClick={() => handleCancelRequest(request.id)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Zoek en voeg nieuwe vrienden toe */}
      <div className="add-friends-section">
        <h2>Find Friends</h2>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by name or email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="search-results">
          {filteredUsers.length === 0 ? (
            searchTerm ? (
              <p className="no-results-message">No users found matching your search.</p>
            ) : (
              <p className="search-prompt">Type to search for users.</p>
            )
          ) : (
            <div className="user-list">
              {filteredUsers.map(user => (
                <div key={user.id} className="user-card">
                  <div className="user-info">
                    <h3>{user.username}</h3>
                    <p>{user.email}</p>
                  </div>
                  <div className="user-actions">
                    <button
                      className="add-friend-button"
                      onClick={() => handleSendRequest(user.id)}
                    >
                      Add Friend
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Friends; 