"use client"

import type { PointerEvent as ReactPointerEvent } from "react"
import { useRef, useState } from "react"
import type {
    LayerVisibility,
    PointAnnotation,
} from "@/lib/medical-aesthetic/types"
import styles from "./medical-aesthetic.module.css"

interface FaceAnalysisCanvasProps {
    imageSrc: string
    loaded: boolean
    layers: LayerVisibility
    annotations: PointAnnotation[]
    observation: string
    interactive?: boolean
    onAnnotationMove?: (id: string, x: number, y: number) => void
}

const thirds = [168, 356, 544, 732]
const fiveEyes = [160, 256, 352, 448, 544, 640]

function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max)
}

export function FaceAnalysisCanvas({
    imageSrc,
    loaded,
    layers,
    annotations,
    observation,
    interactive = true,
    onAnnotationMove,
}: FaceAnalysisCanvasProps) {
    const svgRef = useRef<SVGSVGElement>(null)
    const [draggingId, setDraggingId] = useState<string | null>(null)

    const moveAnnotation = (event: ReactPointerEvent<SVGSVGElement>) => {
        if (!draggingId || !interactive || !onAnnotationMove || !svgRef.current)
            return

        const bounds = svgRef.current.getBoundingClientRect()
        const x = ((event.clientX - bounds.left) / bounds.width) * 800
        const y = ((event.clientY - bounds.top) / bounds.height) * 1000
        onAnnotationMove(draggingId, clamp(x, 120, 680), clamp(y, 220, 780))
    }

    const releasePointer = () => setDraggingId(null)

    const contourPath = annotations
        .map((point) => `${point.x},${point.y}`)
        .join(" ")

    return (
        <svg
            ref={svgRef}
            className={styles.faceCanvas}
            viewBox="0 0 800 1000"
            role="img"
            aria-label="合成示范人像面部比例分析画布"
            onPointerMove={moveAnnotation}
            onPointerUp={releasePointer}
            onPointerCancel={releasePointer}
            onPointerLeave={releasePointer}
        >
            <title>合成示范人像面部比例分析画布</title>
            <rect width="800" height="1000" fill="#e8edf1" />
            <image
                href={imageSrc}
                width="800"
                height="1000"
                preserveAspectRatio="none"
                opacity={loaded ? 1 : 0.12}
            />

            <g className={styles.canvasGrid}>
                {Array.from({ length: 9 }, (_, index) => (
                    <line
                        key={`grid-x-${index}`}
                        x1={index * 100}
                        x2={index * 100}
                        y1="0"
                        y2="1000"
                    />
                ))}
                {Array.from({ length: 11 }, (_, index) => (
                    <line
                        key={`grid-y-${index}`}
                        x1="0"
                        x2="800"
                        y1={index * 100}
                        y2={index * 100}
                    />
                ))}
            </g>

            {loaded && layers.thirds && (
                <g className={styles.analysisLayer} data-testid="thirds-layer">
                    {thirds.map((y, index) => (
                        <g key={y}>
                            <line
                                className={styles.thirdLine}
                                x1="105"
                                x2="695"
                                y1={y}
                                y2={y}
                            />
                            {index < thirds.length - 1 && (
                                <text
                                    className={styles.layerLabel}
                                    x="118"
                                    y={y + 92}
                                >
                                    {index === 0
                                        ? "上庭"
                                        : index === 1
                                          ? "中庭"
                                          : "下庭"}
                                </text>
                            )}
                        </g>
                    ))}
                </g>
            )}

            {loaded && layers.fiveEyes && (
                <g
                    className={styles.analysisLayer}
                    data-testid="five-eyes-layer"
                >
                    {fiveEyes.map((x) => (
                        <line
                            key={x}
                            className={styles.eyeGuide}
                            x1={x}
                            x2={x}
                            y1="344"
                            y2="472"
                        />
                    ))}
                    <text
                        className={styles.eyeGuideLabel}
                        x="400"
                        y="492"
                        textAnchor="middle"
                    >
                        五眼横向参照
                    </text>
                </g>
            )}

            {loaded && layers.symmetry && (
                <g
                    className={styles.analysisLayer}
                    data-testid="symmetry-layer"
                >
                    <line
                        className={styles.symmetryLine}
                        x1="400"
                        x2="400"
                        y1="104"
                        y2="790"
                    />
                    <circle
                        className={styles.symmetryTarget}
                        cx="400"
                        cy="544"
                        r="11"
                    />
                    <circle
                        className={styles.symmetryTarget}
                        cx="400"
                        cy="544"
                        r="3"
                    />
                    <text className={styles.symmetryLabel} x="412" y="128">
                        面部中轴
                    </text>
                </g>
            )}

            {loaded && layers.contour && (
                <g className={styles.analysisLayer} data-testid="contour-layer">
                    <polyline
                        className={styles.contourLine}
                        points={contourPath}
                    />
                    {annotations.map((annotation) => (
                        <g key={annotation.id}>
                            <circle
                                className={
                                    interactive
                                        ? styles.dragTarget
                                        : styles.reportTarget
                                }
                                cx={annotation.x}
                                cy={annotation.y}
                                r={interactive ? 15 : 11}
                                data-testid={`annotation-${annotation.id}`}
                                onPointerDown={(event) => {
                                    if (!interactive) return
                                    event.currentTarget.setPointerCapture(
                                        event.pointerId,
                                    )
                                    setDraggingId(annotation.id)
                                }}
                            />
                            <circle
                                className={styles.annotationCore}
                                cx={annotation.x}
                                cy={annotation.y}
                                r="4"
                                pointerEvents="none"
                            />
                        </g>
                    ))}
                </g>
            )}

            {loaded && observation && (
                <g
                    className={styles.observationCallout}
                    data-testid="observation-callout"
                >
                    <path d="M 508 606 L 650 574" />
                    <rect x="548" y="526" width="220" height="76" rx="8" />
                    <text x="564" y="552">
                        <tspan x="564" dy="0">
                            教学观察
                        </tspan>
                        <tspan x="564" dy="22">
                            {observation.slice(0, 16)}
                        </tspan>
                        {observation.length > 16 && (
                            <tspan x="564" dy="20">
                                {observation.slice(16, 31)}
                            </tspan>
                        )}
                    </text>
                </g>
            )}

            {!loaded && (
                <g className={styles.emptyCanvas}>
                    <rect x="228" y="418" width="344" height="164" rx="16" />
                    <text x="400" y="476" textAnchor="middle">
                        等待载入示范案例
                    </text>
                    <text x="400" y="516" textAnchor="middle">
                        本地合成人像 · 不含真实个人信息
                    </text>
                </g>
            )}

            <g className={styles.canvasCorners}>
                <path d="M28 72V28H72 M728 28H772V72 M772 928V972H728 M72 972H28V928" />
            </g>
        </svg>
    )
}
