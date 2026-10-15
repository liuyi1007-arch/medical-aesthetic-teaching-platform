import { expect, getIframe, openSettings, test } from "./lib/fixtures"

test.describe("Smoke Tests", () => {
    test("public homepage loads the banquet exhibition without errors", async ({
        page,
    }) => {
        const errors: string[] = []
        page.on("pageerror", (err) => errors.push(err.message))
        page.on("console", (message) => {
            if (message.type() === "error") errors.push(message.text())
        })

        const response = await page.goto("/", { waitUntil: "networkidle" })
        expect(response?.ok()).toBe(true)
        await expect(page).toHaveURL(/\/(?:#.*)?$/)
        await expect(page).toHaveTitle("宴会设计与服务 · 课程虚拟展厅")
        await expect(page.getByRole("link", { name: "进入课程" })).toBeVisible()
        await expect(page.locator("#room-nav button")).toHaveCount(8)

        await page
            .getByRole("button", { name: "展厅总览", exact: true })
            .click()
        const overview = page.getByRole("dialog", {
            name: "八个展区，一场课程之旅",
        })
        await expect(overview).toBeVisible()
        await expect(
            overview.getByRole("button", { name: /课程定位/ }),
        ).toBeVisible()

        expect(errors).toEqual([])
    })

    test("English editor loads without errors", async ({ page }) => {
        const errors: string[] = []
        page.on("pageerror", (err) => errors.push(err.message))

        await page.goto("/en", { waitUntil: "networkidle" })
        await expect(page).toHaveTitle(/Draw\.io/i, { timeout: 10000 })

        const iframe = getIframe(page)
        await expect(iframe).toBeVisible({ timeout: 30000 })

        expect(errors).toEqual([])
    })

    test("Japanese locale page loads", async ({ page }) => {
        const errors: string[] = []
        page.on("pageerror", (err) => errors.push(err.message))

        await page.goto("/ja", { waitUntil: "networkidle" })
        await expect(page).toHaveTitle(/Draw\.io/i, { timeout: 10000 })

        const iframe = getIframe(page)
        await expect(iframe).toBeVisible({ timeout: 30000 })

        expect(errors).toEqual([])
    })

    test("settings dialog opens", async ({ page }) => {
        await page.goto("/en", { waitUntil: "networkidle" })
        await getIframe(page).waitFor({ state: "visible", timeout: 30000 })

        await openSettings(page)
    })
})
