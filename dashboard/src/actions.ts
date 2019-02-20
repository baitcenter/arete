import { action } from 'typesafe-actions'

export const enum UserActionTypes {
  SIGN_IN = '@@user/sign-in',
  SIGN_OUT = '@@user/sign-out',
}

export const enum SiteActionTypes {
  REFRESH = '@@site/refresh',
}

export interface IUserState {
  readonly uid?: string,
  readonly roles: string[],
}

export interface ISiteState {
  readonly version?: string,
  readonly who?: ICurrentUser,
  readonly languages: string[],
}

export interface ICurrentUser {
  readonly logo: string,
  readonly realName: string,
}

export const userSignIn = (token: string) => action(UserActionTypes.SIGN_IN, token)

export const userSignOut = () => action(UserActionTypes.SIGN_OUT)

export const siteRefresh = (info: ISiteState) => action(SiteActionTypes.REFRESH, info)
