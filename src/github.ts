import { getInput } from '@actions/core'
import { getOctokit } from '@actions/github'
import * as core from '@actions/core'
import type { Context } from '@actions/github/lib/context'

export const createGithubRelease = async(context: Context, nextVersion: string, body: string) => {
    const githubToken = getInput('github-token') || process.env.GH_TOKEN
    if (githubToken === '' || githubToken === undefined)
        throw new Error('GitHub token is required')

    const client = getOctokit(githubToken).rest

    try {
        const {
            data: {
                url: releaseUrl,
            },
        } = await client.repos.createRelease(
            {
                repo: context.repo.owner,
                owner: context.repo.repo,
                tag_name: nextVersion,
                name: nextVersion,
                body,
                prerelease: true,
            },
        )
        return releaseUrl
    }
    catch (e: any) {
        core.error(e.message)
    }
}
