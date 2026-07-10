import type {
    DemoCase,
    DemoProgress,
    DemoStep,
    LayerVisibility,
    PointAnnotation,
} from "@/lib/medical-aesthetic/types"

export const STORAGE_KEY = "cqact-medical-aesthetic-demo-v1"

export const DEMO_STEPS: DemoStep[] = [
    {
        id: "case",
        index: 1,
        title: "载入示范案例",
        shortTitle: "示范案例",
        description: "读取本地合成人像与学习任务，不涉及真实个人信息。",
    },
    {
        id: "analysis",
        index: 2,
        title: "智能辅助分析",
        shortTitle: "美学分析",
        description: "分层观察三庭、五眼与面部中轴，形成结构化分析。",
    },
    {
        id: "annotation",
        index: 3,
        title: "方案标注练习",
        shortTitle: "方案标注",
        description: "调整轮廓参考点并选取规范的教学观察表述。",
    },
    {
        id: "report",
        index: 4,
        title: "生成学习报告",
        shortTitle: "学习报告",
        description: "汇总画布、分析结论、四维评分与改进建议。",
    },
]

export const OBSERVATION_OPTIONS = [
    "面部中轴基本居中，左右轮廓存在轻度差异",
    "三庭比例整体协调，下庭参考点建议进一步复核",
    "五眼分区较为均衡，双侧外轮廓需结合动态表情观察",
]

export const DEFAULT_ANNOTATIONS: PointAnnotation[] = [
    { id: "left-temple", kind: "temple", label: "左颞侧", x: 182, y: 326 },
    { id: "right-temple", kind: "temple", label: "右颞侧", x: 618, y: 326 },
    { id: "left-cheek", kind: "cheek", label: "左颧侧", x: 162, y: 468 },
    { id: "right-cheek", kind: "cheek", label: "右颧侧", x: 638, y: 468 },
    { id: "left-jaw", kind: "jaw", label: "左下颌", x: 225, y: 650 },
    { id: "right-jaw", kind: "jaw", label: "右下颌", x: 575, y: 650 },
    { id: "chin", kind: "chin", label: "颏点", x: 400, y: 746 },
]

export const DEMO_CASE: DemoCase = {
    id: "synthetic-face-01",
    title: "面部比例与对称性分析",
    imageSrc: "/medical-aesthetic/synthetic-face.png",
    subjectLabel: "合成示范人像 01",
    teachingGoal: "掌握三庭五眼参照、面部中轴观察和轮廓关键点规范标注。",
    findings: [
        "三庭边界清晰，整体比例接近协调区间",
        "五眼分区可作为横向比例观察参考",
        "面部中轴基本居中，双侧外轮廓存在轻度差异",
        "结论仅用于课堂观察训练，不构成医疗判断",
    ],
    referenceAnnotations: DEFAULT_ANNOTATIONS,
}

const DEFAULT_LAYERS: LayerVisibility = {
    thirds: false,
    fiveEyes: false,
    symmetry: false,
    contour: false,
}

export function createInitialProgress(): DemoProgress {
    return {
        currentStep: "case",
        caseLoaded: false,
        analysisCompleted: false,
        annotationReviewed: false,
        reportGenerated: false,
        layers: { ...DEFAULT_LAYERS },
        annotations: DEFAULT_ANNOTATIONS.map((annotation) => ({
            ...annotation,
        })),
        movedAnnotationIds: [],
        observation: "",
    }
}

export function restoreProgress(value: string | null): DemoProgress {
    if (!value) return createInitialProgress()

    try {
        const parsed = JSON.parse(value) as Partial<DemoProgress>
        const initial = createInitialProgress()
        return {
            ...initial,
            ...parsed,
            layers: { ...initial.layers, ...parsed.layers },
            annotations:
                Array.isArray(parsed.annotations) &&
                parsed.annotations.length > 0
                    ? parsed.annotations
                    : initial.annotations,
            movedAnnotationIds: Array.isArray(parsed.movedAnnotationIds)
                ? parsed.movedAnnotationIds
                : [],
        }
    } catch {
        return createInitialProgress()
    }
}
