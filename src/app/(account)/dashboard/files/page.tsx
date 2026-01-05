import { Metadata } from "next";
import SavedFilesDashboard from "@/components/account/files/SavedFilesDashboard";

export const metadata: Metadata = {
  title: "Fișiere salvate | Sanduta.art",
  description: "Gestionează biblioteca ta de fișiere aprobate pentru tipar",
};

export default function SavedFilesPage() {
  return <SavedFilesDashboard />;
}
