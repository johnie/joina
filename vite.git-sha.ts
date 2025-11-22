import { execSync } from 'node:child_process';
import type { Plugin } from 'vite';
import pkg from './package.json';

export type GitShaPluginOptions = {
  branchName?: string;
};

const GIT_PREFIX_REGEX = /^git\+/;
const GIT_SUFFIX_REGEX = /\.git$/;

function getRepoUrl(): string | null {
  let url = pkg.repository?.url;
  if (!url) {
    return null;
  }
  url = url.replace(GIT_PREFIX_REGEX, '').replace(GIT_SUFFIX_REGEX, '');
  if (url.startsWith('git@github.com:')) {
    url = url.replace('git@github.com:', 'https://github.com/');
  }
  return url;
}

export default function gitShaPlugin(
  options: GitShaPluginOptions = {}
): Plugin {
  const branchName = options.branchName || 'main';
  const repoUrl = getRepoUrl();

  let sha = '';
  let shaUrl = repoUrl ? `${repoUrl}/tree/${branchName}` : '';

  try {
    sha = execSync('git rev-parse --short HEAD').toString().trim();
    if (sha && repoUrl) {
      shaUrl = `${repoUrl}/commit/${sha}`;
    }
  } catch {
    sha = branchName;
  }

  return {
    name: 'vite-plugin-git-sha',
    config() {
      return {
        define: {
          'import.meta.env.VITE_GIT_SHA': JSON.stringify(sha),
          'import.meta.env.VITE_GIT_SHA_URL': JSON.stringify(shaUrl),
        },
      };
    },
  };
}
