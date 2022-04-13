<div align="center">

<h1>Publish SemVer Release</h1>

<sup><strong>GitHub Action</strong></sup>

</div>


## Usage

```yaml
# .github/workflows/release-semver.yaml
name: Publish SemVer release
on:
  pull_request:
    branches:
      - main

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      # This is necessary so our action has access to the entire git history
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
      - uses: clicampo/action-publish-semver-release@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
```
