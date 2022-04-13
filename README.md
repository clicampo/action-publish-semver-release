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
      - uses: actions/checkout@v3
      - uses: clicampo/action-publish-semver-release@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
```
