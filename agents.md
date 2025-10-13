# Bedrock Core Agents Guide

This document provides guidance for AI agents working on the Bedrock Core platform.

## Project Overview

Bedrock Core is a full-stack platform consisting of:

- **API Service**: RESTful JSON API built with Node.js, Koa, and MongoDB
- **Web Service**: React-based web application and admin dashboard
- **Deployment**: Kubernetes-based deployment infrastructure

## General Guidelines

### Code Quality

- Follow existing code patterns and conventions in each service
- Use ESLint and Prettier for code formatting
- Write meaningful commit messages
- Include JSDoc comments when appropriate
- Keep changes minimal and focused

### Development Workflow

- Run tests before committing changes
- Verify builds complete successfully
- Check that no unrelated tests are broken

### Repository Structure

- `/services/api` - Backend API service
- `/services/web` - Frontend web application
- `/deployment` - Infrastructure and deployment configurations
- Root `.env` files for environment configuration

### Testing

- Run service-specific tests in their respective directories
- Don't remove or modify unrelated tests
- Add tests for new functionality when appropriate

### Documentation

- Update relevant README.md files when making significant changes
- API documentation is in `services/api/src/routes/__openapi__`
- Web documentation portal is in `services/web/src/docs`

## Service-Specific Guides

For detailed guidance on each service, see:

- [API Service Guide](services/api/agents.md)
- [Web Service Guide](services/web/agents.md)

## Common Patterns

### Environment Variables

- Configuration is done via environment variables
- Default values are in `.env` files
- Never commit secrets to the repository

### Accessing Services

- Web UI: http://localhost:2200/
- API: http://localhost:2300/
- API Documentation: http://localhost:2200/docs

## Best Practices

1. **Read before modifying**: Understand the existing code and patterns
2. **Test thoroughly**: Run tests and verify builds
3. **Minimal changes**: Make the smallest possible changes to achieve the goal
4. **Document changes**: Update relevant documentation
5. **Security first**: Never introduce security vulnerabilities or commit secrets

## Resources

- [API README](services/api/README.md)
- [Web README](services/web/README.md)
- [Deployment README](deployment/README.md)
