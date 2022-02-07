import { Presence, TextChannel } from 'discord.js';
const playingLeague = (el) => el.name.toLowerCase() == `league of legends` && el.type == 'PLAYING';
const leagueRole = (el) => el.name.toLowerCase() == 'league player';
export default async function PresenceUpdate(oldPresence: Presence, newPresence: Presence) {
    let wasPlayingLeague = oldPresence.activities.find(playingLeague);
    let isPlayingLeague = newPresence.activities.find(playingLeague);
    let leaguePlayerRole = newPresence.member.guild.roles.cache.find(leagueRole);
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
