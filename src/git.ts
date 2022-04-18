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

const setGitCommiter = async(): Promise<void> => {
    try {
        const name = core.getInput('git-committer-name')
        const email = core.getInput('git-committer-email')
        if (name === '' || email === '')
            throw new Error('Git committer name and email are required')

        core.startGroup('Setting git commiter identity')
        const { exitCode: exitCodeName } = await getExecOutput(
            `git config --global user.name "${name}"`,
            [],
            { silent: true },
        )
        if (exitCodeName !== 0)
            throw new Error('Could not set git commiter name')

        const { exitCode: exitCodeEmail } = await getExecOutput(
            `git config --global user.email "${email}"`,
            [],
            { silent: true },
        )
        if (exitCodeEmail !== 0)
            throw new Error('Could not set git commiter email')

        core.endGroup()
    }
    catch (e: any) {
        core.error(`Could not set git commiter identity\n${e.message}`)
    }
}

export const tagReleaseCandidate = async(nextVersion: string): Promise<void | null> => {
    try {
        core.startGroup('Tagging release candidate')

        await setGitCommiter()
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
