# Contributing to Meta-Log Database

Thank you for your interest in contributing to Meta-Log Database! This document provides guidelines and instructions for contributing.

## Getting Started

1. **Fork the repository**
   - Click the "Fork" button on GitHub

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/meta-log-db.git
   cd meta-log-db
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

## Development

### Building

- **Build Node.js version**: `npm run build`
- **Build browser bundle**: `npm run build:browser`
- **Build all**: `npm run build:all`
- **Watch mode**: `npm run watch`

### Testing

- **Run tests**: `npm test`
- **Run tests with coverage**: `npm test:coverage`
- **Run tests in watch mode**: `npm test:watch`

### Code Style

- Use TypeScript for all source files
- Follow existing code style and patterns
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Keep functions focused and single-purpose

## Submitting Changes

### Before Submitting

1. **Ensure tests pass**
   ```bash
   npm test
   ```

2. **Ensure build succeeds**
   ```bash
   npm run build:all
   ```

3. **Verify browser build**
   ```bash
   npm run verify:browser
   ```

4. **Update documentation** if needed
   - Update README.md if adding new features
   - Update relevant docs in `docs/` folder
   - Add examples if applicable

### Commit Messages

- Use clear, descriptive commit messages
- Start with a verb (Add, Fix, Update, Remove, etc.)
- Reference issue numbers if applicable: `Fix #123: Description`

### Pull Request Process

1. **Push your changes**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Open a Pull Request**
   - Go to the GitHub repository
   - Click "New Pull Request"
   - Select your branch
   - Fill out the PR template

3. **PR Requirements**
   - All tests must pass
   - Code must build successfully
   - Documentation updated if needed
   - PR description explains the changes

## Code Review

- All PRs require review before merging
- Address review comments promptly
- Be open to feedback and suggestions
- Keep discussions constructive and respectful

## Reporting Issues

### Bug Reports

- Use the bug report template
- Include steps to reproduce
- Include expected vs actual behavior
- Include environment details (Node version, OS, etc.)

### Feature Requests

- Use the feature request template
- Explain the use case
- Describe the proposed solution
- Consider alternatives

## Questions?

- Open an issue for questions
- Check existing documentation first
- Review existing issues and PRs

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing to Meta-Log Database!

