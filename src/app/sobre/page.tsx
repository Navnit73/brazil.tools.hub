import { InfoPage, infoPageMetadata } from "@/components/layout/InfoPage";

export const metadata = infoPageMetadata("sobre");

export default function AboutPage() {
  return <InfoPage slug="sobre" />;
}
