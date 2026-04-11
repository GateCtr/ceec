import { auth } from "@clerk/nextjs/server";
import { getUserRoles, ROLES } from "@/lib/auth/rbac";
import Navbar from "./Navbar";

const ROLE_LABELS: Record<string, string> = {
  [ROLES.SUPER_ADMIN]:           "Super Administrateur CEEC",
  [ROLES.ADMIN_PLATEFORME]:      "Administrateur Plateforme",
  [ROLES.MODERATEUR_PLATEFORME]: "Modérateur Plateforme",
  [ROLES.ADMIN_EGLISE]:          "Administrateur d'église",
  [ROLES.PASTEUR]:               "Pasteur",
  [ROLES.DIACRE]:                "Diacre",
  [ROLES.SECRETAIRE]:            "Secrétaire",
  [ROLES.TRESORIER]:             "Trésorier",
  [ROLES.FIDELE]:                "Fidèle",
};

const CHURCH_STAFF = new Set<string>([
  ROLES.ADMIN_EGLISE, ROLES.PASTEUR, ROLES.DIACRE,
  ROLES.SECRETAIRE, ROLES.TRESORIER,
]);

export default async function NavbarServer() {
  type NavInfo = {
    isSuperAdmin: boolean;
    isChurchAdmin: boolean;
    churchSlugs: string[];
    roleLabel: string;
    churchName: string | null;
  };

  let navInfo: NavInfo = {
    isSuperAdmin: false,
    isChurchAdmin: false,
    churchSlugs: [],
    roleLabel: "",
    churchName: null,
  };

  try {
    const { userId } = await auth();

    if (userId) {
      const userRoles = await getUserRoles(userId);

      const isSuperAdmin  = userRoles.some((ur) => ur.role.nom === ROLES.SUPER_ADMIN);
      const isPlatform    = userRoles.some((ur) =>
        ur.role.nom === ROLES.ADMIN_PLATEFORME || ur.role.nom === ROLES.MODERATEUR_PLATEFORME
      );
      const staffRoles    = userRoles.filter((ur) => ur.eglise?.slug && CHURCH_STAFF.has(ur.role.nom));
      const isChurchAdmin = staffRoles.length > 0;
      const churchSlugs   = staffRoles.map((ur) => ur.eglise!.slug!);
      const churchName    = staffRoles[0]?.eglise?.nom ?? null;

      let roleLabel: string;
      if (isSuperAdmin) {
        roleLabel = ROLE_LABELS[ROLES.SUPER_ADMIN];
      } else if (isPlatform) {
        const pr = userRoles.find((ur) =>
          ur.role.nom === ROLES.ADMIN_PLATEFORME || ur.role.nom === ROLES.MODERATEUR_PLATEFORME
        );
        roleLabel = ROLE_LABELS[pr!.role.nom] ?? "Administrateur";
      } else if (isChurchAdmin) {
        roleLabel = ROLE_LABELS[staffRoles[0].role.nom] ?? "Personnel d'église";
      } else {
        const fidele = userRoles.find((ur) => ur.role.nom === ROLES.FIDELE);
        roleLabel = fidele ? ROLE_LABELS[ROLES.FIDELE] : "Membre";
      }

      navInfo = { isSuperAdmin, isChurchAdmin, churchSlugs, roleLabel, churchName };
    }
  } catch (e) {
    console.error("[NavbarServer] Erreur lors de la récupération des rôles:", e);
  }

  return <Navbar initialNavInfo={navInfo} />;
}
