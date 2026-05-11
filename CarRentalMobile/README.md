# Car Rental Mobile (Expo)

## Run

```bash
npm install
npx expo start
```

## Backend Connection

The app now reads the backend base URL from the `EXPO_PUBLIC_API_URL` environment variable.

- Default API base URL for Expo Go is configured in `.env` as your local network IP.
- For Android emulator, the app will still use `http://10.0.2.2:8000` when `EXPO_PUBLIC_API_URL` points to localhost.
- For iOS simulator, the app will still use `http://127.0.0.1:8000` when `EXPO_PUBLIC_API_URL` points to localhost.

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

