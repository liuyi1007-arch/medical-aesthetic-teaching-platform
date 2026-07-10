import { describe, expect, it } from "vitest"
import {
    assessProgress,
    createLearningReport,
} from "@/lib/medical-aesthetic/assessment"
import {
    createInitialProgress,
    DEMO_CASE,
    restoreProgress,
} from "@/lib/medical-aesthetic/demo-data"

describe("medical aesthetic teaching assessment", () => {
    it("starts with a zero score and four actionable recommendations", () => {
        const result = assessProgress(createInitialProgress())

        expect(result.total).toBe(0)
        expect(result.criteria).toHaveLength(4)
        expect(result.recommendations).toHaveLength(4)
    })

    it("scores a complete offline teaching flow deterministically", () => {
        const progress = createInitialProgress()
        progress.currentStep = "report"
        progress.caseLoaded = true
        progress.analysisCompleted = true
        progress.annotationReviewed = true
        progress.reportGenerated = true
        progress.layers = {
            thirds: true,
            fiveEyes: true,
            symmetry: true,
            contour: true,
        }
        progress.movedAnnotationIds = ["left-jaw"]
        progress.observation = "面部中轴基本居中，左右轮廓存在轻度差异"

        const result = assessProgress(progress)
        const report = createLearningReport(
            progress,
            DEMO_CASE.title,
            DEMO_CASE.findings,
        )

        expect(result.total).toBe(100)
        expect(result.criteria.every((item) => item.score === 25)).toBe(true)
        expect(report.assessment.total).toBe(100)
        expect(report.observation).toContain("面部中轴")
    })

    it("restores valid local state and falls back for malformed data", () => {
        const restored = restoreProgress(
            JSON.stringify({
                currentStep: "analysis",
                caseLoaded: true,
                layers: { thirds: true },
            }),
        )
        const fallback = restoreProgress("not-json")

        expect(restored.currentStep).toBe("analysis")
        expect(restored.caseLoaded).toBe(true)
        expect(restored.layers.thirds).toBe(true)
        expect(restored.layers.fiveEyes).toBe(false)
        expect(fallback).toEqual(createInitialProgress())
    })
})
