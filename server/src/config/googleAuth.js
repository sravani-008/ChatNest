import { OAuth2Client } from 'google-auth-library';

export const verifyGoogleOAuth = async ({ credential, idToken, accessToken, code, redirectUri }) => {
  const tokenToVerify = credential || idToken;
  const clientId = process.env.GOOGLE_CLIENT_ID;

  // 1. Verify via ID Token (Standard Google Identity Services credential)
  if (tokenToVerify) {
    if (!clientId) {
      throw new Error('GOOGLE_CLIENT_ID is not configured in server/.env');
    }

    const client = new OAuth2Client(clientId);
    const ticket = await client.verifyIdToken({
      idToken: tokenToVerify,
      audience: clientId,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      throw new Error('Invalid Google token payload');
    }

    return {
      googleId: payload.sub,
      email: payload.email,
      name: payload.name || payload.email.split('@')[0],
      avatarUrl: payload.picture || null,
    };
  }

  // 2. Verify via OAuth2 Access Token
  if (accessToken) {
    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userInfoRes.ok) {
      throw new Error('Failed to verify Google access token.');
    }

    const payload = await userInfoRes.json();
    return {
      googleId: payload.sub,
      email: payload.email,
      name: payload.name || payload.email.split('@')[0],
      avatarUrl: payload.picture || null,
    };
  }

  // 3. Verify via OAuth2 Authorization Code
  if (code) {
    if (!clientId || !process.env.GOOGLE_CLIENT_SECRET) {
      throw new Error('GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be configured in server/.env');
    }

    const oauth2Client = new OAuth2Client(
      clientId,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUri || 'postmessage'
    );

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    const payload = await userInfoRes.json();
    return {
      googleId: payload.sub,
      email: payload.email,
      name: payload.name || payload.email.split('@')[0],
      avatarUrl: payload.picture || null,
    };
  }

  throw new Error('No valid Google credential, access token, or code provided.');
};

export const verifyGoogleIdToken = (token) => verifyGoogleOAuth({ credential: token });
