import NavbarServer from "@/components/NavbarServer";
import Footer from "@/components/Footer";

export default function CommunauteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NavbarServer />
      {children}
      <Footer />
    </>
  );
}
