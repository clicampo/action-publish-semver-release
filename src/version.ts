export type ReleaseType = 'patch' | 'minor' | 'major'

export const getReleaseTypeFromCommitMessage = (commitMessage: string): ReleaseType | null => {
    if (/feat(\([^/)]+\))?!/.test(commitMessage))
        return 'major'
    if (/feat/.test(commitMessage))
        return 'minor'
    if (/fix/.test(commitMessage))
        return 'patch'
    return null
}

export const getNextVersion = (currentVersion: string, releaseType: ReleaseType): string => {
    const [major, minor, patch] = currentVersion.split('.').map(Number)
    return ({
        major: () => `${major + 1}.0.0`,
        minor: () => `${major}.${minor + 1}.0`,
        patch: () => `${major}.${minor}.${patch + 1}`,
    })[releaseType]()
}
