# Gemini API 负载均衡器 (gemini-balance-do)

部署在 **Cloudflare Workers** 上的 Gemini API 负载均衡与代理服务，使用 **Durable Objects** 管理 API 密钥。请求会经美国节点转发至 Gemini，解决地区限制问题。

## 特性

- **多密钥负载均衡**：聚合多个 Gemini API 密钥，随机轮询分配请求
- **OpenAI 兼容**：支持 `/v1/chat/completions`、`/v1/embeddings`、`/v1/models` 等端点
- **密钥透传模式**：可选仅作代理，透传客户端 key，不做多 key 均衡
- **流式响应**：完整支持流式输出
- **密钥管理**：Web 管理面板批量添加/查看/校验/清理密钥，Durable Objects + SQLite 持久化

## 快速开始

### 前置要求

- [Node.js](https://nodejs.org/) 18+
- [pnpm](https://pnpm.io/)（或 npm / yarn）
- [Cloudflare](https://dash.cloudflare.com/) 账号

### 部署步骤

```bash
# 克隆并进入项目
git clone https://github.com/zaunist/gemini-balance-do.git
cd gemini-balance-do

# 安装依赖
pnpm install

# 登录 Cloudflare
npx wrangler login

# 部署
pnpm run deploy
```

部署成功后，终端会输出 Worker 地址（如 `https://gemini-balance-do.<your-subdomain>.workers.dev`）。

### 通过 Cloudflare Dashboard 部署（推荐）

1. **Fork** 本仓库到你的 GitHub 账号
2. 打开 [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages**
3. **创建应用程序** → **连接到 Git** → 选择 Fork 的仓库
4. 构建配置通常可自动识别，点击 **保存并部署**

---

## 配置

在 Cloudflare Worker 的 **设置 → 变量和密钥** 中配置以下变量（建议将敏感项设为 **加密变量/Secret**）：

| 变量名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `AUTH_KEY` | 明文/Secret | `ajielu` | 调用 Gemini/OpenAI 兼容 API 时的认证密钥；透传模式下可不认证 |
| `HOME_ACCESS_KEY` | 明文/Secret | *(见 wrangler)* | 管理面板登录密码，**务必修改** |
| `FORWARD_CLIENT_KEY_ENABLED` | 明文 | `false` | 为 `true` 时透传客户端 key，仅作代理，无多 key 负载均衡 |

**透传模式下**，客户端 API Key 可通过以下任一方式传递：

- Query: `?key=your_api_key`
- Header: `x-goog-api-key: your_api_key`
- Header: `Authorization: Bearer your_api_key`

> **安全建议**：在生产环境中务必修改 `HOME_ACCESS_KEY` 和 `AUTH_KEY`，并优先使用 **Secrets** 存储。

---

## 使用方式

在各类 AI 客户端中配置：

- **Base URL**：`https://<你的-worker>.workers.dev`
- **API Key**：  
  - 未开启透传：填写配置的 `AUTH_KEY`  
  - 已开启透传：填写你自己的 Gemini API Key

### 管理面板

- 浏览器打开 Worker 地址，使用 **HOME_ACCESS_KEY** 登录
- 支持：批量添加密钥（每行一个）、查看列表、刷新、一键检查有效性、批量删除无效密钥

---

## API 说明

### 兼容 OpenAI 的请求

使用 **AUTH_KEY** 认证即可（透传模式下可使用客户端 key），无需管理权限。

- `POST /v1/chat/completions` — 聊天补全
- `POST /v1/embeddings` — 嵌入
- `GET /v1/models` — 模型列表

### 管理 API（需管理权限）

请求头需携带：`Authorization: Bearer <HOME_ACCESS_KEY>` 或 Cookie `auth-key`。

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/api/keys` | 获取已存储的 API 密钥列表 |
| `POST` | `/api/keys` | 批量添加密钥，Body: `{"keys": ["key1", "key2"]}` |
| `GET` | `/api/keys/check` | 检查所有密钥有效性 |
| `DELETE` | `/api/keys` | 批量删除密钥，Body: `{"keys": ["key1", "key2"]}` |

---

## 本地开发

```bash
pnpm run dev   # 或 pnpm start
```

本地会启动 Wrangler 开发服务器，可在 `wrangler.toml` / `wrangler.jsonc` 中配置本地变量。

---

## 致谢

- [gemini-balance-lite](https://github.com/tech-shrimp/gemini-balance-lite)
- [Cloudflare Workers & Durable Objects](https://www.cloudflare.com/)
