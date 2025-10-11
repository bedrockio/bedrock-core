# Bedrock Web Service - Agents Guide

This guide provides AI agents with specific information about working on the Bedrock Web service.

## Service Overview

The Bedrock Web service is a React-based web application providing:
- **User Dashboard** - Main application interface
- **Admin Panel** - Administration and management features
- **API Documentation Portal** - Interactive API documentation

Built with:
- **React** - UI framework
- **Mantine v7.17** - UI component library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **MobX** - State management

## Directory Structure

```
services/web/
├── .env                   - Environment configuration
├── package.json           - Dependencies
├── vite.config.js         - Build configuration
├── src/
│   ├── index.html        - HTML entry point
│   ├── App.js            - Main app component
│   ├── components/       - Reusable UI components
│   ├── screens/          - Page-level components
│   ├── stores/           - MobX state stores
│   ├── utils/            - Helper utilities
│   │   └── analytics/    - Analytics integration
│   └── docs/             - API documentation portal
│       └── pages/        - Documentation pages (MDX)
├── serve/
│   ├── dev.js           - Development server
│   └── static.js        - Production static server
└── dist/                - Built assets (generated)
```

## Development

### Setup
```bash
cd services/web
yarn install
```

### Running in Development
```bash
yarn start
```

UI runs at: http://localhost:2200/

### Building for Production
```bash
yarn build
```

Output in `dist/` directory.

### Configuration
Environment variables (see `.env`):
- `SERVER_PORT` - Web server port (default: 2200)
- `API_URL` - Backend API URL (default: http://localhost:2300)
- `APP_NAME` - Application name
- `ENV_NAME` - Environment (development/staging/production)
- `SENTRY_DSN` - Error monitoring
- `SERVER_AUTH_*` - Basic auth for staging/preview environments

## Code Standards

### General Guidelines
- Use **function declarations** instead of arrow functions for components
- Format with ESLint and Prettier (configured in project)
- Include JSDoc comments when appropriate
- Follow existing code patterns

### UI Components
- **Always use Mantine v7.17 components** when possible
- Check for reusable Mantine components before creating custom ones
- Common components: Button, TextInput, Select, Modal, Table, etc.
- See: https://mantine.dev/

### Component Structure
Example component:
```javascript
import { Button, TextInput } from '@mantine/core';

/**
 * Example form component
 */
function MyForm() {
  return (
    <form>
      <TextInput label="Name" />
      <Button type="submit">Submit</Button>
    </form>
  );
}

export default MyForm;
```

## Key Features

### State Management (Stores)
Using MobX for global state:
- Store files in `src/stores/`
- Examples: user store, auth store, UI store
- See: [Stores Documentation](src/stores/README.md)

### Utilities
Helper functions in `src/utils/`:
- `api.js` - API client for backend communication
- `env.js` - Environment variable access
- `uploads.js` - File upload helpers
- `forms.js` - Form utilities

Example API call:
```javascript
import { request } from 'utils/api';

const { data } = await request({
  method: 'POST',
  path: '/1/users/search',
  body: { /* query */ }
});
```

Example environment variable:
```javascript
import { API_URL, APP_NAME } from 'utils/env';
```

### Routing
- React Router for navigation
- Route definitions in component files
- Protected routes with authentication checks

### CRUD Views
Standardized CRUD pattern for resources:
- List view with search/filtering
- Detail view
- Create/edit forms
- Delete confirmations

Example: [Shops CRUD](src/screens/Shops/index.js)

## API Documentation Portal

Documentation in `src/docs/`:
- Markdown with MDX extensions for interactive elements
- Menu/order configured in `src/docs/pages/index.js`

### MDX Extensions
Special components for API documentation:
- `callHeading` - Show method + path
- `callParams` - Request parameters
- `callResponse` - Response body
- `callExamples` - Usage examples
- `callSummary` - All of the above
- `objectSummary` - Object attributes

Example:
```javascript
callParams({ method: 'POST', path: '/1/auth/login' });
```

### Adding Documentation
1. Create MDX file in `src/docs/pages/[Name].mdx`
2. Export title and content
3. Import in `src/docs/pages/index.js`
4. Add to PAGES object

## Theming

Mantine theme configuration:
- Theme object in app configuration
- Customize colors, spacing, fonts, etc.
- See: https://mantine.dev/theming/theme-object/

## Components Documentation

Reusable components in `src/components/`:
- Form components
- Layout components
- Data display components
- Navigation components

See: [Components Documentation](src/components)

## Analytics

Analytics integration in `src/utils/analytics/`:
- Track page views
- Track user events
- Integration with analytics providers

See: [Analytics Documentation](src/utils/analytics/README.md)

## Common Tasks

### Adding a New Screen
1. Create component in `src/screens/[Name]/`
2. Add route in routing configuration
3. Add navigation link if needed
4. Implement UI with Mantine components

### Creating a CRUD View
1. Follow pattern from existing CRUD views (e.g., Shops)
2. Use common components for list/detail/form
3. Connect to API endpoints
4. Add search/filtering as needed

### Adding a Form
1. Use Mantine form components
2. Implement validation
3. Connect to API for submission
4. Handle errors and success states

### Styling Components
1. Use Mantine's styling system
2. Use inline styles with `style` prop when needed
3. Use CSS modules for complex custom styling
4. Follow existing patterns in the codebase

## Authentication

Multiple login methods supported:
- Password (default)
- OTP (phone/email)
- Passkey (WebAuthn)
- Federated (Apple, Google)

Login entrypoint configured in `src/App.js`.

MFA options:
- SMS OTP
- Email OTP
- TOTP (Authenticator apps)

Settings page for users to manage auth methods.

## Testing

- Test files colocated with components
- Use React Testing Library
- Test user interactions and state changes

## Build & Deployment

### Development Build
- Hot module replacement
- Source maps
- Fast rebuild

### Production Build
- Minified assets
- Optimized bundles
- Asset hashing for caching

### Static Server
Production server in `serve/static.js`:
- Serves built assets from `dist/`
- Handles SPA routing
- Optional basic auth

## Lodash

Lodash available for utility functions:
- Import specific functions: `import { kebabCase } from 'lodash';`
- Common uses: data manipulation, formatting, validation

## Accessibility

- Use semantic HTML
- Provide ARIA labels where needed
- Ensure keyboard navigation works
- Test with screen readers

## Best Practices

1. **Use Mantine components first** - Don't reinvent the wheel
2. **Keep components small** - Single responsibility principle
3. **Reuse common patterns** - Follow existing CRUD views
4. **Handle loading and error states** - Provide good UX
5. **Validate user input** - Both client and server side
6. **Use TypeScript features** - PropTypes or JSDoc for types
7. **Test interactions** - Ensure UI works as expected

## Common Patterns

### Loading States
```javascript
const [loading, setLoading] = useState(false);

if (loading) {
  return <Loader />;
}
```

### Error Handling
```javascript
try {
  await request({ /* ... */ });
  // success
} catch (error) {
  // show error notification
}
```

### Forms with Validation
```javascript
const form = useForm({
  initialValues: { /* ... */ },
  validate: { /* ... */ }
});
```

## Troubleshooting

- **Build errors**: Check for missing dependencies, clear cache
- **API connection**: Verify `API_URL` environment variable
- **Styling issues**: Check Mantine version compatibility
- **Routing problems**: Ensure routes are properly configured
- **State not updating**: Check MobX observable/action setup

## Additional Resources

- [Main Web README](README.md)
- [Utils Documentation](src/utils/README.md)
- [Stores Documentation](src/stores/README.md)
- [Components Documentation](src/components)
- [Mantine Documentation](https://mantine.dev/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
