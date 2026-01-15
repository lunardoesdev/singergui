//go:build linux

package elevate

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"
)

func IsElevated() bool {
	return os.Geteuid() == 0
}

func relaunchElevated(exe string, args []string) error {
	cmdArgs := append([]string{exe}, args...)
	cwd, _ := os.Getwd()
	envVars := elevationEnv()

	if path, err := exec.LookPath("pkexec"); err == nil {
		pkArgs := append([]string{"env"}, envVars...)
		pkArgs = append(pkArgs, cmdArgs...)
		cmd := exec.Command(path, pkArgs...)
		cmd.Dir = cwd
		return startAndCheck(cmd)
	}

	guiLaunchers := []string{"gksudo", "kdesudo", "lxqt-sudo"}
	for _, launcher := range guiLaunchers {
		if path, err := exec.LookPath(launcher); err == nil {
			cmd := exec.Command(path, append([]string{"--"}, cmdArgs...)...)
			cmd.Dir = cwd
			cmd.Env = append(os.Environ(), envVars...)
			return startAndCheck(cmd)
		}
	}

	if path, err := exec.LookPath("sudo"); err == nil {
		askpass, err := writeAskpassHelper()
		if err != nil {
			return err
		}
		cmd := exec.Command(path, append([]string{"-A", "--"}, cmdArgs...)...)
		cmd.Dir = cwd
		cmd.Env = append(os.Environ(),
			"SUDO_ASKPASS="+askpass,
			"SSH_ASKPASS_REQUIRE=force",
		)
		cmd.Env = append(cmd.Env, envVars...)
		return startAndCheck(cmd)
	}

	return ErrNotSupported
}

func startAndCheck(cmd *exec.Cmd) error {
	if err := cmd.Start(); err != nil {
		return err
	}

	done := make(chan error, 1)
	go func() {
		done <- cmd.Wait()
	}()

	select {
	case err := <-done:
		if err != nil {
			return err
		}
	case <-time.After(700 * time.Millisecond):
	}

	return nil
}

func elevationEnv() []string {
	keys := elevationEnvKeys()
	env := make([]string, 0, len(keys))
	for _, key := range keys {
		if val := os.Getenv(key); val != "" {
			env = append(env, key+"="+val)
		}
	}
	return env
}

func elevationEnvKeys() []string {
	return []string{
		"DISPLAY",
		"WAYLAND_DISPLAY",
		"XAUTHORITY",
		"DBUS_SESSION_BUS_ADDRESS",
		"XDG_RUNTIME_DIR",
		"XDG_DATA_HOME",
		"SINGERGUI_DATA_DIR",
	}
}

func writeAskpassHelper() (string, error) {
	dir := os.TempDir()
	scriptPath := filepath.Join(dir, "singergui-askpass.sh")

	script := `#!/bin/sh
if command -v zenity >/dev/null 2>&1; then
  zenity --password --title="SingerGUI needs administrator privileges"
  exit $?
fi
if command -v kdialog >/dev/null 2>&1; then
  kdialog --password "SingerGUI needs administrator privileges"
  exit $?
fi
if command -v yad >/dev/null 2>&1; then
  yad --entry --hide-text --title="SingerGUI needs administrator privileges" --text="Password:"
  exit $?
fi
echo "No GUI password helper found." >&2
exit 1
`

	if err := os.WriteFile(scriptPath, []byte(strings.TrimSpace(script)+"\n"), 0o700); err != nil {
		return "", fmt.Errorf("write askpass helper: %w", err)
	}
	return scriptPath, nil
}
