const github = require('@actions/github');
const core = require('@actions/core');

async function run() {
  // This should be a token with access to your repository scoped in as a secret.
  // The YML workflow will need to set myToken with the GitHub Secret Token
  // myToken: ${{ secrets.GITHUB_TOKEN }}
  // https://help.github.com/en/articles/virtual-environments-for-github-actions#github_token-secret
  const inputs = {
    token: core.getInput('token', { required: true }),
    title: core.getInput('title'),
    body: core.getInput('body'),
    base: core.getInput('base'),
  }
  console.log(github)

  const source = github.context.ref.replace(/^refs\/heads\//, '')

  const octokit = new github.GitHub(inputs.token);

  const { data: pulls } = await octokit.pulls.list({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    base: inputs.base,
    head: `${github.context.repo.owner}:${source}`
  });

  if (pulls.length == 0) {
    core.info(`no such pr: source=${source} base=${base}`)
    return
  }

  const { number } = pulls[0]

  const params = {
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    pull_number: number,
  }

  if (inputs.body) {
    params.body = inputs.body
  }
  if (inputs.title) {
    params.title = inputs.title
  }
  await octokit.pulls.update(params)
}

run();
