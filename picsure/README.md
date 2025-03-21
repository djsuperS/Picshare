# PicSure - Photo Sharing App

PicSure is a modern photo sharing application designed for users between 14 and 30 years old. It allows users to create photo albums, share them with friends, and manage permissions for each album.

## Features

- User authentication with age verification
- Profile management with profile picture upload
- Create and manage photo albums
- Upload and organize photos
- Share albums with friends
- Customizable album permissions
- Friend request system
- Real-time notifications
- Responsive design for mobile and desktop

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- MySQL database (v5.7 or higher)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/picsure.git
cd picsure
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
VITE_API_URL=http://localhost:3000
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

4. Import the database schema:
```bash
mysql -u your_username -p your_database_name < database/schema.sql
```

## Development

To start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## Building for Production

To create a production build:

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
picsure/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Page components
│   ├── context/       # React context providers
│   ├── utils/         # Utility functions
│   ├── assets/        # Static assets
│   ├── theme.js       # Material-UI theme configuration
│   ├── App.jsx        # Main application component
│   └── main.jsx       # Application entry point
├── public/            # Public static files
├── database/          # Database schema and migrations
└── package.json       # Project dependencies and scripts
```

## Technologies Used

- React
- Material-UI
- React Router
- Firebase (Authentication & Storage)
- MySQL
- Tailwind CSS

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Material-UI for the component library
- Firebase for authentication and storage
- React Router for navigation
- Tailwind CSS for utility classes
