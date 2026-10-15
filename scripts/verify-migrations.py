"""Offline rehearsal of both recovered histories; no remote DB connection."""
import json
import pathlib
import sqlite3

root = pathlib.Path(__file__).resolve().parents[1]
journal = json.loads((root / "drizzle/meta/_journal.json").read_text())["entries"]
files = {path.stem: path for path in (root / "drizzle").glob("*.sql")}
assert set(files) == {entry["tag"] for entry in journal}, "SQL/journal mismatch"
assert [entry["idx"] for entry in journal] == list(range(len(journal)))
assert all(a["when"] < b["when"] for a, b in zip(journal, journal[1:]))
ordered = [files[entry["tag"]] for entry in journal]
registry = files["0007_device_registry_foundation"]
market = [p for p in ordered if "market" in p.name]
base = [p for p in ordered if p != registry and p not in market]
snapshot = json.loads((root / "drizzle/meta/0012_snapshot.json").read_text())
for label, migrations in [("fresh journal", ordered), ("registry-first upgrade", base + [registry] + market), ("market-first upgrade", base + market + [registry])]:
    db = sqlite3.connect(":memory:")
    db.execute("PRAGMA foreign_keys=ON")
    for index, path in enumerate(migrations):
        db.executescript(path.read_text())
        if index == 0:
            db.execute("INSERT INTO suppression_entries (id, channel_hash, channel, reason) VALUES ('synthetic', 'hash-test', 'sms', 'opt-out')")
        if path == registry:
            for person in ["alice", "bob"]:
                db.execute("INSERT INTO device_registry_records (id, registrant_subject, manufacturer, model, category) VALUES (?, ?, 'Lab', 'Sensor', 'sensor')", (person, person))
        assert db.execute("SELECT reason FROM suppression_entries WHERE id='synthetic'").fetchone() == ("opt-out",)
    assert db.execute("PRAGMA integrity_check").fetchone() == ("ok",)
    assert db.execute("PRAGMA foreign_key_check").fetchall() == []
    for person in ["alice", "bob"]:
        assert db.execute("SELECT id, trust_state FROM device_registry_records WHERE registrant_subject=?", (person,)).fetchall() == [(person, "registered")]
    tables = {row[0] for row in db.execute("SELECT name FROM sqlite_master WHERE type='table'")}
    assert tables == set(snapshot["tables"]), (tables ^ set(snapshot["tables"]))
    for name, definition in snapshot["tables"].items():
        columns = {row[1]: row[2].lower() for row in db.execute(f'PRAGMA table_info("{name}")')}
        assert columns == {key: value["type"].lower() for key, value in definition["columns"].items()}, name
        indexes = {row[1] for row in db.execute(f'PRAGMA index_list("{name}")') if not row[1].startswith("sqlite_autoindex")}
        assert indexes == set(definition["indexes"]), name
    print(f"PASS {label}: {len(migrations)} migrations, {len(tables)} tables; existing rows preserved; snapshot columns/indexes match; 0 FK violations")
print("PASS 3 migration paths; no historical SQL modified")
