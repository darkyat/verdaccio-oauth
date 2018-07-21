// @flow
import url from 'url'

import grant from 'grant-express'
import session from 'express-session'

import type {
    Config,
    Callback as VerdaccioCallback,
    IBasicAuth,
    IPluginAuth,
    IPluginMiddleware,
    IStorageManager,
    Logger,
    PluginOptions,
} from '@verdaccio/types'

class OAuthPlugin implements IPluginAuth, IPluginMiddleware {
    static CALLBACK_URL: string

    logger: Logger
    url: url.URL
    config: any
    login_url: string

    constructor(config: Config, logger: Logger) {
        if (!config.url_prefix)
            throw new Error('verdaccio-oauth requires url_prefix to be set in your config')

        if (config.middlewares.oauth === undefined || config.auth.oauth === undefined)
            throw new Error('verdaccio-oauth should be enabled in both auth and middlewares in your config')

        this.url = url.parse(config.url_prefix)
        this.logger = logger
        this.config = config.auth.oauth
        this.login_url = `/connect/${this.config.provider}`
    }

    register_middlewares(app: any, auth: IBasicAuth, storage: IStorageManager): void {
        const grantConfig = {
            server: {
                protocol: this.url.protocol.replace(/:+$/, ''),
                host: this.url.host,
                callback: OAuthPlugin.CALLBACK_URL,
                transport: 'querystring',
                state: true
            },
            [this.config.provider]: {
                key: this.config.key || this.config.client_id,
                secret: this.config.secret || this.config.client_secret,
                scope: this.config.scope || []
            }
        }

        app.use(session({secret: 'grant', saveUninitialized: true, resave: true}))
        app.use(grant(grantConfig))
        app.get(OAuthPlugin.CALLBACK_URL, (req, res) => {
            const name = 'Unknown' // TODO get name
            const jwt = auth.issueUIjwt({
                name
            })
            res.contentType('text/html')
            console.log(jwt)
            // This is a hack to pass the right information back to Verdaccio's SPA
            res.send(`
                <script>
                    window.localStorage.setItem('token', '${jwt}')
                    window.localStorage.setItem('username', '${name}')
                    window.location.replace("${this.url.href}")
                </script>
            `)
        })
    }
}

OAuthPlugin.CALLBACK_URL = '/callback'

export default function(config: Config, {logger}: PluginOptions) {
    return new OAuthPlugin(config, logger)
}
