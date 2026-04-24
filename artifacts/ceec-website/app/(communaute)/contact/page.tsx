import ContactForm from "@/components/ContactForm";
import { HeroSection } from "@/components/community";
import { MapPin, Mail, Phone, Clock } from "lucide-react";

export const metadata = {
  title: "Contact | CEEC",
  description: "Contactez la Communauté des Églises Évangéliques au Congo",
};

const contactInfos = [
  { label: "Siège social", value: "Kinshasa, République Démocratique du Congo", icon: <MapPin size={22} /> },
  { label: "Email", value: "contact@ceec-rdc.org", icon: <Mail size={22} /> },
  { label: "Téléphone", value: "+243 xxx xxx xxx", icon: <Phone size={22} /> },
  { label: "Heures d'ouverture", value: "Lundi - Vendredi : 8h00 - 17h00", icon: <Clock size={22} /> },
];

export default function ContactPage() {
  return (
    <>
      <HeroSection
        badge="Nous rejoindre"
        title="Contactez-nous"
        description="Notre équipe est à votre disposition pour répondre à toutes vos questions sur la CEEC, ses paroisses et ses programmes."
        actions={[
          { label: "Écrire un message", href: "#formulaire" },
          { label: "Trouver une église", href: "/paroisses", variant: "outline" },
        ]}
      />

      <section id="formulaire" className="py-16 px-4 bg-primary-50">
        <div className="max-w-[1000px] mx-auto grid gap-10 grid-cols-[repeat(auto-fit,minmax(300px,1fr))]">
          <div>
            <h2 className="font-bold text-2xl mb-6 text-primary">
              Informations de contact
            </h2>
            <div className="flex flex-col gap-5">
              {contactInfos.map((info) => (
                <div
                  key={info.label}
                  className="flex gap-4 items-start bg-white p-5 rounded-xl border border-border"
                >
                  <span className="shrink-0 text-primary">{info.icon}</span>
                  <div>
                    <div className="text-xs text-muted-foreground font-semibold uppercase mb-1">
                      {info.label}
                    </div>
                    <div className="font-medium text-slate-700">
                      {info.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="font-bold text-2xl mb-6 text-primary">
              Envoyer un message
            </h2>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
