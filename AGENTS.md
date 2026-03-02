# AGENTS.md - Agentic Coding Guidelines

## Project Overview

This is a **Cloudflare Workers** project with **Durable Objects** that provides a Gemini API load balancer and proxy service. It uses the **Hono** framework for routing and **SQLite** (via Durable Objects) for API key storage.

---

## Build, Lint, and Test Commands

### Package Manager
- **pnpm** is the package manager (pnpm-lock.yaml present)

### Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm install` | Install dependencies |
| `pnpm run dev` | Start local development server (wrangler dev) |
| `pnpm run start` | Alias for `pnpm run dev` |
| `pnpm run deploy` | Deploy to Cloudflare Workers |
| `pnpm run cf-typegen` | Generate Cloudflare type definitions |

### Testing
- **No test framework configured** - there are no test scripts in package.json
- To add tests, consider installing `vitest` or `jest` with appropriate Cloudflare Workers adapters

### Linting
- **No ESLint configured** - no .eslintrc or eslint config found
- Code uses Prettier for formatting only

---

## Code Style Guidelines

### Formatting (Prettier)
```json
{
  "printWidth": 140,
  "singleQuote": true,
  "semi": true,
  "useTabs": true
}
```

### TypeScript Configuration
- **Target**: ES2021
- **Module**: ES2022
- **Strict mode**: Enabled (strict: true)
- **JSX**: react-jsx with hono/jsx
- **Module resolution**: node
- **Types**: node, ./worker-configuration.d.ts

### Naming Conventions
- **Variables/functions**: camelCase (e.g., `getAuthKey`, `apiKey`)
- **Classes**: PascalCase (e.g., `LoadBalancer`, `HttpError`)
- **Constants**: SCREAMING_SNAKE_CASE (e.g., `BASE_URL`, `API_VERSION`)
- **Files**: kebab-case (e.g., `index.ts`, `auth.ts`)

### Imports
- Use named imports: `import { Hono } from 'hono'`
- Group imports: external first, then relative
- Relative imports use explicit paths: `import { getAuthKey } from './auth'`

### Error Handling
- Custom `HttpError` class with status codes:
  ```typescript
  class HttpError extends Error {
    status: number;
    constructor(message: string, status: number) {
      super(message);
      this.name = this.constructor.name;
      this.status = status;
    }
  }
  ```
- Always return JSON error responses with appropriate HTTP status codes
- Use try/catch blocks for async operations
- Log errors with `console.error()` before returning error responses

### Response Patterns
```typescript
// Success response
return new Response(JSON.stringify({ message: 'Success' }), {
  status: 200,
  headers: { 'Content-Type': 'application/json' }
});

// Error response
return new Response(JSON.stringify({ error: 'Error message' }), {
  status: 400,
  headers: { 'Content-Type': 'application/json' }
});
```

### CORS Handling
- Use the `fixCors()` utility function to add CORS headers
- It adds: `Access-Control-Allow-Origin: *`, appropriate methods and headers

---

## Project Structure

```
src/
├── index.ts      # Main entry, Hono app setup, route definitions
├── handler.ts    # LoadBalancer Durable Object class (core logic)
├── auth.ts      # Authentication utilities
└── render.tsx   # JSX components for admin UI
```

### Key Files
- **src/index.ts**: Main app, routes `/`, `/api/keys`, and wildcard `*` to DO
- **src/handler.ts**: Durable Object with `fetch()`, `alarm()`, admin APIs
- **src/auth.ts**: `getAuthKey()` and `isAdminAuthenticated()` utilities
- **src/render.tsx**: Admin UI rendered with hono/jsx + Tailwind via CDN

### Configuration
- **wrangler.jsonc**: Cloudflare Workers configuration
- **tsconfig.json**: TypeScript configuration
- **.prettierrc**: Code formatting rules

---

## Environment Variables (wrangler.jsonc defaults)

| Variable | Default | Description |
|----------|---------|-------------|
| `AUTH_KEY` | ajielu | API request authentication |
| `HOME_ACCESS_KEY` | (hash) | Admin panel password |
| `FORWARD_CLIENT_KEY_ENABLED` | false | Pass-through client key mode |

---

## Development Notes

### Cloudflare Workers Specifics
- Uses ` DurableObject` class from `cloudflare:workers`
- SQLite via `this.ctx.storage.sql.exec()`
- Durable Object ID: `idFromName('loadbalancer')`
- Location hint: `wnam` (west North America)

### Admin API Authentication
- Uses `HOME_ACCESS_KEY` for admin endpoints (`/api/keys`, `/api/keys/check`)
- Authenticated via:
  - Cookie: `auth-key`
  - Header: `Authorization: Bearer <key>`

### Load Balancing Logic
1. Try to get key from `normal` group (ORDER BY RANDOM)
2. Fall back to `abnormal` group if no normal keys available
3. On 429 response, move key to abnormal group
4. Alarm runs every 5 minutes to check and restore keys

---

## Recommendations for Agentic Changes

1. **Before making changes**: Run `pnpm run dev` to test locally
2. **Type checking**: Run `npx tsc --noEmit` before committing
3. **Formatting**: Run `npx prettier --write` on changed files
4. **Deployment**: Use `pnpm run deploy` - requires Cloudflare authentication (`npx wrangler login`)
5. **Secrets**: Never commit secrets; use Cloudflare dashboard or `wrangler secret put`
