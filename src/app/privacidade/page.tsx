import { InfoPage, infoPageMetadata } from "@/components/layout/InfoPage";

export const metadata = infoPageMetadata("privacidade");

export default function PrivacyPage() {
  return <InfoPage slug="privacidade" />;
}
