import sys
from pathlib import Path

PLUGIN = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PLUGIN / "engines"))
sys.path.insert(0, str(PLUGIN / "hooks"))
