const github = require("@actions/github");
const core = require("@actions/core");

async function run() {
  const inputs = {
    githubToken: core.getInput("github_token", { required: true }),
    prTitle: core.getInput("pr_title"),
    prBody: core.getInput("pr_body"),
    destinationBranch: core.getInput("destination_branch")
  };

  const base = inputs.destinationBranch;
  const source = github.context.ref.replace(/^refs\/heads\//, "");

  const octokit = new github.GitHub(inputs.githubToken);

  core.info(`Look up a pull request with source=${source} base=${base}`);
  const { data: pulls } = await octokit.pulls.list({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    base,
    head: `${github.context.repo.owner}:${source}`
  });

  if (pulls.length == 0) {
    core.info(`No such pull request: source=${source} base=${base}`);
    return;
  }

  const { number } = pulls[0];
  core.info(`Found pull request #${number}`);

  const params = {
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    pull_number: number
  };

  if (inputs.prBody) {
    core.info(`Updating with body=${inputs.prBody}`);
    params.body = inputs.prBody;
  }
  if (inputs.prTitle) {
    core.info(`Updating with title=#${inputs.prTitle}`);
    params.title = inputs.prTitle;
  }
  await octokit.pulls.update(params);
}

run();
