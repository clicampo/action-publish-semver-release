import { getInput } from '@actions/core'
import { getExecOutput } from '@actions/exec'
import { getOctokit } from '@actions/github'
import type { Context } from '@actions/github/lib/context'

const run = async(command: string) => (await getExecOutput(command)).stdout

export const generateChangelog = async(context: Context) => {
    const githubToken = getInput('github-token') || process.env.GH_TOKEN
    if (githubToken === '' || githubToken === undefined)
        throw new Error('GitHub token is required')

    const github = getOctokit(githubToken).rest

    // get the sha of the last tagged commit
    const lastTag = await run('git describe --tags --abbrev=0')
    const lastTaggedCommitSha = await run(`git rev-list -n 1 ${lastTag}`)

    const { data: commits } = await github.repos.listCommits({
        owner: context.repo.owner,
        repo: context.repo.repo,
    })

    // Get all commits since last tag
    const lastCommits = []
    for (const commit of commits) {
        if (commit.sha === lastTaggedCommitSha)
            break
        lastCommits.push(commit)
    }

    return lastCommits.map(commit => `- ${commit.commit.message}`).join('\n')
}
