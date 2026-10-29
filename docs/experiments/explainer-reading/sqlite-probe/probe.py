#!/usr/bin/env python3
"""Observe WAL snapshots and passive checkpoint progress without persistent data."""
import json
import platform
import sqlite3
import tempfile
from pathlib import Path

with tempfile.TemporaryDirectory(prefix="sqlite-wal-probe-") as directory:
    path = str(Path(directory) / "probe.db")
    writer = sqlite3.connect(path, isolation_level=None)
    reader = sqlite3.connect(path, isolation_level=None)
    try:
        mode = writer.execute("PRAGMA journal_mode=WAL").fetchone()[0]
        assert mode == "wal", f"WAL unavailable: {mode}"
        writer.execute("PRAGMA wal_autocheckpoint=0")
        writer.execute("CREATE TABLE item (value TEXT NOT NULL)")
        writer.execute("INSERT INTO item VALUES ('A')")
        initial_checkpoint = writer.execute("PRAGMA wal_checkpoint(TRUNCATE)").fetchone()
        assert initial_checkpoint[0] == 0, initial_checkpoint

        reader.execute("BEGIN")
        before = reader.execute("SELECT value FROM item").fetchone()[0]
        writer.execute("UPDATE item SET value = 'B'")
        during_checkpoint = writer.execute("PRAGMA wal_checkpoint(PASSIVE)").fetchone()
        during = reader.execute("SELECT value FROM item").fetchone()[0]
        reader.execute("COMMIT")
        after_checkpoint = writer.execute("PRAGMA wal_checkpoint(PASSIVE)").fetchone()
        fresh = reader.execute("SELECT value FROM item").fetchone()[0]

        assert before == during == "A", (before, during)
        assert fresh == "B", fresh
        assert during_checkpoint[0] == after_checkpoint[0] == 0
        assert during_checkpoint[2] < during_checkpoint[1], during_checkpoint
        assert after_checkpoint[2] == after_checkpoint[1], after_checkpoint
        print(json.dumps({
            "python_version": platform.python_version(),
            "sqlite_version": sqlite3.sqlite_version,
            "journal_mode": mode,
            "reader_before_write": before,
            "writer_committed": "B",
            "checkpoint_with_reader": dict(zip(("busy", "log_frames", "checkpointed_frames"), during_checkpoint)),
            "reader_after_write": during,
            "checkpoint_after_reader": dict(zip(("busy", "log_frames", "checkpointed_frames"), after_checkpoint)),
            "fresh_reader": fresh,
        }, ensure_ascii=False, indent=2))
    finally:
        reader.close()
        writer.close()
