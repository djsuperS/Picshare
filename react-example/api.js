// Picshare API Client
// Dit bestand bevat functies voor het communiceren met de Picshare API vanuit een React applicatie

// API base URL - wijzig dit naar de locatie van jouw API
const API_BASE_URL = 'http://localhost/Picshare/api';

// Opslaan van auth token in localStorage
const setToken = (token) => {
  localStorage.setItem('authToken', token);
};

// Ophalen van auth token uit localStorage
const getToken = () => {
  return localStorage.getItem('authToken');
};

// Verwijderen van auth token uit localStorage
const removeToken = () => {
  localStorage.removeItem('authToken');
};

// Helper functie voor API requests met Authorization header
const fetchWithAuth = async (endpoint, options = {}) => {
  const token = getToken();
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    }
  };
  
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers
    }
  };
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, mergedOptions);
  const data = await response.json();
  
  // Als de token is verlopen, uitloggen
  if (response.status === 401 && data.message === "Invalid or expired token.") {
    removeToken();
    window.location.href = '/login';
  }
  
  return { response, data };
};

// Authenticatie API calls
export const authAPI = {
  // Inloggen
  login: async (email, password) => {
    const { response, data } = await fetchWithAuth('/auth', {
      method: 'POST',
      body: JSON.stringify({
        action: 'login',
        email,
        password
      })
    });
    
    if (response.ok && data.token) {
      setToken(data.token);
    }
    
    return { success: response.ok, data };
  },
  
  // Registreren
  register: async (username, email, password, phone = null, profile_picture = null) => {
    const { response, data } = await fetchWithAuth('/auth', {
      method: 'POST',
      body: JSON.stringify({
        action: 'register',
        username,
        email,
        password,
        phone,
        profile_picture
      })
    });
    
    if (response.ok && data.token) {
      setToken(data.token);
    }
    
    return { success: response.ok, data };
  },
  
  // Token verifiëren
  verifyToken: async () => {
    const token = getToken();
    if (!token) {
      return { success: false };
    }
    
    const { response, data } = await fetchWithAuth('/auth', {
      method: 'POST',
      body: JSON.stringify({
        action: 'verify_token',
        token
      })
    });
    
    return { success: response.ok, data };
  },
  
  // Uitloggen (verwijdert alleen de token in de client)
  logout: () => {
    removeToken();
    return { success: true };
  }
};

// Gebruikers API calls
export const usersAPI = {
  // Alle gebruikers ophalen
  getUsers: async () => {
    const { response, data } = await fetchWithAuth('/users');
    return { success: response.ok, data };
  },
  
  // Specifieke gebruiker ophalen
  getUser: async (userId) => {
    const { response, data } = await fetchWithAuth(`/users/${userId}`);
    return { success: response.ok, data };
  },
  
  // Eigen profiel bijwerken
  updateUser: async (userId, userData) => {
    const { response, data } = await fetchWithAuth(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
    return { success: response.ok, data };
  },
  
  // Eigen account verwijderen
  deleteUser: async (userId) => {
    const { response, data } = await fetchWithAuth(`/users/${userId}`, {
      method: 'DELETE'
    });
    
    if (response.ok) {
      removeToken();
    }
    
    return { success: response.ok, data };
  }
};

// Albums API calls
export const albumsAPI = {
  // Alle albums ophalen
  getAlbums: async () => {
    const { response, data } = await fetchWithAuth('/albums');
    return { success: response.ok, data };
  },
  
  // Specifiek album ophalen
  getAlbum: async (albumId) => {
    const { response, data } = await fetchWithAuth(`/albums/${albumId}`);
    return { success: response.ok, data };
  },
  
  // Nieuw album aanmaken
  createAlbum: async (albumData) => {
    const { response, data } = await fetchWithAuth('/albums', {
      method: 'POST',
      body: JSON.stringify(albumData)
    });
    return { success: response.ok, data };
  },
  
  // Album bijwerken
  updateAlbum: async (albumId, albumData) => {
    const { response, data } = await fetchWithAuth(`/albums/${albumId}`, {
      method: 'PUT',
      body: JSON.stringify(albumData)
    });
    return { success: response.ok, data };
  },
  
  // Album verwijderen
  deleteAlbum: async (albumId) => {
    const { response, data } = await fetchWithAuth(`/albums/${albumId}`, {
      method: 'DELETE'
    });
    return { success: response.ok, data };
  }
};

// Album Permissies API calls
export const albumPermissionsAPI = {
  // Permissies ophalen voor een album
  getPermissions: async (albumId) => {
    const { response, data } = await fetchWithAuth(`/album_permissions/${albumId}`);
    return { success: response.ok, data };
  },
  
  // Permissie toevoegen voor een gebruiker
  addPermission: async (permissionData) => {
    const { response, data } = await fetchWithAuth('/album_permissions', {
      method: 'POST',
      body: JSON.stringify(permissionData)
    });
    return { success: response.ok, data };
  },
  
  // Permissie bijwerken
  updatePermission: async (permissionId, permissionData) => {
    const { response, data } = await fetchWithAuth(`/album_permissions/${permissionId}`, {
      method: 'PUT',
      body: JSON.stringify(permissionData)
    });
    return { success: response.ok, data };
  },
  
  // Permissie verwijderen
  deletePermission: async (permissionId) => {
    const { response, data } = await fetchWithAuth(`/album_permissions/${permissionId}`, {
      method: 'DELETE'
    });
    return { success: response.ok, data };
  }
};

// Foto's API calls
export const photosAPI = {
  // Foto's van een album ophalen
  getAlbumPhotos: async (albumId) => {
    const { response, data } = await fetchWithAuth(`/photos/album/${albumId}`);
    return { success: response.ok, data };
  },
  
  // Specifieke foto ophalen
  getPhoto: async (photoId) => {
    const { response, data } = await fetchWithAuth(`/photos/${photoId}`);
    return { success: response.ok, data };
  },
  
  // Foto toevoegen aan een album
  uploadPhoto: async (photoData) => {
    const { response, data } = await fetchWithAuth('/photos', {
      method: 'POST',
      body: JSON.stringify(photoData)
    });
    return { success: response.ok, data };
  },
  
  // Foto verwijderen
  deletePhoto: async (photoId) => {
    const { response, data } = await fetchWithAuth(`/photos/${photoId}`, {
      method: 'DELETE'
    });
    return { success: response.ok, data };
  }
};

// Vriendschappen API calls
export const friendsAPI = {
  // Vrienden ophalen
  getFriends: async () => {
    const { response, data } = await fetchWithAuth('/friends');
    return { success: response.ok, data };
  },
  
  // Vriendschapsverzoeken ophalen
  getFriendRequests: async () => {
    const { response, data } = await fetchWithAuth('/friends/requests');
    return { success: response.ok, data };
  },
  
  // Vriendschapsverzoek versturen
  sendFriendRequest: async (receiverId) => {
    const { response, data } = await fetchWithAuth('/friends', {
      method: 'POST',
      body: JSON.stringify({ receiver_id: receiverId })
    });
    return { success: response.ok, data };
  },
  
  // Vriendschapsverzoek accepteren
  acceptFriendRequest: async (requestId) => {
    const { response, data } = await fetchWithAuth(`/friends/requests/${requestId}`, {
      method: 'PUT',
      body: JSON.stringify({ action: 'accept' })
    });
    return { success: response.ok, data };
  },
  
  // Vriendschapsverzoek weigeren
  declineFriendRequest: async (requestId) => {
    const { response, data } = await fetchWithAuth(`/friends/requests/${requestId}`, {
      method: 'PUT',
      body: JSON.stringify({ action: 'decline' })
    });
    return { success: response.ok, data };
  },
  
  // Vriendschap verwijderen
  removeFriend: async (userId) => {
    const { response, data } = await fetchWithAuth(`/friends/${userId}`, {
      method: 'DELETE'
    });
    return { success: response.ok, data };
  }
};

// Exporteren van alle API modules
export default {
  auth: authAPI,
  users: usersAPI,
  albums: albumsAPI,
  albumPermissions: albumPermissionsAPI,
  photos: photosAPI,
  friends: friendsAPI
}; 