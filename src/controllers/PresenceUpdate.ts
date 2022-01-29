import { Presence, TextChannel } from 'discord.js';

export default async function PresenceUpdate(oldPresence: Presence, newPresence: Presence) {
    let wasPlayingLeague = oldPresence.activities.find(
        (el) => el.name.toLowerCase() == `league of legends` && el.type == 'PLAYING',
    );
    let isPlayingLeague = newPresence.activities.find(
        (el) => el.name.toLowerCase() == `league of legends` && el.type == 'PLAYING',
    );
    let leaguePlayerRole = newPresence.member.guild.roles.cache.find(
        (el) => el.name.toLowerCase() == 'league player',
    );
    if (isPlayingLeague && !wasPlayingLeague) {
        (
            newPresence.member.guild.channels.cache
                .filter((el) => el.type == 'GUILD_TEXT')
                .first() as TextChannel
        ).send(`NOOB STOP PLAYING LEAGUE OF LEGENDS <@${oldPresence.user.id}> `);
        if (leaguePlayerRole) {
            newPresence.member.roles.add(leaguePlayerRole);
            // newPresence.member.voice.setMute(true, 'League player');
        }
    } else if (!isPlayingLeague && wasPlayingLeague) {
        if (leaguePlayerRole) {
            newPresence.member.roles.remove(leaguePlayerRole);
        }
    }

    console.log(isPlayingLeague, wasPlayingLeague);
}
