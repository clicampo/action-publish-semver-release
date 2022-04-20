import { getInput } from '@actions/core'
import { getExecOutput } from '@actions/exec'
import { getOctokit } from '@actions/github'
import type { Context } from '@actions/github/lib/context'
import * as core from '@actions/core'
import { getLastGitTag } from './git'
import type { ReleaseType } from './version'
import { getReleaseTypeFromCommitMessage } from './version'

type CommitsByReleaseType = Record<ReleaseType, { message: string; url: string; author: string }[]>
type CommitList = Awaited<
ReturnType<
ReturnType<typeof getOctokit>['rest']['repos']['listCommits']
>
>['data']

const run = async(command: string) => (await getExecOutput(command)).stdout

const getLastCommits = async(context: Context, considerReleaseCandidates: boolean) => {
    const githubToken = getInput('github-token') || process.env.GH_TOKEN
    if (githubToken === '' || githubToken === undefined)
        throw new Error('GitHub token is required')

    const github = getOctokit(githubToken).rest

    // get the sha of the last tagged commit
    const lastTag = await getLastGitTag(considerReleaseCandidates)
    const lastTaggedCommitSha = await run(`git rev-list -n 1 ${lastTag}`)
    const lastTaggedCommitDate = await run(`git show -s --format=%ci ${lastTaggedCommitSha}`)
    core.info(`Getting commits since ${lastTaggedCommitDate} [${lastTag}](${lastTaggedCommitSha})`)

    const { data: commits } = await github.repos.listCommits({
        owner: context.repo.owner,
        repo: context.repo.repo,
        since: lastTaggedCommitDate,
    })

    const commitsSortedByDateDesc = commits.sort((a, b) => {
        const aDate = new Date(String(a.commit.author?.date))
        const bDate = new Date(String(b.commit.author?.date))
        return bDate.getTime() - aDate.getTime()
    })
    const lastCommits = []
    for (const commit of commitsSortedByDateDesc) {
        if (commit.sha === lastTaggedCommitSha)
            break
        lastCommits.push(commit)
    }

    return lastCommits
}

const groupCommitsByReleaseType = (commits: CommitList) => {
    return commits
        .map((commit) => {
            const { html_url: url } = commit
            const { message, author } = commit.commit
            const type = getReleaseTypeFromCommitMessage(message)
            return { message, type, url, author: String(author?.name) }
        })
        .reduce((commitsByType, commit) => {
            if (commit.type === null)
                return commitsByType
            if (!(commit.type in commitsByType))
                commitsByType[commit.type] = []
            commitsByType[commit.type].push(commit)
            return commitsByType
        }, {} as (CommitsByReleaseType))
}

const formatCommitsByType = (commitsByType: CommitsByReleaseType) => {
    let changelog = ''
    const getCommitInfo = (commit: { message: string; url: string; author: string }) => {
        const message = commit.message.split(':')[1].split('\n').shift()?.trim()
        const scope = commit.message.match(/\(([^/)]+)\):/)?.[1] ?? ''
        const commitSha = commit.url.split('/').pop()?.slice(0, 8)
        return { message, scope, commitSha }
    }
    if (commitsByType.major) {
        changelog += `${[
            '## ⚠️ This release introduces breaking changes',
            '### Features',
        ].join('\n')}\n`
    }
    if (commitsByType.minor) {
        if (!commitsByType.major)
            changelog += '\n### Features\n'

        const featureCommits = [
            ...(commitsByType.major || []),
            ...(commitsByType.minor || []),
        ]
        for (const commit of featureCommits) {
            const { message, scope, commitSha } = getCommitInfo(commit)
            changelog += `- ${scope ? `**(${scope})**` : ''} ${message} ([${commitSha}](${commit.url}))\n`
        }
    }
    if (commitsByType.patch) {
        changelog += '\n### Bug Fixes\n'
        for (const commit of commitsByType.patch) {
            const { message, scope, commitSha } = getCommitInfo(commit)
            changelog += `- ${scope ? `**(${scope})**` : ''} ${message} ([${commitSha}](${commit.url}))\n`
        }
    }

    return changelog
}

export const generateChangelog = async(context: Context, considerReleaseCandidates: boolean) => {
    core.startGroup('Generating changelog')
    const lastCommits = await getLastCommits(context, considerReleaseCandidates)
    const commitsByType = groupCommitsByReleaseType(lastCommits)
    const formattedChangelog = formatCommitsByType(commitsByType)
    core.endGroup()
    return formattedChangelog
}
