.PHONY: all generate dev build clean run install test

# Sing-box feature tags (most features enabled)
SINGBOX_TAGS := with_quic,with_dhcp,with_wireguard,with_utls,with_acme,with_clash_api,with_gvisor,with_tailscale

# SQLite tags (FTS5 for full-text search)
SQLITE_TAGS := fts5

# WebKit tag for Linux (webkit2gtk-4.1)
WEBKIT_TAG := webkit2_41

# Combined tags for Linux builds
LINUX_TAGS := $(WEBKIT_TAG),$(SINGBOX_TAGS),$(SQLITE_TAGS)

# Tags for non-Linux builds (no webkit tag needed)
OTHER_TAGS := $(SINGBOX_TAGS),$(SQLITE_TAGS)

# Default target
all: install build

# Generate sqlc code
generate:
	sqlc generate

# Install frontend dependencies
install:
	cd frontend && npm install

# Development mode with hot reload
dev:
	wails dev -tags "$(LINUX_TAGS)"

# Production build (Linux with webkit2gtk-4.1)
build:
	wails build -tags "$(LINUX_TAGS)"

# Build with debug info
build-debug:
	wails build -tags "$(LINUX_TAGS)" -debug

# Build for Windows
build-windows:
	wails build -platform windows/amd64 -tags "$(OTHER_TAGS)"

# Build for macOS (amd64)
build-darwin:
	wails build -platform darwin/amd64 -tags "$(OTHER_TAGS)"

# Build for macOS (arm64/Apple Silicon)
build-darwin-arm:
	wails build -platform darwin/arm64 -tags "$(OTHER_TAGS)"

# Build for Linux (explicit)
build-linux:
	wails build -platform linux/amd64 -tags "$(LINUX_TAGS)"

# Build for Linux ARM64
build-linux-arm:
	wails build -platform linux/arm64 -tags "$(LINUX_TAGS)"

# Build all platforms
build-all: build-linux build-windows build-darwin build-darwin-arm

# Run tests with feature tags enabled
test:
	go test -v -tags "$(OTHER_TAGS)" ./...

# Clean build artifacts
clean:
	rm -rf build/bin
	rm -rf frontend/dist
	rm -rf frontend/node_modules

# Run the application (dev mode)
run: dev

# Tidy dependencies
tidy:
	go mod tidy

# Format code
fmt:
	go fmt ./...

# Update frontend dependencies
update-frontend:
	cd frontend && npm update

# Create release package
release: clean generate build
	mkdir -p dist
	cp build/bin/singergui dist/ 2>/dev/null || true
	cp build/bin/singergui.exe dist/ 2>/dev/null || true
	@echo "Release built in dist/"

# Help
help:
	@echo "SingerGUI Makefile"
	@echo ""
	@echo "Build tags enabled:"
	@echo "  Sing-box: $(SINGBOX_TAGS)"
	@echo "  SQLite:   $(SQLITE_TAGS)"
	@echo "  WebKit:   $(WEBKIT_TAG) (Linux only)"
	@echo ""
	@echo "Targets:"
	@echo "  make              - Install dependencies and build"
	@echo "  make generate     - Generate sqlc code"
	@echo "  make install      - Install frontend dependencies"
	@echo "  make dev          - Run in development mode with hot reload"
	@echo "  make build        - Production build (Linux)"
	@echo "  make build-debug  - Build with debug symbols"
	@echo "  make build-windows    - Build for Windows"
	@echo "  make build-darwin     - Build for macOS (Intel)"
	@echo "  make build-darwin-arm - Build for macOS (Apple Silicon)"
	@echo "  make build-linux      - Build for Linux (amd64)"
	@echo "  make build-linux-arm  - Build for Linux (arm64)"
	@echo "  make build-all        - Build for all platforms"
	@echo "  make test         - Run tests"
	@echo "  make clean        - Remove build artifacts"
	@echo "  make tidy         - Tidy go modules"
	@echo "  make release      - Create release package"
