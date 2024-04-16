import { EmbedBuilder } from '@discordjs/builders';
import { BotActionResponse } from 'actions/types';
import {
    APIActionRowComponent,
    APIButtonComponent,
    InteractionEditReplyOptions,
    MessagePayload,
} from 'discord.js';

export function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

export function buildInteractionResponseBody(
    response: BotActionResponse,
): string | MessagePayload | InteractionEditReplyOptions {
    console.log(response);
    if (typeof response.message == 'string') return response.message;
    if (response.message instanceof EmbedBuilder) {
        response.message.setColor(response.success ? 0x0099ff : 0xff3333);
        return { embeds: [response.message] };
    }
    return {
        embeds: response.message.embeds,
        components: response.message.components.map(
            (c) => c.toJSON() as APIActionRowComponent<APIButtonComponent>,
        ),
    };
}
