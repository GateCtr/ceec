import MarathonScanClient from "./MarathonScanClient";

export default async function MarathonScanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <MarathonScanClient marathonId={parseInt(id, 10)} />;
}
