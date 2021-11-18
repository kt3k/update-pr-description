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
  core.info(`Looking up a pull request with a source branch "${sourceBranch || '<not found>'}" and a base branch "${baseBranch || '<not specified>'}"`);

  const branchHead = `${credentials.owner}:${sourceBranch}`;
  const { data: pulls } = await octokit.rest.pulls.list({
    ...credentials,
    base: baseBranch,
    head: branchHead,
  });

  if (pulls.length === 0) {
    throw new Error(`No pull request found for a source branch "${sourceBranch || '<not found>'}" and a base branch "${baseBranch || '<not specified>'}"`);
  }

  const pullRequest = pulls.find((p) => p.state === 'open');
  if (pullRequest == null) {
    throw new Error(`No open pull requests found for a source branch "${sourceBranch || '<not found>'}" and a base branch "${baseBranch || '<not specified>'}"`);
  }

  const { number: pullNumber, base: { ref: pullRequestTargetBranch } } = pullRequest;
  core.info(`Pull request #${pullNumber} has been found for  a source branch "${sourceBranch || '<not found>'}" and a base branch "${baseBranch || '<not specified>'}"`);

  const params = {
    ...credentials,
    pull_number: pullNumber,
  };

  if (prTitle) {
    core.info(`Pull request #${pullNumber}'s title will be set to "${prTitle}"`);
    params.title = prTitle;
  }

  if (prBody) {
    core.info(`Pull request #${pullNumber}'s body will be set to "${prBody}"`);
    params.body = prBody;
  }

  if (baseBranch && baseBranch !== pullRequestTargetBranch) {
    core.info(`Pull request #${pullNumber}'s base branch will be set to "${baseBranch}"`);
    params.title = prTitle;
  }

  const url = `/repos/${credentials.owner}/${credentials.repo}/pulls/${pullNumber}`;

  core.info(`Making a PATCH request to "${url}" with params "${JSON.stringify(params)}"`);
  await octokit.request(`PATCH ${url}`, params);
};

run()
  .then(() => {
    core.info('Done.');
  })
  .catch((e) => {
    core.error('Cannot update the pull request.');
    core.setFailed(e.stack || e.message);
  });
