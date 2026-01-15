package elevate

import (
	"errors"
	"os"
)

// ErrNotSupported indicates elevation isn't supported on this platform.
var ErrNotSupported = errors.New("elevation not supported")

// RelaunchElevated starts a new elevated process with provided args.
func RelaunchElevated(args []string) error {
	exe, err := os.Executable()
	if err != nil {
		return err
	}
	return relaunchElevated(exe, args)
}
