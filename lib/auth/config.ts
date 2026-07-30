export function getAppUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
  }
  if (process.env.APP_URL) {
    return process.env.APP_URL.replace(/\/$/, '');
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'http://localhost:3000';
}

export function getGitHubAppConfig() {
  const appId = process.env.GITHUB_APP_ID;
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  const privateKey = process.env.GITHUB_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const appSlug = process.env.GITHUB_APP_SLUG;

  return { appId, clientId, clientSecret, privateKey, appSlug };
}

export function isGitHubAppConfigured(): boolean {
  const { appId, clientId, clientSecret, privateKey } = getGitHubAppConfig();
  return Boolean(
    appId &&
      clientId &&
      clientSecret &&
      privateKey &&
      appId !== 'mock_app_id' &&
      clientId !== 'mock_client_id'
  );
}
