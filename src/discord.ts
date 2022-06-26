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
        content: `**🔥 tá saindo do forninho a versão ${version}**\n${
            options.changelog
            // replace headings with bold text
                .replace(/#+ ([^\n]+)/g, '*$1*')
            // replace links with slack link syntax
                .replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<$2|$1>')
        }`,
        embeds: [] as any[],
        components: [] as any[],
    }
    payload.components.push({
        type: 1,
        components: [
            {
                type: 2,
                style: 5,
                label: 'Publicar em produção',
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
