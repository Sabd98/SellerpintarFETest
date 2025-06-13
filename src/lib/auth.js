"use server";

import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { api } from './api';

export async function verifyToken(token) {
  if (!token) return { user: null, error: 'No token provided' }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    return { user: decoded, error: null }
  } catch (error) {
    return { user: null, error: 'Invalid token' }
  }
}


export async function getServerAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  
  if (!token) return null

  try {
    return jwt.verify(token, process.env.JWT_SECRET)
  } catch (error) {
    return null
  }
}
export async function refreshAuthTokens() {
  const refreshToken = await cookies().get('refreshToken')?.value
  if (!refreshToken) return null

  try {
    const response = await api.post('/auth/refresh', { refreshToken })
    setAuthCookies(response.data)
    return response.data
  } catch (error) {
    clearAuthCookies()
    return null
  }
}

export const setServerAuthCookies = async (tokens) => {
 await cookies().set({
    name: 'token',
    value: tokens.token,
    httpOnly: true,
    path: '/',
    maxAge: tokens.expiresIn
  })
  
 await cookies().set({
    name: 'refreshToken',
    value: tokens.refreshToken,
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 7 // 7 days
  })
}

export const setClientAuthCookies = async (tokens) => {
  if (typeof window === 'undefined') return
  
  localStorage.setItem('token', tokens.token);
  localStorage.setItem("token", tokens.role);
  localStorage.setItem('refreshToken', tokens.refreshToken);
}

export const clearClientAuthCookies = async() => {
  document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
  document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
}