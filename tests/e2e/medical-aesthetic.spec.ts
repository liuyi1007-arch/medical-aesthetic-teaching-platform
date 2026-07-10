import { expect, test } from "@playwright/test"

test.describe("medical aesthetic teaching platform", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/zh/medical-aesthetic")
        await page.evaluate(() => localStorage.clear())
        await page.reload()
    })

    test("completes the four-step offline teaching flow", async ({ page }) => {
        await page.setViewportSize({ width: 1366, height: 768 })
        await expect(
            page.getByRole("heading", { name: "医学美容设计教学平台" }),
        ).toBeVisible()
        await page.getByRole("button", { name: "载入示范案例" }).click()
        await page.getByRole("button", { name: "运行智能辅助分析" }).click()

        await expect(page.getByTestId("thirds-layer")).toBeVisible()
        await expect(page.getByTestId("symmetry-layer")).toBeVisible()

        await page.getByRole("button", { name: "进入标注练习" }).click()
        await page
            .getByRole("button", {
                name: "面部中轴基本居中，左右轮廓存在轻度差异",
            })
            .click()

        const marker = page.getByTestId("annotation-left-jaw")
        const markerBox = await marker.boundingBox()
        if (!markerBox) throw new Error("轮廓标注点未显示")
        await page.mouse.move(
            markerBox.x + markerBox.width / 2,
            markerBox.y + markerBox.height / 2,
        )
        await page.mouse.down()
        await page.mouse.move(markerBox.x + 18, markerBox.y - 9, { steps: 4 })
        await page.mouse.up()

        await page.getByRole("button", { name: "完成标注并评价" }).click()
        await page.getByRole("button", { name: "生成学习报告" }).click()

        const report = page.getByRole("dialog", {
            name: "医学美容设计学习任务报告",
        })
        await expect(report).toBeVisible()
        await expect(report.getByText("综合得分 / 100")).toBeVisible()
        await expect(report.getByText("100", { exact: true })).toBeVisible()
        await expect(report).toContainText("不构成医疗诊断")
        await page.screenshot({
            path: "test-results/medical-aesthetic-report.png",
            animations: "disabled",
        })
    })

    test("persists progress and supports a one-click reset", async ({
        page,
    }) => {
        await page.getByRole("button", { name: "载入示范案例" }).click()
        await page.reload()
        await expect(
            page.getByRole("button", { name: "运行智能辅助分析" }),
        ).toBeVisible()

        await page.getByRole("button", { name: "重置演示" }).click()
        await expect(
            page.getByRole("button", { name: "载入示范案例" }),
        ).toBeVisible()
        await expect(page.getByText("等待载入示范案例")).toBeVisible()
    })

    test("keeps key controls visible at both target presentation sizes", async ({
        page,
    }) => {
        const externalRequests: string[] = []
        page.on("request", (request) => {
            const url = new URL(request.url())
            if (!["localhost", "127.0.0.1"].includes(url.hostname)) {
                externalRequests.push(request.url())
            }
        })

        for (const viewport of [
            { width: 1920, height: 1080, name: "1920x1080" },
            { width: 1366, height: 768, name: "1366x768" },
        ]) {
            await page.setViewportSize(viewport)
            await page.goto("/zh/medical-aesthetic")
            await page.evaluate(() => localStorage.clear())
            await page.reload()
            await page.getByRole("button", { name: "载入示范案例" }).click()
            await page.getByRole("button", { name: "运行智能辅助分析" }).click()

            await expect(
                page.getByRole("heading", { name: "评价量表" }),
            ).toBeVisible()
            await expect(
                page.getByRole("button", { name: "进入标注练习" }),
            ).toBeVisible()
            await page.screenshot({
                path: `test-results/medical-aesthetic-${viewport.name}.png`,
                animations: "disabled",
            })
        }

        expect(externalRequests).toEqual([])
    })
})
