# SmartDevices Build Executor Contract v1

The public SmartDevices worker MUST NOT execute generated firmware/CAD code directly. v5.2 delegates execution to a separately isolated service.

## Request

`POST SMARTDEVICES_BUILD_EXECUTOR_ENDPOINT`

Bearer authentication is recommended.

```json
{
  "contractVersion": 1,
  "projectId": "sd-...",
  "revision": 4,
  "operations": ["firmware", "cad"],
  "firmware": {
    "ecosystem": "arduino",
    "boardFqbn": "esp32:esp32:esp32c3",
    "filename": "device.ino",
    "source": "..."
  },
  "cad": {
    "engine": "cadquery",
    "filename": "enclosure.py",
    "source": "...",
    "expectedArtifacts": ["enclosure_body.step", "enclosure_body.stl", "enclosure_lid.step", "enclosure_lid.stl"]
  }
}
```

## Response

```json
{
  "firmware": {
    "status": "pass",
    "detail": "Compiled for ESP32-C3.",
    "artifactNames": ["device.bin"],
    "artifacts": [{"name":"device.bin","url":"https://signed.example/device.bin","sha256":"..."}],
    "logs": "...",
    "executor": "sandbox-v1"
  },
  "cad": {
    "status": "pass",
    "detail": "CadQuery executed; requested geometry files were produced.",
    "artifactNames": ["enclosure_body.step", "enclosure_body.stl", "enclosure_lid.step", "enclosure_lid.stl"],
    "artifacts": [{"name":"enclosure_body.step","url":"https://signed.example/enclosure_body.step","sha256":"..."}],
    "logs": "...",
    "executor": "sandbox-v1"
  }
}
```

Allowed status values are `not-run`, `queued`, `pass`, `fail`, `unavailable`, and `review`.

## Security requirements

The executor should run jobs in disposable, resource-limited sandboxes with outbound network access disabled by default, strict time/memory/file limits, no host secrets, no shared writable filesystem, artifact allowlists, and authenticated caller verification. Generated CAD source is code and must be treated as untrusted input.
