import { getExecOutput } from '@actions/exec'
import * as core from '@actions/core'

export const getLastGitTag = async(): Promise<string | null> => {
    try {
        core.startGroup('Getting last git tag')
        const { stdout: lastGitTag, exitCode } = await getExecOutput(
            'git describe --tags --abbrev=0',
            [],
            { silent: true },
        )
        if (exitCode !== 0)
            throw Error
        core.endGroup()
        return lastGitTag
    }
    catch (e) {
        core.error('Could not get last git tag')
        return null
    }
}

export const getLastCommitMessage = async(): Promise<string | null> => {
    try {
        core.startGroup('Getting last commit message')
        const { stdout: lastCommitMessage, exitCode } = await getExecOutput(
            'git log -1 --pretty=%B --no-merges',
            [],
            { silent: true },
        )
        if (exitCode !== 0)
            throw Error

        return lastCommitMessage
    }
    catch (e) {
        core.error('Could not get last commit message')
        return null
    }
}

export const tagReleaseCandidate = async(nextVersion: string): Promise<void | null> => {
    try {
        core.startGroup('Tagging release candidate')
        const { exitCode: tagExitCode } = await getExecOutput(
            `git tag -a ${nextVersion}-rc -m "Release candidate for ${nextVersion}"`,
        )
        if (tagExitCode !== 0)
            throw Error

        const { exitCode: pushExitCode } = await getExecOutput(
            'git push --tags',
        )
        if (pushExitCode !== 0)
            throw Error

        core.endGroup()
    }
    catch (e) {
        core.error('Could not tag release candidate')
        return null
    }
}
