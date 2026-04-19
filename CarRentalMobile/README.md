# Car Rental Mobile (Expo)

## Run

```bash
npm install
npx expo start
```

## Backend Connection

The app now calls the Django backend API.

- Default API base URL on Android emulator: `http://10.0.2.2:8000`
- Default API base URL on iOS simulator: `http://127.0.0.1:8000`
- Override with env var: `EXPO_PUBLIC_API_URL`

Examples:

```bash
set EXPO_PUBLIC_API_URL=http://127.0.0.1:8000
npx expo start
```

For a physical device, use your computer LAN IP, for example:

```bash
set EXPO_PUBLIC_API_URL=http://192.168.1.50:8000
npx expo start
```

