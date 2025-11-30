# WebSocket STOMP Test Client

This is a small standalone test client to exercise the backend STOMP WebSocket endpoints you added.

Files
- `index.html` — simple UI to login, connect, subscribe and send messages.

How to use
1. Start your backend (make sure it runs on `http://localhost:8080` or change the URL in the UI).
2. Build/run the backend normally (`./mvnw spring-boot:run` from `back-end` or run your jar).
3. Serve the `ws-test-client` folder or open `index.html` in the browser.

Recommended: serve via simple static server to avoid any file:// issues.

- Using Python (if installed):

```powershell
cd ws-test-client
python -m http.server 8081
```
Open `http://localhost:8081` in your browser and use the UI.

- Or use `npx` static server:

```powershell
cd ws-test-client
npx http-server -p 8081
```

Usage steps in UI
1. Enter email and password and click **Login & Get JWT** (calls `POST /auth/login`).
2. Fill the server URL (default `http://localhost:8080`) and group name + group id.
   - Group id is required by the backend `MessageService` - copy the DB id of the group you want to test.
3. Click **Connect** to open a STOMP connection to `/ws` (the client sends `Authorization: Bearer <token>` on CONNECT).
4. After connect, the client subscribes to `/topic/groups/{groupName}` and sends a join message.
5. Type a message and click **Send** to publish to `/app/groups/{groupName}/send`.
6. Incoming messages broadcast from the server appear in the message pane.

Notes & troubleshooting
- Ensure the token from `POST /auth/login` is valid and the backend `spring.security.jwt.secret` matches how tokens are generated.
- If the STOMP connection fails, check browser console for STOMP errors and backend logs for the WebSocket interceptor logs.
- If you used a different SockJS path or changed the WebSocket config, update the `index.html` accordingly.

If you want, I can also:
- Add a small Node test script that programmatically logs in and runs a STOMP client.
- Wire the UI to list groups and populate `groupId` automatically via REST.
