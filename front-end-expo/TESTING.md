# Mobile E2E Testing Guide with Maestro

This document explains how to run and write E2E tests for the EatUp Expo mobile application using **Maestro**.

## Why Maestro?

Maestro is the ideal choice for Expo managed workflow because:
- ✅ **Works with Expo out of the box** - no ejecting/prebuild required
- ✅ **Simple YAML syntax** - human-readable test flows
- ✅ **Uses `testID` directly** - leverages React Native's testID prop
- ✅ **Fast execution** - optimized for mobile testing
- ✅ **Cross-platform** - same tests run on iOS and Android

## Setup

### 1. Install Maestro CLI

**macOS:**
```bash
curl -Ls "https://get.maestro.mobile.dev" | bash
```

**Windows (via WSL or PowerShell):**
```powershell
# Using PowerShell (requires scoop or manual install)
iex "& { $(irm get.maestro.mobile.dev) }"
```

**Linux:**
```bash
curl -Ls "https://get.maestro.mobile.dev" | bash
```

**Verify installation:**
```bash
maestro --version
```

### 2. Backend Setup (Required)

The backend must be running locally with the **dev** profile:

```bash
cd back-end
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

This enables:
- Test database endpoints (`/test/reset-database`, `/test/seed`, `/test/cleanup`)
- Uses local MongoDB at `mongodb://localhost:27017/Eat-Up`

### 3. Build & Run the Expo App

**For Android emulator:**
```bash
# Create a development build
npx expo run:android

# Or use EAS build
eas build --profile development --platform android
```

**For iOS simulator (macOS only):**
```bash
npx expo run:ios
```

## Test Users (DatabaseSeeder)

The backend seeds these test users on startup:

| User | Email | Password |
|------|-------|----------|
| John Smith | john.smith@example.com | password123 |
| Jane Doe | jane.doe@example.com | password123 |
| Charlie Brown | charlie.brown@example.com | password123 |
| Emma Johnson | emma.johnson@example.com | password123 |
| Liam Miller | liam.miller@example.com | password123 |
| Olivia Davis | olivia.davis@example.com | password123 |

**Default Test User**: `john.smith@example.com` / `password123`

## Running Tests

### Run All Tests
```bash
cd front-end-expo
maestro test maestro/flows/
```

### Run a Specific Test
```bash
maestro test maestro/flows/login/login-success.yaml
```

### Run Tests in a Folder
```bash
maestro test maestro/flows/login/
maestro test maestro/flows/register/
maestro test maestro/flows/navigation/
maestro test maestro/flows/auth/
```

### Interactive Mode (Maestro Studio)
```bash
maestro studio
```
This opens an interactive UI where you can:
- Record test flows by interacting with the app
- Debug failing tests
- See element hierarchy

## Test Structure

```
maestro/
├── config.yaml                    # Global configuration
├── flows/
│   ├── helpers/                   # Reusable helper flows
│   │   ├── reset-database.yaml
│   │   └── logout.yaml
│   ├── login/                     # Login tests
│   │   ├── login-success.yaml
│   │   ├── login-invalid-credentials.yaml
│   │   ├── login-validation.yaml
│   │   └── login-navigate-to-register.yaml
│   ├── register/                  # Registration tests
│   │   ├── register-success.yaml
│   │   ├── register-validation.yaml
│   │   ├── register-existing-email.yaml
│   │   └── register-navigate-to-login.yaml
│   ├── navigation/                # Tab navigation tests
│   │   ├── tab-navigation.yaml
│   │   └── sequential-navigation.yaml
│   └── auth/                      # Authentication flow tests
│       ├── complete-auth-flow.yaml
│       └── register-auto-login-flow.yaml
```

## Writing Tests

### Basic Test Structure
```yaml
# my-test.yaml
appId: com.eatup.frontend
---
- launchApp:
    clearState: true

- assertVisible: "Welcome back!"

- tapOn:
    id: "login-email-input"
- inputText: "john.smith@example.com"

- tapOn:
    id: "login-button"

- assertVisible: "Chats"
- takeScreenshot: test-result
```

### Common Commands

| Command | Description | Example |
|---------|-------------|---------|
| `launchApp` | Launch/restart the app | `- launchApp: { clearState: true }` |
| `tapOn` | Tap an element | `- tapOn: { id: "button-id" }` |
| `inputText` | Type text | `- inputText: "hello"` |
| `assertVisible` | Check element exists | `- assertVisible: "Text"` |
| `assertNotVisible` | Check element hidden | `- assertNotVisible: "Error"` |
| `hideKeyboard` | Dismiss keyboard | `- hideKeyboard` |
| `scroll` | Scroll the screen | `- scroll: { direction: DOWN }` |
| `takeScreenshot` | Capture screenshot | `- takeScreenshot: name` |
| `clearText` | Clear input field | `- clearText` |
| `back` | Press back button | `- back` |

### Using testID

In your React Native components:
```tsx
<TextInput testID="login-email-input" ... />
<TouchableOpacity testID="login-button" ... />
```

In Maestro tests:
```yaml
- tapOn:
    id: "login-email-input"
```

### Environment Variables

Set in `config.yaml`:
```yaml
env:
  TEST_USER_EMAIL: john.smith@example.com
  TEST_USER_PASSWORD: password123
```

Use in tests:
```yaml
- inputText: ${TEST_USER_EMAIL}
```

## Test Suites

### Login Tests
- **login-success.yaml**: Valid credentials → redirect to tabs
- **login-invalid-credentials.yaml**: Wrong credentials → error message
- **login-validation.yaml**: Empty/invalid fields → validation errors
- **login-navigate-to-register.yaml**: Click register link → navigate

### Register Tests
- **register-success.yaml**: Valid form → create account → auto-login
- **register-validation.yaml**: Empty/invalid fields → validation errors
- **register-existing-email.yaml**: Duplicate email → error message
- **register-navigate-to-login.yaml**: Click login link → navigate

### Navigation Tests
- **tab-navigation.yaml**: Verify all tabs work
- **sequential-navigation.yaml**: Navigate through all tabs in order

### Auth Flow Tests
- **complete-auth-flow.yaml**: Login → Navigate → Logout
- **register-auto-login-flow.yaml**: Register → Auto-login → Access tabs

## testID Reference

### Login Page
| Element | testID |
|---------|--------|
| Card container | `login-card` |
| Email input | `login-email-input` |
| Password input | `login-password-input` |
| Login button | `login-button` |
| Error message | `login-error` |
| Register link | `register-link` |

### Register Page
| Element | testID |
|---------|--------|
| Card container | `register-card` |
| First name input | `register-firstname-input` |
| Last name input | `register-lastname-input` |
| Email input | `register-email-input` |
| Phone input | `register-phone-input` |
| Password input | `register-password-input` |
| Submit button | `register-button` |
| Error message | `register-error` |
| Login link | `login-link` |

### Tab Bar
| Tab | testID |
|-----|--------|
| Chats | `tab-chats` |
| Discover | `tab-discover` |
| Revisit | `tab-revisit` |
| Profile | `tab-profile` |

## Backend Test Endpoints

The backend includes a `TestController` for database management:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/test/health` | GET | Health check |
| `/test/reset-database` | POST | Clear and reseed database |
| `/test/seed` | POST | Seed specific data |
| `/test/cleanup` | POST | Remove test-created users |

## Troubleshooting

### "App not found"
Make sure the app is installed on the emulator/simulator:
```bash
adb devices  # Check connected devices
adb shell pm list packages | grep eatup
```

### "Element not found"
1. Use `maestro studio` to inspect element hierarchy
2. Verify `testID` is set in the component
3. Add a wait: `- assertVisible: { text: "...", timeout: 10000 }`

### API calls fail (Android emulator)
Android emulator uses `10.0.2.2` to reach localhost:
```yaml
env:
  API_BASE_URL: http://10.0.2.2:8080
```

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Mobile E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install Maestro
        run: curl -Ls "https://get.maestro.mobile.dev" | bash
        
      - name: Start Android Emulator
        uses: reactivecircus/android-emulator-runner@v2
        with:
          api-level: 30
          script: |
            maestro test maestro/flows/
```
