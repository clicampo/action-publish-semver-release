# Publish SemVer release

## Examples
### Staging
```yaml
name: Deploy to staging
on:
  push:
    branches:
      - main

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          # This is necessary
          fetch-depth: 0
      - uses: clicampo/action-publish-semver-release@v1
        with:
          github-token: ${{ secrets.AUTH_TOKEN }}
          git-committer-name: Release bot
          git-committer-email: release@bot.com
          slack-webhook-url: ${{ secrets.SLACK_WEBHOOK_URL }}
          project-url: ${{ github.server_url }}/${{ github.repository }}
          production-action-url: ${{ github.server_url }}/${{ github.repository }}/actions/workflows/release-prod.yml
```
### Production
```yaml
name: Deploy to production
on:
  workflow_dispatch:
    
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          # This is necessary
          fetch-depth: 0
      - uses: clicampo/action-publish-semver-release@v1
        id: publish-semver
        with:
          github-token: ${{ secrets.AUTH_TOKEN }}
          git-committer-name: Release bot
          git-committer-email: release@bot.com
          release-candidate: 'false'
          slack-webhook-url: ${{ secrets.SLACK_WEBHOOK_URL }}
          project-url: ${{ github.server_url }}/${{ github.repository }}
      - run: echo "Releasing version ${{ steps.publish-semver.outputs.next-version }}"
```
