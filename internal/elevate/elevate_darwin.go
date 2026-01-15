//go:build darwin

package elevate

import (
	"fmt"
	"os"
	"os/exec"
	"strings"
)

func IsElevated() bool {
	return os.Geteuid() == 0
}

func relaunchElevated(exe string, args []string) error {
	cmdline := shellCommand(exe, args)
	script := fmt.Sprintf(`do shell script "%s" with administrator privileges`, escapeAppleScript(cmdline))
	cmd := exec.Command("osascript", "-e", script)
	return cmd.Start()
}

func shellCommand(exe string, args []string) string {
	parts := []string{shellQuote(exe)}
	for _, arg := range args {
		parts = append(parts, shellQuote(arg))
	}
	return strings.Join(parts, " ")
}

func shellQuote(s string) string {
	if s == "" {
		return "''"
	}
	return "'" + strings.ReplaceAll(s, "'", `'"'"'`) + "'"
}

func escapeAppleScript(s string) string {
	s = strings.ReplaceAll(s, `\`, `\\`)
	return strings.ReplaceAll(s, `"`, `\"`)
}
