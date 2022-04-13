import * as core from '@actions/core'
import { context } from '@actions/github'
import { generateChangelog } from './changelog'
import { getLastCommitMessage, getLastGitTag } from './git'
import { getNextVersion, getReleaseTypeFromCommitMessage } from './version'

async function run(): Promise<void> {
    try {
        const lastVersion = await getLastGitTag()
        if (lastVersion === null)
            return core.setFailed('Could not get last git tag')

        const lastCommitMessage = await getLastCommitMessage()
        if (lastCommitMessage === null)
            return core.setFailed('Could not get last commit message')
        core.info(`Last commit message: ${lastCommitMessage}`)

        const releaseType = getReleaseTypeFromCommitMessage(lastCommitMessage)
        core.info(`Release type: ${releaseType}`)

        if (releaseType !== null) {
            const nextVersion = getNextVersion(lastVersion, releaseType)
            core.info(`Publishing a release candidate for version ${nextVersion}`)

            const changelog = await generateChangelog(context)
            core.info(changelog)
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
