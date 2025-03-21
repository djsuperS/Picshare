import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// ES Module fix voor __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Upload map aanmaken als deze niet bestaat
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();
const PORT = process.env.PORT || 3001;

// Multer configuratie voor file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

// In-memory data storage
let albums = [
  {
    id: 1,
    userId: 1,
    name: 'Vakantie 2024',
    description: 'Onze zomervakantie in Spanje',
    thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    photos: []
  },
  {
    id: 2,
    userId: 1,
    name: 'Familie',
    description: 'Foto\'s van familiebijeenkomsten',
    thumbnail: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    photos: []
  },
  {
    id: 3,
    userId: 1,
    name: 'Natuur',
    description: 'Mooie natuurfoto\'s',
    thumbnail: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    photos: []
  }
];

// Routes
app.get('/api/albums', (req, res) => {
  const userId = parseInt(req.query.userId) || 1; // Default userId voor tests
  const userAlbums = albums.filter(album => album.userId === userId);
  res.json(userAlbums);
});

app.get('/api/albums/:id', (req, res) => {
  const albumId = parseInt(req.params.id);
  const album = albums.find(album => album.id === albumId);
  
  if (!album) {
    return res.status(404).json({ error: 'Album niet gevonden' });
  }
  
  res.json(album);
});

app.post('/api/albums', upload.single('thumbnail'), (req, res) => {
  const { name, description } = req.body;
  const userId = parseInt(req.body.userId) || 1; // Default userId voor tests
  
  // Thumbnail path als een bestand is geüpload
  let thumbnailPath = null;
  if (req.file) {
    thumbnailPath = `/uploads/${req.file.filename}`;
  } else {
    // Default thumbnail als er geen bestand is geüpload
    thumbnailPath = 'https://images.unsplash.com/photo-1557682250-f37ae56bf55e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3';
  }
  
  const newAlbum = {
    id: albums.length > 0 ? Math.max(...albums.map(a => a.id)) + 1 : 1,
    userId,
    name,
    description,
    thumbnail: thumbnailPath,
    photos: []
  };
  
  albums.push(newAlbum);
  res.status(201).json(newAlbum);
});

app.post('/api/albums/:id/photos', upload.single('photo'), (req, res) => {
  const albumId = parseInt(req.params.id);
  const album = albums.find(album => album.id === albumId);
  
  if (!album) {
    return res.status(404).json({ error: 'Album niet gevonden' });
  }
  
  if (!req.file) {
    return res.status(400).json({ error: 'Geen foto geüpload' });
  }
  
  const { caption } = req.body;
  const photoPath = `/uploads/${req.file.filename}`;
  
  const newPhoto = {
    id: album.photos.length > 0 ? Math.max(...album.photos.map(p => p.id)) + 1 : 1,
    caption,
    path: photoPath,
    createdAt: new Date().toISOString()
  };
  
  album.photos.push(newPhoto);
  res.status(201).json(newPhoto);
});

// Server starten
app.listen(PORT, () => {
  console.log(`Server draait op http://localhost:${PORT}`);
}); 