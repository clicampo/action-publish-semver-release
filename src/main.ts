import * as core from '@actions/core'
import { context } from '@actions/github'
import { generateChangelog } from './changelog'
import { notifyDiscordChannel } from './discord'
import { getLastCommitMessage, getLastGitTag, tagCommit } from './git'
import { createGithubRelease } from './github'
import { notifySlackChannel } from './slack'
import { getNextVersion, getPureVersion, getReleaseTypeFromCommitMessage } from './version'

async function run(): Promise<void> {
    const isReleaseCandidate = core.getInput('release-candidate') === 'true'
    const slackWebhookUrl = core.getInput('slack-webhook-url')
    const discordWebhookUrl = core.getInput('discord-webhook-url')

    try {
        const currentVersion = await getLastGitTag({
            considerReleaseCandidates: true,
            logInGroup: true,
        })
        if (currentVersion === null)
            return

        const lastCommitMessage = await getLastCommitMessage()
        if (lastCommitMessage === null)
            return

        const releaseType = getReleaseTypeFromCommitMessage(lastCommitMessage)

        // If the commit isn't of type `feat` or `fix`, we don't want to bump the version
        if (releaseType !== null) {
            const nextVersion = isReleaseCandidate
                ? getNextVersion({ currentVersion, releaseType })
                : (
                    currentVersion.match(/rc$/)
                        ? getPureVersion(currentVersion)
                        : getNextVersion({ currentVersion, releaseType })
                )
            core.info(`Publishing a release candidate for version ${nextVersion}`)

            const changelog = await generateChangelog(context)

            await tagCommit(nextVersion, isReleaseCandidate)

            await createGithubRelease(context, nextVersion, changelog, isReleaseCandidate)

            if (slackWebhookUrl !== '') {
                await notifySlackChannel(slackWebhookUrl, {
                    projectName: context.repo.repo,
                    projectUrl: core.getInput('project-url'),
                    productionActionUrl: core.getInput('production-action-url'),
                    nextVersion,
                    changelog,
                    isReleaseCandidate,
                })
            }
            if (discordWebhookUrl !== '') {
                await notifyDiscordChannel(discordWebhookUrl, {
                    projectName: context.repo.repo,
                    projectUrl: core.getInput('project-url'),
                    productionActionUrl: core.getInput('production-action-url'),
                    nextVersion,
                    changelog,
                    isReleaseCandidate,
                })
            }

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
