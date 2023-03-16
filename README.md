# Update Pull Request Description on Push

This github action updates the description (and/or title) of the PR by the given source and destination branches.

# Usage

This action doesn't create a PR, but updates it. We recommend you should use this github action with [repo-sync/pull-request][]

```yml
name: Creates and Updates PR
on:
  push:
    branches:
    - some-branch
jobs:
  pull-request:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: pull-request
      uses: repo-sync/pull-request@v2
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
    - name: update-pull-request
      uses: kt3k/update-pr-description@v2
      with:
        pr_body: "**some description**"
        github_token: ${{ secrets.GITHUB_TOKEN }}
```

[repo-sync/pull-request][] creates a PR, but the action doesn't update it if the PR already exists. If you need to update the description of the PR on each push, you can use this action for it.

## Our use case

We creates a pull request from `master` to `release` and update the description on each push on `master`. Merging to release branch causes the actual release to the staging environment. So this github workflow works as the release preparation and we can see what is going to be released at the next release by seeing this pull request.

```yml
name: Creates and Updates PR
on:
  push:
    branches:
    - master
jobs:
  pull-request:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: create-description
      run: "some script for creating PR description from the branch diff"
      id: description
    - name: pull-request
      uses: repo-sync/pull-request@v2
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        destination_branch: release
        pr_title: Release
    - name: update-pull-request
      uses: kt3k/update-pr-description@v2
      with:
        pr_body: ${{ steps.description.outputs.description }}
        destination_branch: release
        github_token: ${{ secrets.GITHUB_TOKEN }}
```

# Parameters

## Inputs

### `github_token`

The GITHUB_TOKEN secret. This is required.

### `pr_title`

The title of the PR. Optional.

### `pr_body`

The body of the PR

### `destination_branch`

Base branch of the PR. Default is master.

### `fail_on_error`

Option to mark the job as failed in case there are errors during the action execution. Default is 'true'.

## Outputs

This action has no outputs.

# LICENSE

Apache License, Version 2.0

[repo-sync/pull-request]: https://github.com/repo-sync/pull-request
