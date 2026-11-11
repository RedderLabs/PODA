import { iconoPng } from "@/lib/og";

export const dynamic = "force-static";

export function GET() {
  return iconoPng(180);
}
