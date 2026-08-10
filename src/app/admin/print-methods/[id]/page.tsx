import { PrintMethodEditPage } from "../_components/PrintMethodEditPage";

interface EditPrintMethodPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPrintMethodPage({ params }: EditPrintMethodPageProps) {
  const { id } = await params;

  return <PrintMethodEditPage id={id} />;
}
