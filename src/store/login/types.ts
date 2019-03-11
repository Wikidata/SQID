export interface LoggedOut {
  kind: 'logged-out'
}

export interface Initiated {
  kind: 'initiated',
  requestToken: RequestToken,
}

export interface Completed {
  kind: 'completed',
  accessToken: OAuthToken,
}

export interface Identified {
  kind: 'identified',
  accessToken: OAuthToken,
  username: string,
}

export type OAuthState = LoggedOut | Initiated | Completed | Identified

export interface OAuthToken {
  key: string,
  secret: string,
}

export interface RequestToken extends OAuthToken {
  url: string,
}

export interface LoginState {
  oauth: OAuthState
}
