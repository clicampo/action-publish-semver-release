import { getExecOutput } from '@actions/exec'

export const getLastGitTag = async(): Promise<string | null> => {
    try {
        const { stdout: lastGitTag, exitCode } = await getExecOutput(
            'git describe --tags --abbrev=0',
        )
        if (exitCode !== 0)
            return null
        return lastGitTag
    }
    catch (e) {
        return null
    }
}

export const getLastCommitMessage = async(): Promise<string | null> => {
    try {
        const { stdout: lastCommitMessage, exitCode } = await getExecOutput(
            'git log -1 --pretty=%B --no-merges',
        )
        if (exitCode !== 0)
            return null
        return lastCommitMessage
    }
    catch (e) {
        return null
    }
}
