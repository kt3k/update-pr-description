const github = require('@actions/github');
const core = require('@actions/core');

const run = async () => {
  const githubToken = core.getInput('github_token', { required: true });
  const prTitle = core.getInput('pr_title');
  const prBody = core.getInput('pr_body');
  const baseBranch = core.getInput('destination_branch');
  const sourceBranch = github.context.ref.replace(/^refs\/heads\//, '');

  const credentials = {
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
  };

  const octokit = github.getOctokit(githubToken);
  core.info(`Looking up a pull request with source branch="${sourceBranch || '<not found>'}" and base branch="${baseBranch || '<not specified>'}"`);

  const branchHead = `${credentials.owner}:${sourceBranch}`;
  const { data: pulls } = await octokit.rest.pulls.list({
    ...credentials,
    base: baseBranch,
    head: branchHead,
  });

  if (pulls.length === 0) {
    throw new Error(`No pull request found for source="${source || '<not found>'}" base=${baseBranch || '<not specified>'}`);
  }

  const pullRequest = pulls.find((p) => p.state === 'open');
  if (pullRequest == null) {
    throw new Error(`No open pull request found for source="${source || '<not found>'}" base=${baseBranch || '<not specified>'}`);
  }

  const { number: pullNumber } = pullRequest;
  core.info(`Found pull request #${pullNumber}`);

  const params = {
    ...credentials,
    pull_number: pullNumber,
  };

  if (prBody) {
    core.info(`Updating with body="${prBody}"`);
    params.body = prBody;
  }

  if (prTitle) {
    core.info(`Updating with title=#${prTitle}`);
    params.title = prTitle;
  }

  const url = `/repos/${credentials.owner}/${credentials.repo}/pulls/${pullNumber}`;

  core.info(`Making PATCH request to "${url}" with params ${JSON.stringify(params)}`);
  await octokit.request(`PATCH ${url}`, params);
};

run()
  .then(() => {
    core.info('Done.');
  })
  .catch((e) => {
    core.setFailed(e.stack || e.message);
  });
