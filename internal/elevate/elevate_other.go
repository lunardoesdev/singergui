//go:build !linux && !windows && !darwin

package elevate

func IsElevated() bool {
	return false
}

func relaunchElevated(_ string, _ []string) error {
	return ErrNotSupported
}
