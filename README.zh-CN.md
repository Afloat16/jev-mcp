# jev-mcp

**非官方、社区维护的 TypeSafe AI Jev MCP Server。**

[English](README.md)

`jev-mcp` 把 TypeSafe AI 的 Jev 决策模型暴露为 4 个保守的、只读的 MCP
工具。设计目标不是替代主模型，而是在主模型已经检查过相关上下文之后，为**边界明确的
决策**提供结构化、概率化的第二意见。

> 本项目与 TypeSafe AI、OpenAI 均无隶属、赞助、背书或官方产品关系。

## 核心原则

```text
编译器 / 测试 / 运行结果等确定性证据
        >
主模型基于项目上下文的推理
        >
Jev 的概率性建议
```

Jev 的最高概率选项不是事实，也不是执行高风险动作的授权。

如果你的日常用法只是“让一个强 coding 模型解决单个问题”，只安装 TypeSafe 官方
agent skill 往往更简单。这个 MCP 更适合需要**固定工具边界、结构化输出、概率阈值、
自动化 agent/CI 工作流**的场景。

## 提供的工具

| 工具 | 用途 |
| --- | --- |
| `jev_decide` | 在 2–255 个明确选项中获得第二意见 |
| `jev_route` | 在明确的工具 / 子系统 / 工作流路径中路由 |
| `jev_risk_score` | low / medium / high / critical 风险信号 |
| `jev_gate` | 把 yes/no 概率与指定阈值比较 |

这些工具只发起 TypeSafe API 请求，不会修改文件、执行 shell、部署系统或切换你选择的
主模型。

## 安装

要求：Node.js 20+、TypeSafe API key，以及能够启动本地 stdio MCP 的客户端。

macOS / Linux：

```bash
./setup.sh
```

Windows PowerShell：

```powershell
./setup.ps1
```

API key 会保存在本地 `.env`，该文件已被 Git 忽略。不要把 key 放进源码、README、
`AGENTS.md`、Codex 配置或 GitHub Issue。

## Codex 配置示例

把下面内容加入 `~/.codex/config.toml`，并替换绝对路径：

```toml
[mcp_servers.jev]
command = "node"
args = ["/ABSOLUTE/PATH/TO/jev-mcp/dist/index.js"]
```

如果希望 Codex 跨项目采用 conservative policy，可以把：

```text
codex/AGENTS.jev-conservative.md
```

中的内容合并到自己的 `~/.codex/AGENTS.md`。

## 配置项

| 环境变量 | 必须 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `TYPESAFE_API_KEY` | 是 | — | TypeSafe credential |
| `JEV_MODEL` | 否 | `jev-latest` | Jev 模型覆盖 |
| `TYPESAFE_BASE_URL` | 否 | `https://api.typesafe.ai` | API 地址 |
| `TYPESAFE_TIMEOUT_MS` | 否 | `15000` | 250–120000 ms 请求超时 |
| `JEV_ENV_FILE` | 否 | 项目 `.env` | 指定其他 env 文件 |

## 隐私与安全

传给 Jev 工具的 `state` 会发送到配置的 TypeSafe API endpoint。只发送完成决策所需的
最小、脱敏内容；不要发送密码、API key、token、私钥、客户数据、受监管数据或无关的
专有源码。

详细边界见 [docs/SECURITY-MODEL.md](docs/SECURITY-MODEL.md)。

## 检查

不会联网调用 Jev 的本地检查：

```bash
npm run doctor
npm run check
```

MCP Inspector：

```bash
npm run inspect
```

Inspector 中真正调用工具时，会使用你的 TypeSafe 账户，并可能消耗其额度。

## Skill 与 MCP 的区别

```text
TypeSafe Skill -> 教 agent 理解 Jev 和推荐模式
jev-mcp        -> 提供稳定、可执行的 MCP 工具接口
主模型          -> 仍是主要推理者和最终决策者
```

日常交互式 coding 可以只用 Skill；需要自动化、固定 schema、概率 gate、CI/agent
工作流时，MCP 更有价值。

## 开源发布

仓库已经包含 CI、自动 GitHub Release、Dependabot、Issue/PR 模板、密钥扫描与发布脚本。

配置好 Git 和 GitHub CLI 后：

```bash
./scripts/publish-github.sh jev-mcp public
```

PowerShell：

```powershell
./scripts/publish-github.ps1 -RepoName jev-mcp -Visibility public
```

详见 [docs/RELEASING.md](docs/RELEASING.md)。

## License

MIT，见 [LICENSE](LICENSE)。本许可证只覆盖本仓库代码；TypeSafe AI、OpenAI 等第三方
服务、名称和商标仍受各自条款与权利约束，见 [NOTICE](NOTICE)。
