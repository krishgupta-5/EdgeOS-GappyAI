import { Octokit } from '@octokit/rest';

export function getGithubClient(accessToken: string) {
  return new Octokit({
    auth: accessToken,
  });
}
