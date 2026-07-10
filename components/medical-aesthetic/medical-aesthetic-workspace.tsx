"use client"

import {
    BookOpenCheck,
    Check,
    ChevronRight,
    CircleDot,
    FileText,
    GraduationCap,
    Info,
    Move,
    PanelTopOpen,
    RotateCcw,
    ScanFace,
    Sparkles,
    Target,
    X,
} from "lucide-react"
import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import {
    assessProgress,
    createLearningReport,
} from "@/lib/medical-aesthetic/assessment"
import {
    createInitialProgress,
    DEMO_CASE,
    DEMO_STEPS,
    OBSERVATION_OPTIONS,
    restoreProgress,
    STORAGE_KEY,
} from "@/lib/medical-aesthetic/demo-data"
import type {
    DemoProgress,
    DemoStepId,
    LayerVisibility,
} from "@/lib/medical-aesthetic/types"
import { FaceAnalysisCanvas } from "./face-analysis-canvas"
import styles from "./medical-aesthetic.module.css"

const layerControls: Array<{
    id: keyof LayerVisibility
    label: string
    shortLabel: string
}> = [
    { id: "thirds", label: "三庭分界", shortLabel: "三庭" },
    { id: "fiveEyes", label: "五眼参照", shortLabel: "五眼" },
    { id: "symmetry", label: "面部中轴", shortLabel: "中轴" },
    { id: "contour", label: "轮廓关键点", shortLabel: "轮廓" },
]

function stepCompleted(stepId: DemoStepId, progress: DemoProgress) {
    if (stepId === "case") return progress.caseLoaded
    if (stepId === "analysis") return progress.analysisCompleted
    if (stepId === "annotation") return progress.annotationReviewed
    return progress.reportGenerated
}

export function MedicalAestheticWorkspace() {
    const [progress, setProgress] = useState<DemoProgress>(
        createInitialProgress,
    )
    const [hydrated, setHydrated] = useState(false)
    const [reportOpen, setReportOpen] = useState(false)

    useEffect(() => {
        setProgress(restoreProgress(localStorage.getItem(STORAGE_KEY)))
        setHydrated(true)
    }, [])

    useEffect(() => {
        if (hydrated)
            localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
    }, [hydrated, progress])

    const assessment = useMemo(() => assessProgress(progress), [progress])
    const report = useMemo(
        () =>
            createLearningReport(progress, DEMO_CASE.title, DEMO_CASE.findings),
        [progress],
    )
    const currentStep =
        DEMO_STEPS.find((step) => step.id === progress.currentStep) ??
        DEMO_STEPS[0]
    const currentIndex = DEMO_STEPS.findIndex(
        (step) => step.id === progress.currentStep,
    )

    const updateProgress = (updates: Partial<DemoProgress>) => {
        setProgress((current) => ({ ...current, ...updates }))
    }

    const runPrimaryAction = () => {
        if (progress.currentStep === "case") {
            updateProgress({ caseLoaded: true, currentStep: "analysis" })
            return
        }

        if (
            progress.currentStep === "analysis" &&
            !progress.analysisCompleted
        ) {
            setProgress((current) => ({
                ...current,
                analysisCompleted: true,
                layers: {
                    thirds: true,
                    fiveEyes: true,
                    symmetry: true,
                    contour: false,
                },
            }))
            return
        }

        if (progress.currentStep === "analysis") {
            updateProgress({
                currentStep: "annotation",
                layers: { ...progress.layers, contour: true },
            })
            return
        }

        if (progress.currentStep === "annotation") {
            updateProgress({ annotationReviewed: true, currentStep: "report" })
            return
        }

        setProgress((current) => ({ ...current, reportGenerated: true }))
        setReportOpen(true)
    }

    const primaryLabel =
        progress.currentStep === "case"
            ? "载入示范案例"
            : progress.currentStep === "analysis" && !progress.analysisCompleted
              ? "运行智能辅助分析"
              : progress.currentStep === "analysis"
                ? "进入标注练习"
                : progress.currentStep === "annotation"
                  ? "完成标注并评价"
                  : progress.reportGenerated
                    ? "查看学习报告"
                    : "生成学习报告"

    const primaryDisabled =
        progress.currentStep === "annotation" &&
        (!progress.observation || progress.movedAnnotationIds.length === 0)

    const resetDemo = () => {
        const initial = createInitialProgress()
        setProgress(initial)
        localStorage.removeItem(STORAGE_KEY)
        setReportOpen(false)
    }

    const toggleLayer = (layer: keyof LayerVisibility) => {
        if (!progress.analysisCompleted) return
        setProgress((current) => ({
            ...current,
            layers: { ...current.layers, [layer]: !current.layers[layer] },
        }))
    }

    const moveAnnotation = (id: string, x: number, y: number) => {
        setProgress((current) => ({
            ...current,
            annotations: current.annotations.map((annotation) =>
                annotation.id === id ? { ...annotation, x, y } : annotation,
            ),
            movedAnnotationIds: current.movedAnnotationIds.includes(id)
                ? current.movedAnnotationIds
                : [...current.movedAnnotationIds, id],
        }))
    }

    return (
        <main className={styles.platformShell}>
            <header className={styles.topBar}>
                <div className={styles.brandGroup}>
                    <Image
                        className={styles.schoolBrand}
                        src="/medical-aesthetic/school-brand.png"
                        alt="重庆建筑科技职业学院"
                        width={252}
                        height={50}
                        priority
                    />
                    <div className={styles.brandDivider} />
                    <div>
                        <p className={styles.department}>智慧康养学院</p>
                        <h1>医学美容设计教学平台</h1>
                    </div>
                </div>
                <div className={styles.headerActions}>
                    <div className={styles.offlineBadge}>
                        <span />
                        本地教学环境
                    </div>
                    {progress.reportGenerated && (
                        <button
                            className={styles.headerButton}
                            type="button"
                            onClick={() => setReportOpen(true)}
                        >
                            <FileText size={17} />
                            查看报告
                        </button>
                    )}
                    <button
                        className={styles.headerButton}
                        type="button"
                        onClick={resetDemo}
                    >
                        <RotateCcw size={17} />
                        重置演示
                    </button>
                </div>
            </header>

            <div className={styles.contentGrid}>
                <aside className={`${styles.panel} ${styles.taskPanel}`}>
                    <div className={styles.panelHeading}>
                        <div>
                            <span className={styles.eyebrow}>
                                TEACHING TASK
                            </span>
                            <h2>课堂任务</h2>
                        </div>
                        <span className={styles.taskCode}>MA-01</span>
                    </div>

                    <div className={styles.caseBrief}>
                        <ScanFace size={21} />
                        <div>
                            <strong>{DEMO_CASE.title}</strong>
                            <span>{DEMO_CASE.subjectLabel}</span>
                        </div>
                    </div>

                    <nav className={styles.stepList} aria-label="教学任务步骤">
                        {DEMO_STEPS.map((step, index) => {
                            const completed = stepCompleted(step.id, progress)
                            const active = step.id === progress.currentStep
                            const accessible =
                                index <= currentIndex || completed
                            return (
                                <button
                                    key={step.id}
                                    className={`${styles.stepItem} ${active ? styles.stepActive : ""} ${completed ? styles.stepComplete : ""}`}
                                    type="button"
                                    disabled={!accessible}
                                    onClick={() =>
                                        updateProgress({ currentStep: step.id })
                                    }
                                >
                                    <span className={styles.stepNumber}>
                                        {completed ? (
                                            <Check size={15} strokeWidth={3} />
                                        ) : (
                                            step.index
                                        )}
                                    </span>
                                    <span className={styles.stepCopy}>
                                        <strong>{step.shortTitle}</strong>
                                        <small>{step.description}</small>
                                    </span>
                                    <ChevronRight size={16} />
                                </button>
                            )
                        })}
                    </nav>

                    <div className={styles.taskFooter}>
                        <div className={styles.progressMeta}>
                            <span>任务进度</span>
                            <strong>
                                {Math.round(
                                    (Math.max(currentIndex, 0) / 3) * 100,
                                )}
                                %
                            </strong>
                        </div>
                        <div className={styles.progressTrack}>
                            <span
                                style={{
                                    width: `${(Math.max(currentIndex, 0) / 3) * 100}%`,
                                }}
                            />
                        </div>
                        <button
                            className={styles.primaryButton}
                            type="button"
                            disabled={primaryDisabled}
                            onClick={runPrimaryAction}
                        >
                            {progress.currentStep === "analysis" ? (
                                <Sparkles size={18} />
                            ) : progress.currentStep === "report" ? (
                                <FileText size={18} />
                            ) : (
                                <PanelTopOpen size={18} />
                            )}
                            {primaryLabel}
                        </button>
                        {primaryDisabled && (
                            <p className={styles.actionHint}>
                                请先拖动一个轮廓点，并选择一条观察结论。
                            </p>
                        )}
                    </div>
                </aside>

                <section className={`${styles.panel} ${styles.designPanel}`}>
                    <div className={styles.designHeader}>
                        <div>
                            <span className={styles.eyebrow}>
                                STEP {currentStep.index} / 4
                            </span>
                            <h2>{currentStep.title}</h2>
                            <p>{currentStep.description}</p>
                        </div>
                        <div className={styles.statusStamp}>
                            <CircleDot size={16} />
                            {progress.analysisCompleted
                                ? "分析图层已就绪"
                                : "等待教学操作"}
                        </div>
                    </div>

                    <div className={styles.canvasLayout}>
                        <div className={styles.canvasFrame}>
                            <div className={styles.canvasRail}>
                                <span>FRONTAL / 01</span>
                                <span>正面标准视图</span>
                            </div>
                            <FaceAnalysisCanvas
                                imageSrc={DEMO_CASE.imageSrc}
                                loaded={progress.caseLoaded}
                                layers={progress.layers}
                                annotations={progress.annotations}
                                observation={progress.observation}
                                interactive={
                                    progress.currentStep === "annotation"
                                }
                                onAnnotationMove={moveAnnotation}
                            />
                        </div>

                        <div className={styles.canvasTools}>
                            <div className={styles.toolSection}>
                                <span className={styles.toolLabel}>
                                    分析图层
                                </span>
                                <div className={styles.layerButtons}>
                                    {layerControls.map((layer) => (
                                        <button
                                            key={layer.id}
                                            className={`${styles.layerButton} ${progress.layers[layer.id] ? styles.layerActive : ""}`}
                                            type="button"
                                            disabled={
                                                !progress.analysisCompleted
                                            }
                                            title={layer.label}
                                            onClick={() =>
                                                toggleLayer(layer.id)
                                            }
                                        >
                                            <Target size={15} />
                                            {layer.shortLabel}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.toolSection}>
                                <span className={styles.toolLabel}>
                                    教学观察
                                </span>
                                <div className={styles.observationList}>
                                    {OBSERVATION_OPTIONS.map((option) => (
                                        <button
                                            key={option}
                                            className={`${styles.observationOption} ${progress.observation === option ? styles.observationSelected : ""}`}
                                            type="button"
                                            disabled={
                                                !progress.analysisCompleted
                                            }
                                            onClick={() =>
                                                updateProgress({
                                                    observation: option,
                                                })
                                            }
                                        >
                                            <span>
                                                {progress.observation ===
                                                option ? (
                                                    <Check size={14} />
                                                ) : null}
                                            </span>
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.dragInstruction}>
                                <Move size={18} />
                                <div>
                                    <strong>轮廓点调整</strong>
                                    <span>
                                        {progress.movedAnnotationIds.length > 0
                                            ? `已调整 ${progress.movedAnnotationIds.length} 个参考点`
                                            : "进入第 3 步后拖动青色参考点"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <aside className={`${styles.panel} ${styles.rubricPanel}`}>
                    <div className={styles.panelHeading}>
                        <div>
                            <span className={styles.eyebrow}>
                                LEARNING RUBRIC
                            </span>
                            <h2>评价量表</h2>
                        </div>
                        <BookOpenCheck size={22} />
                    </div>

                    <div className={styles.scorePlate}>
                        <div
                            className={styles.scoreRing}
                            style={
                                {
                                    "--score": assessment.total,
                                } as React.CSSProperties
                            }
                        >
                            <div>
                                <strong>{assessment.total}</strong>
                                <span>/ 100</span>
                            </div>
                        </div>
                        <div>
                            <span>当前任务得分</span>
                            <strong>
                                {assessment.total === 100
                                    ? "任务完成"
                                    : "持续完善中"}
                            </strong>
                        </div>
                    </div>

                    <div className={styles.rubricList}>
                        {assessment.criteria.map((item) => (
                            <article
                                className={styles.rubricItem}
                                key={item.id}
                            >
                                <div className={styles.rubricTopline}>
                                    <span>{item.label}</span>
                                    <strong>
                                        {item.score} / {item.maxScore}
                                    </strong>
                                </div>
                                <div className={styles.rubricTrack}>
                                    <span
                                        style={{
                                            width: `${(item.score / item.maxScore) * 100}%`,
                                        }}
                                    />
                                </div>
                                <p>{item.feedback}</p>
                            </article>
                        ))}
                    </div>

                    <div className={styles.safetyNote}>
                        <Info size={18} />
                        <p>
                            <strong>教学使用说明</strong>
                            本平台用于医学美容技术专业教学示范，不用于医疗诊断、治疗决策或效果预测。
                        </p>
                    </div>
                </aside>
            </div>

            <footer className={styles.platformFooter}>
                <span>
                    <GraduationCap size={15} /> 重庆建筑科技职业学院 ·
                    智慧康养学院
                </span>
                <span>面部美学比例与对称性教学模块</span>
                <span>本地运行 · 数据不上传</span>
            </footer>

            {reportOpen && progress.reportGenerated && (
                <div className={styles.reportBackdrop} role="presentation">
                    <section
                        className={styles.reportSheet}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="learning-report-title"
                    >
                        <div className={styles.reportHeader}>
                            <div>
                                <span>重庆建筑科技职业学院 · 智慧康养学院</span>
                                <h2 id="learning-report-title">
                                    医学美容设计学习任务报告
                                </h2>
                                <p>
                                    {report.caseTitle} · {report.generatedAt}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setReportOpen(false)}
                                aria-label="关闭报告"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className={styles.reportBody}>
                            <div className={styles.reportVisual}>
                                <FaceAnalysisCanvas
                                    imageSrc={DEMO_CASE.imageSrc}
                                    loaded
                                    layers={progress.layers}
                                    annotations={progress.annotations}
                                    observation={progress.observation}
                                    interactive={false}
                                />
                            </div>
                            <div className={styles.reportContent}>
                                <section>
                                    <span className={styles.reportSectionLabel}>
                                        01 / 学习观察
                                    </span>
                                    <h3>{report.observation}</h3>
                                    <ul>
                                        {report.findings
                                            .slice(0, 3)
                                            .map((finding) => (
                                                <li key={finding}>{finding}</li>
                                            ))}
                                    </ul>
                                </section>
                                <section>
                                    <span className={styles.reportSectionLabel}>
                                        02 / 学习评价
                                    </span>
                                    <div className={styles.reportScoreRow}>
                                        <strong>
                                            {report.assessment.total}
                                        </strong>
                                        <span>综合得分 / 100</span>
                                    </div>
                                    <div className={styles.reportCriteria}>
                                        {report.assessment.criteria.map(
                                            (item) => (
                                                <div key={item.id}>
                                                    <span>{item.label}</span>
                                                    <strong>
                                                        {item.score}
                                                    </strong>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </section>
                                <section>
                                    <span className={styles.reportSectionLabel}>
                                        03 / 改进建议
                                    </span>
                                    {report.assessment.recommendations.map(
                                        (recommendation) => (
                                            <p
                                                className={
                                                    styles.recommendation
                                                }
                                                key={recommendation}
                                            >
                                                <Check size={15} />
                                                {recommendation}
                                            </p>
                                        ),
                                    )}
                                </section>
                            </div>
                        </div>

                        <div className={styles.reportDisclaimer}>
                            本报告仅用于课堂学习过程记录，不构成医疗诊断、治疗建议或效果预测。
                        </div>
                    </section>
                </div>
            )}
        </main>
    )
}
