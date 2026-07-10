export type DemoStepId = "case" | "analysis" | "annotation" | "report"

export type AnnotationKind = "temple" | "cheek" | "jaw" | "chin"

export type RubricCriterionId =
    | "proportion"
    | "symmetry"
    | "annotation"
    | "expression"

export interface PointAnnotation {
    id: string
    kind: AnnotationKind
    label: string
    x: number
    y: number
}

export interface LayerVisibility {
    thirds: boolean
    fiveEyes: boolean
    symmetry: boolean
    contour: boolean
}

export interface DemoCase {
    id: string
    title: string
    imageSrc: string
    subjectLabel: string
    teachingGoal: string
    findings: string[]
    referenceAnnotations: PointAnnotation[]
}

export interface DemoStep {
    id: DemoStepId
    index: number
    title: string
    shortTitle: string
    description: string
}

export interface DemoProgress {
    currentStep: DemoStepId
    caseLoaded: boolean
    analysisCompleted: boolean
    annotationReviewed: boolean
    reportGenerated: boolean
    layers: LayerVisibility
    annotations: PointAnnotation[]
    movedAnnotationIds: string[]
    observation: string
}

export interface RubricCriterion {
    id: RubricCriterionId
    label: string
    maxScore: 25
    score: number
    feedback: string
}

export interface AssessmentResult {
    total: number
    criteria: RubricCriterion[]
    recommendations: string[]
}

export interface LearningReport {
    caseTitle: string
    observation: string
    findings: string[]
    assessment: AssessmentResult
    generatedAt: string
}
