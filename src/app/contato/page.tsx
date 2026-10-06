import { InfoPage, infoPageMetadata } from "@/components/layout/InfoPage";
import { siteConfig } from "@/config/site";

export const metadata = infoPageMetadata("contato");

export default function ContactPage() {
  const { email } = siteConfig.company;
  return (
    <InfoPage slug="contato">
      <p className="mt-8 rounded-m-lg bg-md-surface-container p-5">
        {email ? (
          <>
            E-mail:{" "}
            <a href={`mailto:${email}`} className="font-medium text-primary underline">
              {email}
            </a>
          </>
        ) : (
          // Sem e-mail configurado a página fica com noindex (veja isInfoPageIndexable).
          "O canal de atendimento está sendo configurado. Enquanto isso, as perguntas frequentes de cada ferramenta respondem às dúvidas mais comuns."
        )}
      </p>
    </InfoPage>
  );
}
