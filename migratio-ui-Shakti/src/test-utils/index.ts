import * as React from 'react'
import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { UserContext, UserContextType } from '../context/UserContext'
import type { User, Session } from '@supabase/supabase-js'

// Mock user context values
const mockUserContextValue: UserContextType = {
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: '2023-01-01T00:00:00.000Z',
  } as User,
  session: {
    access_token: 'test-access-token',
    refresh_token: 'test-refresh-token',
    expires_in: 3600,
    expires_at: 1234567890,
    token_type: 'bearer',
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: '2023-01-01T00:00:00.000Z',
    } as User,
  } as Session,
  profile: {
    id: 'test-profile-id',
    full_name: 'Test User',
    avatar_url: 'https://example.com/avatar.jpg',
    status: 'active',
    hubspot_portal_id_a: 12345,
    hubspot_portal_id_b: 67890,
    hubspot_access_token_a: 'token-a',
    hubspot_access_token_b: 'token-b',
    hubspot_access_token_expires_at_a: '2023-12-31T23:59:59.000Z',
    hubspot_access_token_expires_at_b: '2023-12-31T23:59:59.000Z',
    hubspot_refresh_token_a: 'refresh-token-a',
    hubspot_refresh_token_b: 'refresh-token-b',
    hubspot_crm_a_mapped_json: {},
  },
  isLoading: false,
  refreshProfile: jest.fn(),
  refreshProfileWithRetry: jest.fn(),
  upsertMappedJson: jest.fn(),
}

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return React.createElement(
    UserContext.Provider,
    { value: mockUserContextValue },
    children
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// Re-export everything
export * from '@testing-library/react'

// Override render method
export { customRender as render }

// Export mock context value for testing
export { mockUserContextValue }

// Helper function to create mock data
export const createMockProfile = (overrides = {}) => ({
  id: 'test-profile-id',
  full_name: 'Test User',
  status: 'active',
  hubspot_portal_id_a: 12345,
  hubspot_portal_id_b: 67890,
  hubspot_access_token_a: 'token-a',
  hubspot_access_token_b: 'token-b',
  ...overrides,
})

export const createMockUser = (overrides = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  ...overrides,
})

// Helper function to wait for async operations
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Helper function to mock API responses
export const mockApiResponse = (data: any, status = 200) => {
  return Promise.resolve({
    ok: status < 400,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  })
}

// Helper function to create mock localStorage
export const createMockLocalStorage = () => {
  const store: Record<string, string> = {}
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key]
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key])
    }),
  }
}
