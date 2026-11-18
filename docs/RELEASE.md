# FindingX 云端构建与发布

## 当前构建输入

使用以下目录作为正式发布输入：

- 核心模块：`modules/core`
- WebUI 模块：`modules/webui`

也可通过 `CORE_DIR` 和 `WEBUI_DIR` 环境变量覆盖脚本路径。

## 本地验证

在 Linux、WSL 或 Git Bash 中运行：

```bash
bash scripts/validate-release.sh
```

## 本地构建

```bash
bash scripts/build-release.sh
```

产物写入 `dist/`，包括两个 ZIP、`SHA256SUMS` 和 `RELEASE-METADATA.txt`。

## GitHub Actions

- `validate.yml`：每次 push 和 pull request 执行语法及发布契约检查。
- `build.yml`：手动触发或推送 `v*` 标签时构建 ZIP，并上传为 Actions artifact。

当前工作流不会自动发布 GitHub Release，也不会连接 Android 设备。设备安装和真实运行验证仍需要维护者在本地完成。

## 发布前检查

1. 先让 `validate.yml` 通过。
2. 在至少一台目标设备上验证安装、升级、`status`、IFAS 和 SF。
3. 创建版本标签，例如 `v0.0.6-rc.1`。
4. 下载 Actions artifact，核对 `SHA256SUMS` 后再发布。
