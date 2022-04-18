import { getExecOutput } from '@actions/exec'
import * as core from '@actions/core'

export const getLastGitTag = async(considerReleaseCandidates: boolean): Promise<string | null> => {
    try {
        core.startGroup('Getting last git tag')
        const { stdout: gitTagList, exitCode } = await getExecOutput(
            'git for-each-ref --sort=creatordate --format "%(refname)" refs/tags',
            [],
            { silent: true },
        )
        if (exitCode !== 0)
            throw Error
        const lastGitTag = gitTagList
            .split('\n')
            .filter(ref => considerReleaseCandidates ? ref : !ref.includes('-rc'))
            .reverse()[0]
            .split('/')
            .pop()
        if (lastGitTag === undefined)
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
        core.endGroup()
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

export const tagCommit = async(nextVersion: string, isReleaseCandidate: boolean): Promise<void | null> => {
    try {
        await setGitCommiter()
        core.startGroup(`Tagging ${isReleaseCandidate ? 'release candidate' : 'version'} ${nextVersion}`)
        const { exitCode: tagExitCode } = await getExecOutput(
            `git tag -a ${nextVersion}${isReleaseCandidate ? '-rc' : ''}`,
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
        core.error('Could not tag commit')
        return null
    }
}

export const deleteTag = async(tag: string): Promise<void | null> => {
    try {
        core.startGroup('Deleting tag')
        const { exitCode: deleteTagExitCode } = await getExecOutput(
            `git tag -d ${tag}`,
        )
        if (deleteTagExitCode !== 0)
            throw Error

        const { exitCode: pushExitCode } = await getExecOutput(
            `git push --delete origin ${tag}`,
        )
        if (pushExitCode !== 0)
            throw Error

        core.endGroup()
    }
    catch (e) {
        core.error('Could not delete tag')
        return null
    }
}
