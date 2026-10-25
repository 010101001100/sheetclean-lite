# CSV Workbench prototype

This is a **prototype**, not yet a finished commercial product. Local Python 3.10+ CSV merger, deduplicator and column reordering tool.

```powershell
python csv_workbench.py a.csv b.csv -o output.csv --unique --columns id,name
```

Input files are never overwritten, existing output files are protected, UTF-8 BOM and CP932 are supported. Requires matching input headers. Next steps: GUI, Windows 11 testing, user documentation and acceptance testing.
