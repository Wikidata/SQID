export interface SessionData {
  username: string,
  token: string,
  key: string,
}

export interface LoginState {
  loggedIn: boolean,
  session?: SessionData,
}
