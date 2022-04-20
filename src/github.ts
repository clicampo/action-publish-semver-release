import { getInput } from '@actions/core'
import { getOctokit } from '@actions/github'
import * as core from '@actions/core'
import type { Context } from '@actions/github/lib/context'
import { deleteTag } from './git'

export const createGithubRelease = async(
    context: Context,
    nextVersion: string,
    body: string,
    isReleaseCandidate: boolean,
) => {
    core.startGroup('Creating GitHub release')
    const githubToken = getInput('github-token') || process.env.GH_TOKEN
    if (githubToken === '' || githubToken === undefined)
        throw new Error('GitHub token is required')

    const client = getOctokit(githubToken).rest
    const version = isReleaseCandidate ? `${nextVersion}-rc` : nextVersion

    try {
        const {
            data: {
                html_url: releaseUrl,
            },
        } = await client.repos.createRelease(
            {
                repo: context.repo.repo,
                owner: context.repo.owner,
                tag_name: version,
                name: version,
                body,
                prerelease: isReleaseCandidate,
            },
        )
        core.info(`Created release at ${releaseUrl}`)
        core.endGroup()
        return releaseUrl
    }
    catch (e: any) {
        core.info('Could not create GitHub release')
        core.endGroup()
        await deleteTag(`${nextVersion}`)
        core.error(`${e.status} - ${e.message}`)
    }
}
