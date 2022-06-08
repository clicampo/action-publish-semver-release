import * as core from '@actions/core'
export type ReleaseType = 'patch' | 'minor' | 'major'

export const getReleaseTypeFromCommitMessage = (commitMessage: string): ReleaseType | null => {
    if (/feat(\([^/)]+\))?!/.test(commitMessage))
        return 'major'
    if (/feat/.test(commitMessage))
        return 'minor'
    if (/fix/.test(commitMessage) || /chore/.test(commitMessage))
        return 'patch'
    return null
}

export const getNextVersion = (options: {
    currentVersion: string
    releaseType: ReleaseType
}): string => {
    // verify that the current version is valid semver
    if (options.currentVersion.match(/^\d+\.\d+\.\d+(-[\w\d]+)?$/) === null) {
        const errorMessage = `Invalid current version: ${options.currentVersion}`
        core.error(errorMessage)
        throw new Error(errorMessage)
    }

    const pureVersion = options.currentVersion.split('-')[0]
    const [major, minor, patch] = pureVersion.split('.').map(Number)
    return ({
        major: () => `${major + 1}.0.0`,
        minor: () => `${major}.${minor + 1}.0`,
        patch: () => `${major}.${minor}.${patch + 1}`,
    })[options.releaseType]()
}

export const getPureVersion = (version: string) => version.split('-')[0]
