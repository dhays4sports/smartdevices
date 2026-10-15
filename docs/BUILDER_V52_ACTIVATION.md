# Builder v5.2 activation

The code ships fail-closed. The following features remain unavailable until their explicit flags and credentials are configured.

## Model-assisted requirements + live research

- `SMARTDEVICES_AI_ENABLED=true`
- `OPENAI_API_KEY=<secret>`
- optional `SMARTDEVICES_AI_MODEL` (default `gpt-5.6-terra`)
- `SMARTDEVICES_LIVE_RESEARCH_ENABLED=true` to enable web research

The API key is server-side only. Do not expose it to client code.

## Live sourcing

- `SMARTDEVICES_LIVE_SOURCING_ENABLED=true`
- `SMARTDEVICES_SOURCING_ENDPOINT=https://...`
- optional `SMARTDEVICES_SOURCING_TOKEN=<secret>`

The provider must return source-attributed BOM data matching the `SourcingLine` contract.

## Build execution

- `SMARTDEVICES_BUILD_EXECUTOR_ENABLED=true`
- `SMARTDEVICES_BUILD_EXECUTOR_ENDPOINT=https://...`
- `SMARTDEVICES_BUILD_EXECUTOR_TOKEN=<secret>`

See `docs/BUILD_EXECUTOR_CONTRACT.md`.
