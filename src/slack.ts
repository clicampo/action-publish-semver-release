import fetch from 'node-fetch'
import * as core from '@actions/core'

export const notifySlackChannel = async(webhookUrl: string, options: {
    projectName: string
    projectUrl: string
    productionActionUrl: string
    nextVersion: string
    changelog: string
    isReleaseCandidate: boolean
}) => {
    core.startGroup('Notifying Slack channel')
    const version = options.nextVersion + (options.isReleaseCandidate ? '-rc' : '')
    const summaryBlock = {
        type: 'section',
        text: {
            type: 'mrkdwn',
            text: `The project *<${options.projectUrl}|${options.projectName}>* has just released the version *${version}*!`,
        },
    }
    const changelogBlock = {
        type: 'section',
        text: {
            type: 'mrkdwn',
            text: options.changelog
                // replace headings with bold text
                .replace(/#+ ([^\n]+)/g, '*$1*')
                // replace links with slack link syntax
                .replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<$2|$1>')
                // replace - with →
                .replace(/\- /g, '→')
                // replace ** with *
                .replace(/\*\*([^\*]+)\*\*/g, '*$1*'),
        },
    }
    const payload = {
        blocks: [
            {
                type: 'header',
                text: {
                    type: 'plain_text',
                    text: ':rocket: New release!',
                    emoji: true,
                },
            },
            summaryBlock,
            changelogBlock,
            options.isReleaseCandidate && options.productionActionUrl
                ? {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: '_⚠️ This is a release candidate_',
                    },
                    accessory: {
                        type: 'button',
                        text: {
                            type: 'plain_text',
                            text: 'Deploy to production',
                            emoji: true,
                        },
                        value: 'n/a',
                        url: options.productionActionUrl,
                        action_id: 'n/a',
                    },
                }
                : undefined,
        ].filter(Boolean),
    }
    core.info(`Sending payload to Slack\n${JSON.stringify(payload, null, 4)}`)
    const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    })
    core.endGroup()
    return response
}
