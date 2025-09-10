# Angular Environment Configuration Best Practices

## Overview
This guide covers the best practices for managing environment variables in Angular applications, especially for sensitive data like API keys.

## Option 1: Build-Time File Replacement (Recommended)

### Setup:
1. Create environment-specific files:
   - `environment.ts` (default/development)
   - `environment.prod.ts` (production)
   - `environment.local.ts` (local development with secrets)

2. Configure `angular.json` with file replacements (already configured)

### Usage:
```bash
# Development (default environment.ts)
ng serve

# Local development with API keys
ng serve --configuration=local

# Production build
ng build --configuration=production
```

### Security:
- Add `environment.local.ts` to `.gitignore`
- Never commit real API keys to version control
- Use placeholder values in committed environment files

## Option 2: Runtime Configuration (Advanced)

For applications that need dynamic configuration:

### Create a config service:
```typescript
// config.service.ts
@Injectable({ providedIn: 'root' })
export class ConfigService {
  private config: any;

  async loadConfig(): Promise<void> {
    const response = await fetch('/assets/config.json');
    this.config = await response.json();
  }

  get(key: string): any {
    return this.config?.[key];
  }
}
```

### Load config at app startup:
```typescript
// app.module.ts
export function configFactory(configService: ConfigService) {
  return () => configService.loadConfig();
}

@NgModule({
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: configFactory,
      deps: [ConfigService],
      multi: true
    }
  ]
})
export class AppModule {}
```

## Option 3: Docker Environment Variables (Production)

For containerized deployments:

### Dockerfile:
```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG PUBG_API_KEY
RUN PUBG_API_KEY=$PUBG_API_KEY npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
```

### Build with secrets:
```bash
docker build --build-arg PUBG_API_KEY=your-key-here -t dinnr-app .
```

## Current Project Setup

### Files Created:
- `environment.local.ts` - For local development with real API keys
- Updated `angular.json` - Added local configuration

### Commands:
```bash
# Development without API key
npm run start

# Development with API key (after setting up environment.local.ts)
ng serve --configuration=local

# Production build
ng build --configuration=production
```

### Security Checklist:
- [ ] Add `environment.local.ts` to `.gitignore`
- [ ] Never commit real API keys
- [ ] Use CI/CD variables for production builds
- [ ] Consider using Azure Key Vault, AWS Secrets Manager, or similar for production

## Recommended Approach for This Project:

1. **Development**: Use `environment.local.ts` with your real PUBG API key
2. **Production**: Use CI/CD pipeline to inject API key during build
3. **Version Control**: Only commit files with placeholder values

### Example environment.local.ts:
```typescript
export const environment = {
  production: false,
  pubgApiKey: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...', // Your real API key
  apiBaseUrl: 'https://api.pubg.com',
  cacheTtl: 3600000,
  shard: 'pc-na'
};
```

## Next Steps:
1. Create `environment.local.ts` with your PUBG API key
2. Add it to `.gitignore`
3. Use `ng serve --configuration=local` for development
4. Set up CI/CD for production deployments
