# Contributing to Hockey Live App

## Welcome Contributors!

Thank you for your interest in contributing to the Hockey Live App! This document provides guidelines for contributing to the project.

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- Git
- Basic knowledge of FastAPI and React Native

### Development Setup
1. Follow the [Setup Guide](setup_guide.md) to get your development environment running
2. Create a GitHub account and fork the repository
3. Clone your fork locally
4. Set up the development environment
5. Create a new branch for your changes

## How to Contribute

### Reporting Bugs
1. Check existing issues to avoid duplicates
2. Use the bug report template
3. Include detailed reproduction steps
4. Provide system information (OS, Python version, Node version)
5. Include error messages and logs

### Suggesting Features
1. Check existing issues and discussions
2. Use the feature request template
3. Describe the problem you're solving
4. Explain your proposed solution
5. Consider the impact on existing users

### Code Contributions
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Update documentation
7. Commit your changes (`git commit -m 'Add amazing feature'`)
8. Push to your branch (`git push origin feature/amazing-feature`)
9. Create a Pull Request

## Development Guidelines

### Code Style
- **Python**: Follow PEP 8, use Black for formatting
- **JavaScript/TypeScript**: Use ESLint and Prettier
- **Comments**: Write clear, concise comments
- **Naming**: Use descriptive variable and function names

### Testing
- Write unit tests for new functions
- Write integration tests for new API endpoints
- Ensure 80%+ test coverage
- Test on both SQLite and PostgreSQL

### Documentation
- Update relevant documentation
- Add docstrings to new functions
- Update API documentation for new endpoints
- Include examples in documentation

## Pull Request Process

### Before Submitting
1. **Test your changes** thoroughly
2. **Update documentation** if needed
3. **Check code style** with linting tools
4. **Ensure tests pass** with `pytest` and `npm test`
5. **Update CHANGELOG.md** with your changes

### Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] All tests pass
```

### Review Process
1. **Automated checks** must pass
2. **Code review** by maintainers
3. **Testing** by reviewers
4. **Approval** and merge by maintainers

## Code of Conduct

### Our Standards
- Be respectful and inclusive
- Focus on constructive feedback
- Help create a welcoming environment
- Respect different viewpoints and experiences

### Enforcement
- Report violations to project maintainers
- Violations may result in warnings or bans
- Maintainers will investigate all reports

## Development Workflow

### Branch Naming
- `feature/description` - New features
- `bugfix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring

### Commit Messages
```
type(scope): short description

Longer description if needed

- Bullet points for details
- Reference issues: Fixes #123
```

Types: feat, fix, docs, style, refactor, test, chore

### Release Process
1. Version bump in relevant files
2. Update CHANGELOG.md
3. Create release notes
4. Tag release
5. Deploy to production

## Project Structure

### Backend (`/backend`)
- `app/` - Main application code
- `tests/` - Test files
- `docs/` - Documentation
- `scripts/` - Utility scripts

### Mobile App (`/hockey-live-mobile`)
- `src/` - Source code
- `assets/` - Images and resources
- `__tests__/` - Test files

### Documentation (`/docs`)
- `setup_guide.md` - Development setup
- `api_documentation.md` - API reference
- `troubleshooting.md` - Common issues
- `releases/` - Release notes

## Getting Help

### Community Resources
- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: Questions and community help
- **Documentation**: Comprehensive guides in `/docs`
- **API Reference**: Interactive docs at `/docs` endpoint

### Contact Maintainers
- Create an issue for project questions
- Email: [project-email] for security issues
- Discord: [project-discord] for real-time chat

## Recognition

Contributors are recognized in:
- README.md contributors section
- Release notes
- GitHub contributors page
- Annual contributor highlights

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Hockey Live App! Your contributions help make hockey more accessible and enjoyable for teams and families.