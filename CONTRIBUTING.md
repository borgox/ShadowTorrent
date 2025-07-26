# Contributing to ShadowTorrent

Thank you for your interest in contributing to ShadowTorrent! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- Git
- Basic knowledge of Electron, React, and JavaScript

### Setup Development Environment
```bash
# Clone your fork
git clone https://github.com/yourusername/shadowtorrent.git
cd shadowtorrent

# Install dependencies
npm install
cd src/renderer && npm install && cd ../..

# Start development server
npm run dev
```

## 📋 How to Contribute

### 1. Choose an Issue
- Check [open issues](../../issues) for bugs and feature requests
- Look for issues labeled `good first issue` if you're new
- Comment on an issue to let others know you're working on it

### 2. Fork and Branch
```bash
# Fork the repository on GitHub, then:
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-description
```

### 3. Make Changes
- Write clean, readable code
- Follow existing code style and conventions
- Add comments for complex logic
- Update documentation if needed

### 4. Test Your Changes
```bash
# Test in development mode
npm run dev

# Build and test production version
npm run build
```

### 5. Commit and Push
```bash
git add .
git commit -m "feat: add your feature description"
# or
git commit -m "fix: resolve issue with specific problem"
git push origin your-branch-name
```

### 6. Create Pull Request
- Fill out the pull request template
- Reference any related issues
- Provide clear description of changes
- Include screenshots if UI changes are involved

## 🎯 Contribution Guidelines

### Code Style
- Use 2 spaces for indentation
- Use semicolons consistently
- Follow React hooks best practices
- Use meaningful variable and function names
- Keep functions small and focused

### Commit Messages
Follow conventional commits format:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for formatting changes
- `refactor:` for code refactoring
- `test:` for adding tests
- `chore:` for maintenance tasks

### Pull Request Requirements
- [ ] Code follows project style guidelines
- [ ] Changes have been tested in development mode
- [ ] Documentation updated if necessary
- [ ] No console errors or warnings
- [ ] Existing functionality not broken
- [ ] Privacy/security implications considered

## 🛠️ Development Guidelines

### Project Structure
```
shadowtorrent/
├── src/
│   ├── main/           # Electron main process
│   │   ├── main.js     # Application entry point
│   │   └── preload.js  # Preload script
│   └── renderer/       # React frontend
│       ├── public/     # Static assets
│       └── src/        # React components
├── .github/            # GitHub workflows and templates
└── dist/               # Built application (generated)
```

### Key Technologies
- **Electron 22+**: Desktop application framework
- **React 18**: Frontend UI framework
- **WebTorrent 2.0**: BitTorrent engine
- **styled-components**: CSS-in-JS styling
- **electron-store**: Settings persistence

### Adding New Features

#### UI Components
1. Create component in `src/renderer/src/components/`
2. Use styled-components for styling
3. Follow existing component patterns
4. Export from appropriate index file

#### Main Process Features
1. Add functionality to `src/main/main.js`
2. Use secure IPC for renderer communication
3. Handle errors gracefully
4. Consider security implications

#### Settings and Persistence
1. Add to electron-store defaults
2. Update Settings component UI
3. Handle migration if needed
4. Test persistence between app restarts

## 🔒 Security Considerations

When contributing, please consider:
- **Input validation**: Sanitize all user inputs
- **File system access**: Limit to necessary directories
- **Network requests**: Validate and restrict external calls
- **IPC communication**: Use secure channels only
- **Dependencies**: Keep to minimum necessary

## 🐛 Bug Reports

When reporting bugs:
1. Use the bug report template
2. Provide steps to reproduce
3. Include system information
4. Add screenshots if applicable
5. Check if issue already exists

## 💡 Feature Requests

When requesting features:
1. Use the feature request template
2. Explain the use case clearly
3. Consider privacy implications
4. Suggest implementation approach
5. Discuss with maintainers first for major features

## 📝 Documentation

Help improve documentation by:
- Fixing typos and grammar
- Adding examples and tutorials
- Improving API documentation
- Translating to other languages
- Creating video guides

## 🎉 Recognition

Contributors will be recognized:
- In the README contributors section
- In release notes for significant contributions
- Through GitHub's contributor graphs
- In the application's about section

## ❓ Questions?

If you have questions:
- Check existing [discussions](../../discussions)
- Create a new discussion for general questions
- Join our community chat (if available)
- Reach out to maintainers directly

## 📜 Code of Conduct

This project follows a code of conduct:
- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Maintain a welcoming environment

---

Thank you for contributing to ShadowTorrent! Your efforts help make privacy-focused torrenting better for everyone. 🛡️
