#!/usr/bin/env python3
import argparse
import hashlib
import re
import shutil
import zipfile
from pathlib import Path


def read_props(path: Path) -> dict[str, str]:
    props = {}
    for line in path.read_text(encoding="utf-8-sig").splitlines():
        if "=" in line and not line.lstrip().startswith("#"):
            key, value = line.split("=", 1)
            props.setdefault(key.strip(), value.strip())
    return props


def make_zip(source: Path, output: Path) -> None:
    with zipfile.ZipFile(output, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for path in sorted(p for p in source.rglob("*") if p.is_file()):
            relative = path.relative_to(source).as_posix()
            if ".zip" in path.name.lower() or any(part.startswith(".") for part in path.relative_to(source).parts):
                raise ValueError(f"refusing unexpected file: {path}")
            info = zipfile.ZipInfo(relative)
            info.compress_type = zipfile.ZIP_DEFLATED
            mode = 0o755 if path.suffix == ".sh" or relative.startswith("bin/") else 0o644
            info.external_attr = (mode & 0xFFFF) << 16
            archive.writestr(info, path.read_bytes())


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--webui", type=Path, required=True)
    parser.add_argument("--core", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args()

    web_props = read_props(args.webui / "module.prop")
    core_props = read_props(args.core / "module.prop")
    version = web_props["version"]
    code = web_props["versionCode"]
    if core_props.get("version") != version or core_props.get("versionCode") != code:
        raise SystemExit("core and WebUI versions must match")
    if not re.fullmatch(r"[0-9]+", code):
        raise SystemExit("versionCode must be numeric")

    if args.out.exists():
        shutil.rmtree(args.out)
    args.out.mkdir(parents=True)
    web_zip = args.out / f"FindingX-WebUI-{version}-{code}.zip"
    core_zip = args.out / f"FindingX-{version}-{code}.zip"
    make_zip(args.webui, web_zip)
    make_zip(args.core, core_zip)

    (args.out / "SHA256SUMS").write_text(
        f"{sha256(web_zip)}  {web_zip.name}\n{sha256(core_zip)}  {core_zip.name}\n",
        encoding="ascii",
    )
    (args.out / "RELEASE-METADATA.txt").write_text(
        f"version={version}\nversionCode={code}\ncore={core_zip.name}\nwebui={web_zip.name}\n",
        encoding="utf-8",
    )
    print(f"Built release artifacts in {args.out}")
    for artifact in sorted(args.out.iterdir()):
        print(f"{artifact.name}\t{artifact.stat().st_size} bytes")


if __name__ == "__main__":
    main()
