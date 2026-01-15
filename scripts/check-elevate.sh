#!/bin/sh
set -eu

echo "SingerGUI elevation probe"
echo "User: $(id -u -n) (uid=$(id -u))"
echo "Desktop session: ${XDG_SESSION_TYPE:-unknown}"
echo "DISPLAY=${DISPLAY:-}"
echo "WAYLAND_DISPLAY=${WAYLAND_DISPLAY:-}"
echo "XAUTHORITY=${XAUTHORITY:-}"
echo "DBUS_SESSION_BUS_ADDRESS=${DBUS_SESSION_BUS_ADDRESS:-}"
echo "XDG_RUNTIME_DIR=${XDG_RUNTIME_DIR:-}"
echo

if command -v pkexec >/dev/null 2>&1; then
  echo "Found pkexec: $(command -v pkexec)"
  echo "Would run: pkexec env DISPLAY=$DISPLAY WAYLAND_DISPLAY=$WAYLAND_DISPLAY XAUTHORITY=$XAUTHORITY DBUS_SESSION_BUS_ADDRESS=$DBUS_SESSION_BUS_ADDRESS XDG_RUNTIME_DIR=$XDG_RUNTIME_DIR <app> <args>"
  exit 0
fi

for launcher in gksudo kdesudo lxqt-sudo; do
  if command -v "$launcher" >/dev/null 2>&1; then
    echo "Found $launcher: $(command -v "$launcher")"
    echo "Would run: $launcher -- <app> <args>"
    exit 0
  fi
done

if command -v sudo >/dev/null 2>&1; then
  echo "Found sudo: $(command -v sudo)"
  if command -v zenity >/dev/null 2>&1; then
    echo "Found askpass helper: zenity"
  elif command -v kdialog >/dev/null 2>&1; then
    echo "Found askpass helper: kdialog"
  elif command -v yad >/dev/null 2>&1; then
    echo "Found askpass helper: yad"
  else
    echo "No GUI askpass helper found (zenity/kdialog/yad)."
  fi
  echo "Would run: sudo -A -- <app> <args>"
  exit 0
fi

echo "No elevation helper found on PATH."
exit 1
