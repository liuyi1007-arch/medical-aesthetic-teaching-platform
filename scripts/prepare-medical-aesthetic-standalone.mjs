import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs"
import path from "node:path"

const projectRoot = process.cwd()
const standaloneRoot = path.join(projectRoot, ".next", "standalone")

function copyDirectory(source, target) {
    if (!existsSync(source)) {
        throw new Error(`缺少生产构建资源：${source}`)
    }

    rmSync(target, { recursive: true, force: true })
    mkdirSync(path.dirname(target), { recursive: true })
    cpSync(source, target, { recursive: true })
}

if (!existsSync(path.join(standaloneRoot, "server.js"))) {
    throw new Error("未找到 standalone 生产构建，请先运行 npm run build。")
}

copyDirectory(
    path.join(projectRoot, "public"),
    path.join(standaloneRoot, "public"),
)
copyDirectory(
    path.join(projectRoot, ".next", "static"),
    path.join(standaloneRoot, ".next", "static"),
)

console.log("本地静态资源已同步到 standalone 生产目录。")
