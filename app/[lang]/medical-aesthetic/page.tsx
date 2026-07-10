import type { Metadata } from "next"
import { MedicalAestheticWorkspace } from "@/components/medical-aesthetic/medical-aesthetic-workspace"

export const metadata: Metadata = {
    title: "医学美容设计教学平台 | 重庆建筑科技职业学院",
    description:
        "重庆建筑科技职业学院智慧康养学院医学美容设计教学平台，提供面部美学比例与对称性教学示范。",
    robots: { index: false, follow: false },
}

export default function MedicalAestheticPage() {
    return <MedicalAestheticWorkspace />
}
