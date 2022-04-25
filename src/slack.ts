import fetch from 'node-fetch'

export const notifySlackChannel = async(webhookUrl: string, options: { projectName: string; nextVersion: string; changelog: string; isReleaseCandidate: boolean }) => {
    const version = options.nextVersion + (options.isReleaseCandidate ? '-rc' : '')
    const summaryBlock = {
        type: 'section',
        text: {
            type: 'mrkdwn',
            text: `The project **${options.projectName}** has just released the version **${version}**!`,
        },
    }
    const changelogBlock = {
        type: 'section',
        text: {
            type: 'mrkdwn',
            text: options.changelog.replace(/#+ ([^\n]+)/g, '**$1**'),
        },
    }
    const payload = {
        blocks: [
            {
                type: 'header',
                text: {
                    type: 'plain_text',
                    text: 'New release!',
                    emoji: true,
                },
            },
            summaryBlock,
            changelogBlock,
            options.isReleaseCandidate
                ? {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: '⚠️ This is a release candidate',
                    },
                    accessory: {
                        type: 'button',
                        text: {
                            type: 'plain_text',
                            text: 'Deploy to production',
                            emoji: true,
                        },
                        value: 'n/a',
                        url: 'https://google.com',
                        action_id: 'n/a',
                    },
                }
                : undefined,
        ].filter(Boolean),
    }
    const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    })
    return response
}
