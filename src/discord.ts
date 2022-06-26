import fetch from 'node-fetch'
import * as core from '@actions/core'

export const notifyDiscordChannel = async(webhookUrl: string, options: {
    projectName: string
    projectUrl: string
    productionActionUrl: string
    nextVersion: string
    changelog: string
    isReleaseCandidate: boolean
}) => {
    core.startGroup('Notifying Discord channel')
    const version = options.nextVersion + (options.isReleaseCandidate ? '-rc' : '')
    const payload = {
        username: '',
        avatar_url: '',
        content: `The project **${options.projectName}** has just released the version **${version}**!\n${
            options.changelog
            // replace headings with bold text
                .replace(/#+ ([^\n]+)/g, '**$1**')
            // replace links with discord link syntax
                .replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<$2|$1>')
                .replace(/\- /g, '→')

        }`,
        embeds: [] as any[],
        components: [] as any[],
    }
    payload.embeds.push({
        title: 'See project',
        url: options.projectUrl,
    })
    payload.embeds.push({
        title: 'Deploy to production',
        url: options.productionActionUrl,
    })
    payload.components.push({
        type: '1',
        components: [
            {
                type: 2,
                style: 5,
                label: 'See project',
                url: options.projectUrl,
            },
            {
                type: 2,
                style: 5,
                label: 'Deploy to production',
                url: options.productionActionUrl,
            },
        ],
    })

    core.info(`Sending payload to Discord\n${JSON.stringify(payload, null, 4)}`)
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
