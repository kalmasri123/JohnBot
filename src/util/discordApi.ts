import { NextFunction, Request, Response } from 'express';
import fetch from 'node-fetch';
export interface TokenSet {
    accessToken: string;
    refreshToken: string;
    expirationDate: number;
}
export interface DiscordUser {
    id: string;
    username: string;
    avatar: string;
    discriminator: string;
    public_flags: number;
    flags: number;
    banner: object;
    banner_color: string;
    accent_color: number;
    locale: string;
    mfa_enabled: boolean;
    premium_type: number;
}
export function setCookies(tokens: TokenSet, res: Response) {
    res.cookie('accessToken', tokens.accessToken, {
        secure: process.env.NODE_ENV !== 'development',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    res.cookie('refreshToken', tokens.refreshToken, {
        secure: process.env.NODE_ENV !== 'development',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 90,
    });
    res.cookie('authMethod', 'discord', {
        secure: process.env.NODE_ENV !== 'development',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 90,
    });
}
export const refreshAccessToken = async (refreshToken: string): Promise<TokenSet> => {
    const { CLIENT_ID, DISCORD_REDIRECT_URI, DISCORD_CLIENT_SECRET } = process.env;

    const grant_type = 'refresh_token';
    const params = new URLSearchParams();

    params.append('client_id', CLIENT_ID);
    params.append('client_secret', DISCORD_CLIENT_SECRET);
    params.append('grant_type', grant_type);
    params.append('refresh_token', refreshToken);

    const res = await fetch('https://discord.com/api/v9/oauth2/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json',
        },
        body: params,
    });
    if (res.ok) {
        const tokens = (await res.json()) as any;
        const expirationDate = Date.now() + tokens.expires_in * 1000;

        return {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expirationDate,
        };
    } else {
        throw new Error('Error Refreshing:' + JSON.stringify(await res.json()));
    }
};
export const getTokenPairFromCode = async (code: string): Promise<TokenSet> => {
    const { CLIENT_ID, DISCORD_REDIRECT_URI, DISCORD_CLIENT_SECRET } = process.env;
    console.log(DISCORD_REDIRECT_URI);
    const params = new URLSearchParams();
    params.append('client_id', CLIENT_ID);
    params.append('client_secret', DISCORD_CLIENT_SECRET);
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', DISCORD_REDIRECT_URI);
    const res = await fetch('https://discord.com/api/v9/oauth2/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json',
        },
        body: params,
    });

    if (res.ok) {
        const tokens = (await res.json()) as any;
        const expirationDate = Date.now() + tokens.expires_in * 1000;

        return {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expirationDate,
        };
    } else {
        throw new Error('Error Authorizing:' + JSON.stringify(await res.json()));
    }
};
export const getDiscordUserFromAccessToken = async (accessToken: string): Promise<DiscordUser> => {
    const res = await fetch('https://discord.com/api/v9/users/@me', {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
    if (res.ok) {
        return await res.json() as DiscordUser;
    } else {
        throw new Error("Unauthorized");
    }
};
export const getGuildsOfUser = async (accessToken: string): Promise<any> => {
    const res = await fetch('https://discord.com/api/v9/users/@me/guilds', {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
    if (res.ok) {
        return await res.json() as any;
    } else {
        throw new Error("Unauthorized");
    }
};

export const discordGuard = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { accessToken, refreshToken }: TokenSet = req.cookies;
        console.log(req.cookies);
        if (!accessToken) return next(new Error("Unauthorized"));
        const discordUser = await getDiscordUserFromAccessToken(accessToken);
        console.log(discordUser);
        (req as any).user = discordUser
        next();
    } catch (err) {
        return res.status(401).json({success:false})
    }
};