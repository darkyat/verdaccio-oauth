// @flow
import fetch from 'node-fetch'

function oauthHeader(token: string) {
    return {
        Authorization: `Bearer ${token}`
    }
}

const usernameProviders: {[provider:string]: (token: string) => Promise<string>} = {
    // TODO support Github enterprise
    github: (token: string) =>
        fetch('https://api.github.com/user', { headers: oauthHeader(token) })
            .then(x => x.json())
            .then(x => x.login),
    google: (token: string) =>
        fetch('https://www.googleapis.com/userinfo/v2/me', { headers: oauthHeader(token) })
            .then(x => x.json())
            .then(x => x.email.match(/^[^@]+/)),
}

export default function getUsername(provider: string, token: string): Promise<string | null> {
    const usernameFunc = usernameProviders[provider]
    if (usernameFunc)
        return usernameFunc(token)
    else
        return Promise.resolve(null)
}
