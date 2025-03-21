import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from './api';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Bepaal welk menu-item actief is op basis van de huidige URL
  const getActiveClass = (path) => {
    if (path === '/albums' && location.pathname === '/albums') {
      return 'active';
    }
    
    if (path === '/albums' && location.pathname.startsWith('/albums/')) {
      return 'active';
    }
    
    return location.pathname === path ? 'active' : '';
  };
  
  // Uitloggen
  const handleLogout = () => {
    // Bevestiging vragen aan gebruiker
    if (window.confirm('Are you sure you want to log out?')) {
      // Token verwijderen
      api.auth.removeToken();
      
      // Naar login pagina navigeren
      navigate('/');
    }
  };
  
  // Toggle menu voor mobiele weergave
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
  
  return (
    <nav className="main-navigation">
      <div className="nav-container">
        <div className="brand">
          <Link to="/albums">
            <h1>Picshare</h1>
          </Link>
        </div>
        
        {/* Hamburger menu voor mobiel */}
        <div className="mobile-menu-toggle" onClick={toggleMenu}>
          <span className="burger-line"></span>
          <span className="burger-line"></span>
          <span className="burger-line"></span>
        </div>
        
        {/* Navigatie menu */}
        <div className={`nav-menu ${menuOpen ? 'open' : ''}`}>
          <ul className="nav-items">
            <li className={getActiveClass('/albums')}>
              <Link to="/albums" onClick={() => setMenuOpen(false)}>
                Albums
              </Link>
            </li>
            <li className={getActiveClass('/friends')}>
              <Link to="/friends" onClick={() => setMenuOpen(false)}>
                Friends
              </Link>
            </li>
            <li>
              <button className="logout-button" onClick={handleLogout}>
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 