//go:build windows

package elevate

import (
	"strings"
	"syscall"
	"unsafe"

	"golang.org/x/sys/windows"
)

func IsElevated() bool {
	var token windows.Token
	if err := windows.OpenProcessToken(windows.CurrentProcess(), windows.TOKEN_QUERY, &token); err != nil {
		return false
	}
	defer token.Close()

	var elevation windows.TokenElevation
	var outLen uint32
	err := windows.GetTokenInformation(
		token,
		windows.TokenElevation,
		(*byte)(unsafe.Pointer(&elevation)),
		uint32(unsafe.Sizeof(elevation)),
		&outLen,
	)
	if err != nil {
		return false
	}
	return elevation.TokenIsElevated != 0
}

func relaunchElevated(exe string, args []string) error {
	params := escapeArgs(args)
	return windows.ShellExecute(0, windows.StringToUTF16Ptr("runas"),
		windows.StringToUTF16Ptr(exe),
		windows.StringToUTF16Ptr(params),
		nil,
		windows.SW_NORMAL,
	)
}

func escapeArgs(args []string) string {
	if len(args) == 0 {
		return ""
	}
	escaped := make([]string, 0, len(args))
	for _, arg := range args {
		escaped = append(escaped, syscall.EscapeArg(arg))
	}
	return strings.Join(escaped, " ")
}
