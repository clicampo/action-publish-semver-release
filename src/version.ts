import * as core from '@actions/core'
export type ReleaseType = 'patch' | 'minor' | 'major' | 'non-release'

export const getReleaseTypeFromCommitMessage = (commitMessage: string): ReleaseType | null => {
    if (/^feat(\([^/)]+\))?!/.test(commitMessage))
        return 'major'
    if (/^feat/.test(commitMessage))
        return 'minor'
    if (/^fix/.test(commitMessage))
        return 'patch'
    if (/^chore/.test(commitMessage) || /^ci/.test(commitMessage) || /^build/.test(commitMessage))
        return 'non-release'
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
        'major': () => `${major + 1}.0.0`,
        'minor': () => `${major}.${minor + 1}.0`,
        'patch': () => `${major}.${minor}.${patch + 1}`,
        'non-release': () => pureVersion,
    })[options.releaseType]()
}

export const getPureVersion = (version: string) => version.split('-')[0]
