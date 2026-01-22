import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PrintReportContent } from "./print-content";

interface PrintPageProps {
  params: Promise<{ id: string }>;
}

interface ReportWithSession {
  report_text: string;
  created_at: string;
  sessions: {
    purpose: string;
  } | null;
}

export default async function PrintPage({ params }: PrintPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: report } = await supabase
    .from("reports")
    .select("report_text, created_at, sessions(purpose)")
    .eq("session_id", id)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!report) {
    redirect(`/session/${id}`);
  }

  const typedReport = report as unknown as ReportWithSession;

  return (
    <PrintReportContent
      reportText={typedReport.report_text}
      purpose={typedReport.sessions?.purpose || ""}
      createdAt={typedReport.created_at}
    />
  );
}
