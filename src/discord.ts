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
        content: '**🔥 tá saindo do forninho versão nova**',
        embeds: [] as any[],
        components: [] as any[],
    }
    payload.embeds.push({
        title: options.projectName,
        color: 16711756,
        description: options.changelog
            // replace headings with bold text
            .replace(/#+ ([^\n]+)/g, '*$1*')
            // replace links with slack link syntax
            .replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<$2|$1>')
            // replace - with →
            .replace(/\- /g, '→')
            // replace ** with *
            .replace(/\*\*([^\*]+)\*\*/g, '*$1*'),
        timestamp: '',
        author: {
            name: `↳ ${version}`,
            url: options.projectUrl,
        },
        image: {},
        thumbnail: {},
        footer: {},
        fields: [],
    })
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
