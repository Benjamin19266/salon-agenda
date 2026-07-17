import { getBusinessBySlug } from "@/lib/businesses";
import PublicBooking from "./PublicBooking";

export default async function Page({ params }: { params: { slug: string } }) {
  const biz = await getBusinessBySlug(params.slug);
  if (!biz) return <main style={{ padding: 40 }}>Negocio no encontrado</main>;
  return <PublicBooking slug={biz.slug} businessName={biz.name} />;
}
