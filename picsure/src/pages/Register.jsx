import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import Typography from '@material-ui/core/Typography';
import InputAdornment from '@material-ui/core/InputAdornment';
import PersonIcon from '@material-ui/icons/Person';
import EmailIcon from '@material-ui/icons/Email';
import LockIcon from '@material-ui/icons/Lock';
import PhoneIcon from '@material-ui/icons/Phone';
import CakeIcon from '@material-ui/icons/Cake';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100vh',
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#f8f9fa',
  },
  image: {
    backgroundImage: 'linear-gradient(135deg, #42a5f5 0%, #1976d2 100%)',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    textAlign: 'center',
    padding: theme.spacing(4),
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
    borderRadius: '10px 0 0 10px',
    [theme.breakpoints.down('sm')]: {
      borderRadius: '10px 10px 0 0',
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'url(/wave-pattern.svg)',
      backgroundSize: 'cover',
      opacity: 0.15,
    },
  },
  paper: {
    margin: theme.spacing(5, 4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: theme.spacing(4),
    borderRadius: 10,
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
    backgroundColor: '#fff',
    overflow: 'auto',
    maxHeight: '90vh',
    [theme.breakpoints.down('sm')]: {
      margin: theme.spacing(3, 2),
      padding: theme.spacing(3, 2),
    },
  },
  logo: {
    width: '60px',
    height: '60px',
    marginBottom: theme.spacing(2),
    filter: 'drop-shadow(0 2px 5px rgba(0, 0, 0, 0.2))',
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
    padding: theme.spacing(1.5, 0),
    borderRadius: 30,
    fontWeight: 600,
    textTransform: 'none',
    fontSize: '1rem',
    boxShadow: '0 4px 10px rgba(25, 118, 210, 0.3)',
    background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)',
    transition: 'all 0.3s ease',
    '&:hover': {
      boxShadow: '0 6px 15px rgba(25, 118, 210, 0.4)',
      transform: 'translateY(-1px)',
    },
  },
  greeting: {
    marginBottom: theme.spacing(3),
    fontWeight: 600,
    color: '#fff',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
    position: 'relative',
    zIndex: 2,
  },
  subtitle: {
    marginBottom: theme.spacing(5),
    maxWidth: '80%',
    lineHeight: 1.6,
    fontSize: '1.1rem',
    position: 'relative',
    zIndex: 2,
  },
  textField: {
    marginBottom: theme.spacing(2),
    '& .MuiOutlinedInput-root': {
      borderRadius: 8,
      transition: 'all 0.3s ease',
      '&:hover fieldset': {
        borderColor: theme.palette.primary.main,
      },
      '&.Mui-focused fieldset': {
        borderColor: theme.palette.primary.main,
        borderWidth: 2,
      },
    },
    '& .MuiOutlinedInput-input': {
      padding: theme.spacing(1.5, 2),
    },
    '& .MuiInputLabel-outlined': {
      transform: 'translate(14px, 16px) scale(1)',
    },
    '& .MuiInputLabel-outlined.MuiInputLabel-shrink': {
      transform: 'translate(14px, -6px) scale(0.75)',
    },
  },
  signInBtn: {
    marginTop: theme.spacing(2),
    borderRadius: 30,
    fontWeight: 600,
    textTransform: 'none',
    padding: theme.spacing(1.3, 0),
    fontSize: '1rem',
    boxShadow: '0 4px 10px rgba(255, 255, 255, 0.3)',
    background: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    color: '#fff',
    transition: 'all 0.3s ease',
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.3)',
      boxShadow: '0 6px 15px rgba(255, 255, 255, 0.4)',
    },
  },
  avatarContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(1),
  },
  avatar: {
    width: theme.spacing(12),
    height: theme.spacing(12),
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
    border: '3px solid #fff',
  },
  uploadButton: {
    display: 'none',
  },
  uploadLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    cursor: 'pointer',
    padding: theme.spacing(0.5, 1.5),
    borderRadius: 20,
    fontSize: '0.875rem',
    background: 'rgba(25, 118, 210, 0.1)',
    color: theme.palette.primary.main,
    transition: 'all 0.3s ease',
    '&:hover': {
      background: 'rgba(25, 118, 210, 0.2)',
    },
  },
  warning: {
    color: theme.palette.error.main,
    marginBottom: theme.spacing(2),
    textAlign: 'center',
  },
}));

function Register({ setUser }) {
  const classes = useStyles();
  const navigate = useNavigate();
  const fileInputRef = useRef();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    profilePicture: null,
  });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [errors, setErrors] = useState({});
  const [ageWarning, setAgeWarning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username) {
      newErrors.username = 'Username is required';
    }
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.age) {
      newErrors.age = 'Age is required';
    } else if (isNaN(formData.age) || formData.age < 14 || formData.age > 30) {
      newErrors.age = 'Age must be between 14 and 30';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const age = parseInt(formData.age);
    if (age < 14 || age > 30) {
      setAgeWarning(true);
      return;
    }

    try {
      setIsLoading(true);
      // Simulate API request
      setTimeout(() => {
        // Mock user data
        const userData = {
          id: 1,
          name: formData.username,
          email: formData.email,
          profilePicture: previewUrl || 'https://i.pravatar.cc/300',
          age: parseInt(formData.age),
        };
        
        setUser(userData);
        setIsLoading(false);
        navigate('/albums');
      }, 1500);
    } catch (error) {
      setIsLoading(false);
      setErrors({ submit: 'An error occurred. Please try again.' });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, profilePicture: file }));
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Grid container component="main" className={classes.root}>
      <Grid item xs={false} sm={4} md={5} className={classes.image}>
        <Typography component="h1" variant="h3" className={classes.greeting}>
          Already have an account?
        </Typography>
        <Typography variant="body1" className={classes.subtitle}>
          Sign in to continue sharing and exploring amazing moments!
        </Typography>
        <Button
          component={Link}
          to="/login"
          variant="outlined"
          className={classes.signInBtn}
          fullWidth
          style={{ maxWidth: 200 }}
        >
          Sign In
        </Button>
      </Grid>
      
      <Grid item xs={12} sm={8} md={7} component={Paper} elevation={6} square>
        <div className={classes.paper}>
          {/* Text-based logo */}
          <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '2rem', color: '#1976d2', fontWeight: 'bold' }}>Pic</span>
            <span style={{ fontSize: '2rem', color: '#42a5f5', fontWeight: 'bold' }}>Sure</span>
          </div>
          <Typography component="h1" variant="h4" style={{ fontWeight: 600, marginBottom: 16 }}>
            Create Account
          </Typography>
          <Typography variant="body2" color="textSecondary" style={{ marginBottom: 24 }}>
            Join our community and start sharing your memories!
          </Typography>

          {ageWarning && (
            <Box mb={2} p={2} bgcolor="rgba(244, 67, 54, 0.1)" borderRadius={1}>
              <Typography variant="body2" color="error">
                Warning: This app is intended for users between 14 and 30 years old.
                Some content may not be appropriate for your age group.
              </Typography>
            </Box>
          )}

          {errors.submit && (
            <Box mb={2} p={2} bgcolor="rgba(244, 67, 54, 0.1)" borderRadius={1}>
              <Typography variant="body2" color="error">
                {errors.submit}
              </Typography>
            </Box>
          )}

          <form className={classes.form} onSubmit={handleSubmit}>
            <div className={classes.avatarContainer}>
              <Avatar 
                src={previewUrl} 
                className={classes.avatar}
              >
                {!previewUrl && <PersonIcon style={{ fontSize: 40 }} />}
              </Avatar>
              <input
                type="file"
                accept="image/*"
                className={classes.uploadButton}
                id="profile-picture-input"
                onChange={handleFileChange}
                ref={fileInputRef}
              />
              <label htmlFor="profile-picture-input" className={classes.uploadLabel}>
                <CloudUploadIcon fontSize="small" />
                Upload Profile Picture
              </label>
            </div>

            <TextField
              className={classes.textField}
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              value={formData.username}
              onChange={handleChange}
              error={!!errors.username}
              helperText={errors.username}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              className={classes.textField}
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              className={classes.textField}
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              className={classes.textField}
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              className={classes.textField}
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="age"
              label="Age"
              type="number"
              id="age"
              value={formData.age}
              onChange={handleChange}
              error={!!errors.age}
              helperText={errors.age}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CakeIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </Button>
          </form>
        </div>
      </Grid>
    </Grid>
  );
}

export default Register; 