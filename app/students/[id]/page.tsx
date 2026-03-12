import { notFound } from "next/navigation";
import { Student360View } from "@/components/students/student-360-view";
import { requireInternalAccess } from "@/lib/auth/session";
import { getStudentPortfolioBySlug } from "@/lib/db/queries";

type Params = Promise<{ id: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function getStringValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function StudentDetailPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { id } = await params;
  const actor = await requireInternalAccess(`/students/${id}`);
  const portfolio = await getStudentPortfolioBySlug(actor, id);

  if (!portfolio) notFound();

  const resolved = await searchParams;

  return (
    <Student360View
      actorRole={actor.activeRole}
      portfolio={portfolio}
      message={getStringValue(resolved.message)}
      error={getStringValue(resolved.error)}
    />
  );
}
