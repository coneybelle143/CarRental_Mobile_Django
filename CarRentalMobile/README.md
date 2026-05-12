# Car Rental Mobile (Expo)

## Run

```bash
npm install
npx expo start
```

## Backend Connection

The app reads the backend base URL from the `EXPO_PUBLIC_API_URL` environment variable. If that is not set, the client falls back to the current Expo host or the appropriate simulator/emulator localhost address.

Create or update `.env` in the project root with your local LAN IP, for example:

```env
EXPO_PUBLIC_API_URL=http://192.168.254.107:8000
```

Then start Expo normally:

```bash
npx expo start
```

If you want to override it at runtime, set the variable in your shell before launching Expo:

```bash
set EXPO_PUBLIC_API_URL=http://192.168.1.50:8000
npx expo start
```

