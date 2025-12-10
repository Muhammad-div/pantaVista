# Backend Integration Implementation

## Overview
This document describes the backend integration implementation for the Pantavista React application. The backend uses XML-based API communication with `https://api.pantavista.net`.

## Architecture

### 1. API Service Layer (`src/services/api.ts`)
- **Purpose**: Handles all XML-based API communication with the backend
- **Key Functions**:
  - `getPreAppInit()`: Fetches initial UI captions and texts
  - `getLoginTemplate()`: Fetches login form field definitions
  - `login(username, password)`: Performs user authentication
- **Features**:
  - Automatic language detection from browser
  - Token management (storage/retrieval)
  - SHA256 password hashing
  - Error handling and message extraction

### 2. XML Parser Utilities (`src/utils/xmlParser.ts`)
- **Purpose**: Parse and extract data from XML responses
- **Key Functions**:
  - `parseXML()`: Parse XML string to DOM Document
  - `extractPreAppInitCaptions()`: Extract UI captions
  - `extractLoginTemplate()`: Extract login field definitions
  - `extractLoginConfirmation()`: Extract login response data
  - `getUserMessages()`: Extract user/system messages from responses

### 3. SHA256 Utility (`src/utils/sha256.ts`)
- **Purpose**: Hash passwords using SHA256 algorithm (matches old implementation)
- **Usage**: Automatically used by login function

### 4. Authentication Context (`src/contexts/AuthContext.tsx`)
- **Purpose**: Provides authentication state management across the app
- **Features**:
  - Token persistence
  - Authentication state
  - Login/logout functions
  - Loading states

## Implementation Details

### API Endpoints Implemented

#### 1. GET_PRE_APP_INIT
- **Purpose**: Get initial UI captions and texts for login page
- **Request**: XML envelope with language parameter
- **Response**: XML with captions for welcome text, buttons, labels, etc.
- **Usage**: Called automatically on login page load

#### 2. GET_LOGIN_TEMPLATE
- **Purpose**: Get login form field definitions (labels, hints, validation rules)
- **Request**: XML envelope requesting template
- **Response**: XML with field definitions for USERNAME and PASSWORD
- **Usage**: Called automatically on login page load

#### 3. SET_T_LOGIN
- **Purpose**: Authenticate user with username and password
- **Request**: XML envelope with hashed password (SHA256) and username
- **Response**: XML with token, user data, and messages
- **Usage**: Called when user submits login form

### Data Flow

1. **Login Page Load**:
   - Calls `getPreAppInit()` → Gets UI captions
   - Calls `getLoginTemplate()` → Gets field definitions
   - Updates UI with dynamic content

2. **User Login**:
   - User enters credentials
   - Password is hashed with SHA256
   - Calls `login()` API function
   - Token is stored in localStorage
   - User is redirected to dashboard

3. **Authentication Check**:
   - `AuthContext` checks for stored token on app load
   - Protected routes use `useAuth()` hook
   - Automatic redirect to login if not authenticated

## Storage Keys

The following keys are used in localStorage:
- `pv.token`: Authentication token
- `pv.lang`: User language preference
- `pv.displayName`: User display name
- `pv.username`: Username

## Error Handling

- Network errors are caught and displayed to user
- API error messages are extracted from XML responses
- Critical level 1 messages are treated as errors
- Critical level 0 messages are treated as success/info

## Language Detection

- Automatically detects browser language
- Defaults to English if language not detected
- Supports German (DE) and English (EN)
- Language is sent in API requests and stored after login

## Usage Example

```typescript
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { isAuthenticated, login, logout } = useAuth();
  
  const handleLogin = async () => {
    const result = await login('username', 'password');
    if (result.success) {
      // Login successful
    } else {
      // Show error: result.error
    }
  };
  
  return (
    // Your component JSX
  );
}
```

## Next Steps

To extend this implementation:
1. Add more API endpoints following the same pattern
2. Implement forgot password functionality
3. Add session timeout handling
4. Implement token refresh if needed
5. Add more comprehensive error handling for network issues

## Testing

To test the integration:
1. Start the dev server: `npm run dev`
2. Navigate to login page
3. The page should automatically load captions from backend
4. Enter valid credentials to test login
5. Check browser console for any errors
6. Verify token is stored in localStorage after successful login

## Notes

- The backend API uses XML format (not JSON)
- All requests are POST with XML payloads
- Responses are XML that need to be parsed
- Password must be hashed with SHA256 before sending
- Token is required for authenticated requests (stored after login)

