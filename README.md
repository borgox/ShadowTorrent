# 🛡️ ShadowTorrent

A lightweight, privacy-focused BitTorrent client built with Electron and React. Designed for speed, security, and user experience with a modern dark interface.

![ShadowTorrent](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey)

## ✨ Features

### � **Performance & Speed**
- **WebTorrent 2.0** - Latest high-performance BitTorrent implementation
- **Bandwidth Control** - Configurable upload/download limits
- **Smart Connection Management** - Optimized peer connections
- **Efficient Resource Usage** - Lightweight and fast

### 🔒 **Privacy & Security**
- **Anonymous Mode** - No tracker announcements
- **DHT Control** - Enable/disable distributed hash table
- **PEX/LSD Toggle** - Control peer exchange and local service discovery
- **DevTools Protection** - Disabled in production builds
- **Secure Navigation** - External link blocking

### 🎨 **User Interface**
- **Dark Theme** - Eye-friendly design optimized for extended use
- **Drag & Drop Everywhere** - Drop torrents/magnets anywhere in the app
- **Context Menus** - Right-click actions for torrent management
- **Real-time Statistics** - Live download/upload speeds and progress
- **Persistent Sessions** - Resume downloads between app restarts

### 🛠️ **Advanced Features**
- **Torrent Streaming** - HTTP server for media streaming
- **WebSocket API** - Real-time updates and external integration
- **Persistent Storage** - Settings and torrents saved automatically
- **File Management** - Open files and show in folder
- **Custom Download Paths** - Set download location per torrent
- Clean, modern interface
- Real-time statistics and progress tracking
- Responsive design

### 🛠 Core Features
- **Multi-torrent Management**: Download and manage multiple torrents simultaneously
- **Speed Controls**: Set upload/download limits
- **Statistics Dashboard**: Detailed analytics and charts
- **File Management**: Easy access to downloaded files
- **Magnet Link Support**: Add torrents via magnet links or .torrent files
- **Drag & Drop**: Intuitive torrent adding

## 📦 Installation

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Development Setup

1. **Clone and Install Dependencies**
   ```bash
   git clone <repository-url>
   cd shadowtorrent
   npm install
   ```

2. **Install Renderer Dependencies**
   ```bash
   cd src/renderer
   npm install
   cd ../..
   ```

3. **Start Development Mode**
   ```bash
   npm run dev
   ```

### Building for Production

1. **Build the Application**
   ```bash
   npm run build
   ```

2. **Create Distributable**
   ```bash
   npm run dist
   ```

## 🖥 System Requirements

- **Windows**: Windows 10 or later
- **macOS**: macOS 10.14 or later  
- **Linux**: Ubuntu 18.04, Fedora 32, or equivalent
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 100MB for application + space for downloads

## 🎛 Configuration

ShadowTorrent stores settings locally using electron-store. Key configuration options:

### General Settings
- **Download Path**: Where torrents are saved
- **Max Connections**: Maximum peer connections (default: 200)

### Bandwidth
- **Download Limit**: Maximum download speed (0 = unlimited)
- **Upload Limit**: Maximum upload speed (0 = unlimited)

### Privacy & Security
- **Anonymous Mode**: Hide client information
- **DHT**: Distributed hash table for peer discovery
- **PEX**: Peer exchange protocol
- **LSD**: Local service discovery
- **μTP**: Micro transport protocol

### Interface
- **Compact Mode**: Reduced spacing for more content
- **Notifications**: System notifications for events

## 🔧 Architecture

```
ShadowTorrent/
├── src/
│   ├── main/              # Electron main process
│   │   ├── main.js        # Application entry point
│   │   └── preload.js     # Secure IPC bridge
│   └── renderer/          # React frontend
│       ├── src/
│       │   ├── components/  # React components
│       │   ├── styles/      # Styled components
│       │   └── App.js      # Main React app
│       └── package.json
├── package.json           # Main package configuration
└── README.md
```

### Technology Stack
- **Electron**: Cross-platform desktop app framework
- **React 18**: Modern UI framework with hooks
- **WebTorrent**: Pure JavaScript BitTorrent implementation
- **Styled Components**: CSS-in-JS styling
- **Recharts**: Data visualization
- **Lucide React**: Modern icon set

## 🚨 Security Considerations

- All torrent operations run in sandboxed processes
- No external network requests except for torrent data
- Settings encrypted and stored locally
- Optional anonymous mode for enhanced privacy

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🛟 Support

For issues, feature requests, or questions:
- Open an issue on GitHub
- Check existing issues for solutions
- Provide detailed reproduction steps

## 🔮 Roadmap

- [ ] Streaming support for media files
- [ ] Advanced bandwidth scheduling
- [ ] Plugin system
- [ ] Remote management API
- [ ] Mobile companion app
- [ ] Encrypted storage option
- [ ] VPN integration
- [ ] RSS feed support

---

**Built with ❤️ for privacy-conscious users who demand speed and simplicity.**
