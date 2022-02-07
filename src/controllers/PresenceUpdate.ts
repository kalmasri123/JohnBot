import { Presence, TextChannel } from 'discord.js';
const playingLeague = (el) => el.name.toLowerCase() == `league of legends` && el.type == 'PLAYING';
const findRole = (el) => el.name.toLowerCase() == 'league player';
export default async function PresenceUpdate(oldPresence: Presence, newPresence: Presence) {
    const wasPlayingLeague = oldPresence.activities.find(playingLeague);
    const isPlayingLeague = newPresence.activities.find(playingLeague);
    const leaguePlayerRole = newPresence.member.guild.roles.cache.find(findRole);
    const member = newPresence.member;
    if (isPlayingLeague && !wasPlayingLeague) {
        (
            newPresence.member.guild.channels.cache
                .filter((el) => el.type == 'GUILD_TEXT')
                .first() as TextChannel
        ).send(`NOOB STOP PLAYING LEAGUE OF LEGENDS <@${oldPresence.user.id}> `);
        if (leaguePlayerRole) {
            member.roles.add(leaguePlayerRole);
            // newPresence.member.voice.setMute(true, 'League player');
        }
    } else if (!isPlayingLeague && wasPlayingLeague) {
        if (leaguePlayerRole) {
            member.roles.remove(leaguePlayerRole);
        }
    }
}
