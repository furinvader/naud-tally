#!/usr/bin/env bash
set -euo pipefail

if [ -s "${HOME}/.nvm/nvm.sh" ]; then
  # Use the user's default nvm Node so the script does not depend on the
  # currently active shell version.
  # Penpot documents Node 22.x as the tested baseline; this machine currently
  # has Node 24.x installed as the default through nvm.
  # shellcheck disable=SC1090
  source "${HOME}/.nvm/nvm.sh"
  nvm use default >/dev/null
fi

shim_dir="$(mktemp -d)"
cleanup() {
  rm -rf "${shim_dir}"
}
trap cleanup EXIT

cat > "${shim_dir}/pnpm" <<'EOF'
#!/usr/bin/env bash
exec corepack pnpm "$@"
EOF
chmod +x "${shim_dir}/pnpm"

export PATH="${shim_dir}:${PATH}"

npx -y '@penpot/mcp@>=0'
