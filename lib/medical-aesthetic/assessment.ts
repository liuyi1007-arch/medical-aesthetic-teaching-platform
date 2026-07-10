import type {
    AssessmentResult,
    DemoProgress,
    LearningReport,
    RubricCriterion,
} from "@/lib/medical-aesthetic/types"

function criterion(
    id: RubricCriterion["id"],
    label: string,
    score: number,
    feedback: string,
): RubricCriterion {
    return { id, label, maxScore: 25, score, feedback }
}

export function assessProgress(progress: DemoProgress): AssessmentResult {
    const proportionScore =
        (progress.caseLoaded ? 9 : 0) +
        (progress.layers.thirds ? 8 : 0) +
        (progress.layers.fiveEyes ? 8 : 0)
    const symmetryScore =
        (progress.analysisCompleted ? 8 : 0) +
        (progress.layers.symmetry ? 12 : 0) +
        (progress.observation ? 5 : 0)
    const annotationScore =
        (progress.layers.contour ? 8 : 0) +
        (progress.movedAnnotationIds.length > 0 ? 9 : 0) +
        (progress.annotationReviewed ? 8 : 0)
    const expressionScore =
        (progress.analysisCompleted ? 6 : 0) +
        (progress.observation ? 7 : 0) +
        (progress.annotationReviewed ? 7 : 0) +
        (progress.reportGenerated ? 5 : 0)

    const criteria = [
        criterion(
            "proportion",
            "比例分析",
            proportionScore,
            proportionScore === 25
                ? "三庭与五眼参照完整"
                : "请补充三庭和五眼参照层",
        ),
        criterion(
            "symmetry",
            "对称性判断",
            symmetryScore,
            symmetryScore === 25
                ? "中轴观察与结论表达完整"
                : "请显示中轴并选择观察结论",
        ),
        criterion(
            "annotation",
            "标注规范",
            annotationScore,
            annotationScore === 25
                ? "轮廓点调整与确认符合要求"
                : "请调整至少一个轮廓点并完成确认",
        ),
        criterion(
            "expression",
            "表达完整",
            expressionScore,
            expressionScore === 25
                ? "学习任务表达闭环完整"
                : "请完成观察、标注确认和报告生成",
        ),
    ]

    const recommendations = criteria
        .filter((item) => item.score < item.maxScore)
        .map((item) => item.feedback)

    return {
        total: criteria.reduce((sum, item) => sum + item.score, 0),
        criteria,
        recommendations:
            recommendations.length > 0
                ? recommendations
                : ["本次示范任务已完成，可复位后再次练习不同标注路径。"],
    }
}

export function createLearningReport(
    progress: DemoProgress,
    caseTitle: string,
    findings: string[],
): LearningReport {
    return {
        caseTitle,
        observation: progress.observation || "尚未形成观察结论",
        findings,
        assessment: assessProgress(progress),
        generatedAt: "本地教学示范",
    }
}
