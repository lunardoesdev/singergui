# SingerGUI

Desktop + mobile GUI for managing sing-box proxy links, subscriptions, and TUN mode.

## Build / Test

- Install frontend dependencies: `make install`
- Run tests (feature tags enabled): `make test`
- Build (Linux): `make build`

## TUN (Desktop)

TUN requires administrator privileges on desktop platforms. When you click **Enable TUN**, the app will:

- Relaunch itself with elevation (pkexec/gksudo/sudo-askpass on Linux, UAC on Windows, osascript on macOS).
- Preserve the same database location by passing `SINGERGUI_DATA_DIR` to the elevated process.
- Wait for the elevated instance to start before closing the original app.

If elevation fails, the app stays open and shows an error dialog.

## Linux Elevation Notes

SingerGUI attempts the following in order:

1. `pkexec`
2. `gksudo`, `kdesudo`, or `lxqt-sudo`
3. `sudo -A` with GUI askpass (zenity/kdialog/yad)

The helper environment variables are passed through for GUI prompts:
`DISPLAY`, `WAYLAND_DISPLAY`, `XAUTHORITY`, `DBUS_SESSION_BUS_ADDRESS`, `XDG_RUNTIME_DIR`,
and data dir overrides `XDG_DATA_HOME`, `SINGERGUI_DATA_DIR`.

You can run a dry-run probe:

```sh
scripts/check-elevate.sh
```

## Mobile (gomobile)

Mobile builds use sing-box `libbox` and require a platform implementation that supplies a real
TUN device (Android `VpnService`, iOS `NetworkExtension`). See `mobile/mobile.go` for the Go API.
