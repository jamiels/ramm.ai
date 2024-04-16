import axios from 'axios'
import globalConfig from '../../../../config'

const API_URL = globalConfig.REACT_APP_API_URL

export const GET_USER_BY_ACCESSTOKEN_URL = `${API_URL}/verify_token`
export const LOGIN_URL = `${API_URL}/login`
export const REGISTER_URL = `${API_URL}/register`
export const REQUEST_PASSWORD_URL = `${API_URL}/forgot_password`

// Server should return AuthModel
export function login(email: string, password: string): Promise<any> {
  if (email === 'admin@scifn.com' && password === 'rammdemo321!') {
    const data = {
      id: 2,
      first_name: 'Alvena',
      last_name: 'Ward',
      email: 'admin@demo.com',
      email_verified_at: '2023-07-12T13:39:05.000000Z',
      created_at: '2023-07-12T13:39:05.000000Z',
      updated_at: '2023-07-12T13:39:05.000000Z',
      api_token: '$2y$10$qyWRyuvGf4t9hAOndcV.vu.9ro6LFObwA5ovBoUtmB2ja4i9ipKAW',
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({data});
      }, 500); // Simulate a delay of 500 milliseconds
    });
  } else {
    throw new Error()
  }
}

// Server should return AuthModel
export function register(
  email: string,
  firstname: string,
  lastname: string,
  password: string,
  password_confirmation: string
) {
  return axios.post(REGISTER_URL, {
    email,
    first_name: firstname,
    last_name: lastname,
    password,
    password_confirmation,
  })
}

// Server should return object => { result: boolean } (Is Email in DB)
export function requestPassword(email: string) {
  return axios.post<{result: boolean}>(REQUEST_PASSWORD_URL, {
    email,
  })
}

export function getUserByToken(token: string): Promise<any> {

  // For the live authentication api
  // return axios.post<UserModel>(GET_USER_BY_ACCESSTOKEN_URL, {
  //   api_token: token,
  // })

  const user = {
    id: 2,
    first_name: 'Alvena',
    last_name: 'Ward',
    email: 'admin@demo.com',
    email_verified_at: '2023-07-12T13:39:05.000000Z',
    created_at: '2023-07-12T13:39:05.000000Z',
    updated_at: '2023-07-12T13:39:05.000000Z',
    api_token: '$2y$10$qyWRyuvGf4t9hAOndcV.vu.9ro6LFObwA5ovBoUtmB2ja4i9ipKAW',
  }

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({data: user});
    }, 500); // Simulate a delay of 500 milliseconds
  });
}
