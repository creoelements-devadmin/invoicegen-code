# Creo InvoiceGen

A React-based invoice generator application for Creo Elements.

## Deployment

This application is configured to be deployed to a subdirectory: `https://creo-elements.com/invoicegen/`.

### Configuration

The `vite.config.ts` file has been configured with the `base` property set to `/invoicegen/`. This ensures that all assets (JavaScript, CSS, images) are loaded correctly relative to this path.

```typescript
// vite.config.ts
export default defineConfig(({ mode }) => {
  // ...
  return {
    base: '/invoicegen/',
    // ...
  };
});
```

### Build and Deploy

To build the project for deployment:

1.  Run `npm run build`. This will generate the production files in the `dist` folder.
2.  The GitHub Actions workflow (`.github/workflows/deploy.yml`) is configured to automatically build and deploy the `dist` folder to the target repository (`creoelements-devadmin/invoicegen-compiled`) on push to the `main` branch.

### Troubleshooting

If you encounter 404 errors or MIME type issues (e.g., "Refused to apply style..."), ensure that:
1.  The `base` path in `vite.config.ts` matches the subdirectory where the app is hosted.
2.  The web server hosting the application is configured to serve the `index.html` for the `/invoicegen/` route (SPA fallback).
