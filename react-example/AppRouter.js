import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import api from './api';

// Importeer de verschillende componenten
import Auth from './Auth';
import AlbumsList from './AlbumsList';
import AlbumDetail from './AlbumDetail';
import AlbumEdit from './AlbumEdit';
import AlbumShare from './AlbumShare';
import Friends from './Friends';
import Navigation from './Navigation'; // We zullen dit later maken voor menubalk

// PrivateRoute component om te controleren of gebruiker is ingelogd
const PrivateRoute = ({ element }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    const verifyAuth = async () => {
      // Controleer of er een token in localStorage is
      const token = api.auth.getToken();
      
      if (!token) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }
      
      try {
        // Valideer token met API
        const { success } = await api.auth.verifyToken();
        setIsAuthenticated(success);
      } catch (error) {
        // Bij fout, token ongeldig beschouwen
        setIsAuthenticated(false);
        // Token verwijderen uit localStorage
        api.auth.removeToken();
        console.error("Auth error:", error);
      } finally {
        setLoading(false);
      }
    };
    
    verifyAuth();
  }, []);
  
  if (loading) {
    return <div className="loading-indicator">Verifying authentication...</div>;
  }
  
  return isAuthenticated ? element : <Navigate to="/" />;
};

const AppRouter = () => {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          {/* Publieke routes */}
          <Route path="/" element={<Auth />} />
          
          {/* Beschermde routes die alleen toegankelijk zijn als je bent ingelogd */}
          <Route 
            path="/albums" 
            element={
              <PrivateRoute 
                element={
                  <>
                    <Navigation />
                    <AlbumsList />
                  </>
                } 
              />
            } 
          />
          
          <Route 
            path="/albums/:albumId" 
            element={
              <PrivateRoute 
                element={
                  <>
                    <Navigation />
                    <AlbumDetail />
                  </>
                } 
              />
            } 
          />
          
          <Route 
            path="/albums/:albumId/edit" 
            element={
              <PrivateRoute 
                element={
                  <>
                    <Navigation />
                    <AlbumEdit />
                  </>
                } 
              />
            } 
          />
          
          <Route 
            path="/albums/:albumId/share" 
            element={
              <PrivateRoute 
                element={
                  <>
                    <Navigation />
                    <AlbumShare />
                  </>
                } 
              />
            } 
          />
          
          <Route 
            path="/friends" 
            element={
              <PrivateRoute 
                element={
                  <>
                    <Navigation />
                    <Friends />
                  </>
                } 
              />
            } 
          />
          
          {/* Fallback route voor niet-bestaande pagina's */}
          <Route path="*" element={<Navigate to={api.auth.getToken() ? "/albums" : "/"} />} />
        </Routes>
      </div>
    </Router>
  );
};

export default AppRouter; 