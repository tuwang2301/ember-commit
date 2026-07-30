import { createAppAuth } from '@octokit/auth-app';
import { Octokit } from '@octokit/rest';
import { getAppUrl, getGitHubAppConfig } from './config';

function createAuth() {
  const { appId, clientId, clientSecret, privateKey } = getGitHubAppConfig();
  if (!appId || !clientId || !clientSecret || !privateKey) {
    throw new Error('GitHub App credentials are not configured');
  }

  return createAppAuth({
    appId,
    privateKey,
    clientId,
    clientSecret,
  });
}

export async function exchangeOAuthCode(code: string): Promise<string> {
  const auth = createAuth();
  const result = await auth({ type: 'oauth-user', code });
  return result.token;
}

export async function getInstallationAccessToken(
  installationId: string | number
): Promise<string> {
  const auth = createAuth();
  const result = await auth({
    type: 'installation',
    installationId: Number(installationId),
  });
  return result.token;
}

export async function fetchGitHubUserProfile(accessToken: string) {
  const octokit = new Octokit({ auth: accessToken });
  const { data } = await octokit.rest.users.getAuthenticated();
  return data;
}

export async function listInstallationRepositories(installationId: string) {
  const token = await getInstallationAccessToken(installationId);
  const octokit = new Octokit({ auth: token });
  const { data } = await octokit.rest.apps.listReposAccessibleToInstallation({
    per_page: 100,
  });
  return data.repositories;
}

export function getOAuthAuthorizeUrl(state: string): string {
  const { clientId } = getGitHubAppConfig();
  const redirectUri = `${getAppUrl()}/api/auth/github/callback`;
  const params = new URLSearchParams({
    client_id: clientId!,
    redirect_uri: redirectUri,
    state,
  });
  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

export function getAppInstallUrl(state?: string): string {
  const { appSlug } = getGitHubAppConfig();
  if (!appSlug) {
    throw new Error('GITHUB_APP_SLUG is not configured');
  }
  const base = `https://github.com/apps/${appSlug}/installations/new`;
  if (!state) return base;
  return `${base}?${new URLSearchParams({ state }).toString()}`;
}

export async function createInstallationOctokit(installationId: string) {
  const token = await getInstallationAccessToken(installationId);
  return new Octokit({ auth: token });
}
