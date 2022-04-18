import * as core from '@actions/core'
import { context } from '@actions/github'
import { generateChangelog } from './changelog'
import { getLastCommitMessage, getLastGitTag, tagReleaseCandidate } from './git'
import { createGithubRelease } from './github'
import { getNextVersion, getReleaseTypeFromCommitMessage } from './version'

async function run(): Promise<void> {
    try {
        const lastVersion = await getLastGitTag()
        if (lastVersion === null)
            return

        const lastCommitMessage = await getLastCommitMessage()
        if (lastCommitMessage === null)
            return

        const releaseType = getReleaseTypeFromCommitMessage(lastCommitMessage)

        // If the commit isn't of type `feat` or `fix`, we don't want to bump the version
        if (releaseType !== null) {
            const nextVersion = getNextVersion(lastVersion, releaseType)
            core.info(`Publishing a release candidate for version ${nextVersion}`)

            core.startGroup('Generating changelog')
            const changelog = await generateChangelog(context)
            core.info(changelog)
            core.endGroup()

            // Tag commit with the next version release candidate
            await tagReleaseCandidate(nextVersion)

            await createGithubRelease(context, `${nextVersion}-rc`, changelog)

            core.setOutput('next-version', nextVersion)
            core.setOutput('release-type', releaseType)
        }
        else {
            core.info('✅ No new releases to be published!')
        }
    }
    catch (error) {
        if (error instanceof Error)
            core.setFailed(error.message)
    }
}

run()
