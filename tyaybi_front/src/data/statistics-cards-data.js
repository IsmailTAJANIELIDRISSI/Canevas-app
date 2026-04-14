import {
  BanknotesIcon,
  UserPlusIcon,
  UsersIcon,
  ChartBarIcon,
} from "@heroicons/react/24/solid";


export const getStatisticsCardsData = async () => {
  const projetsData = await getnombreprojets();
  const montantData = await getmontant();
  const nbrclientData= await getnbrclient();
  const nbrusers= await getnbrusers();
  return [
    {
      color: "gray",
      icon: BanknotesIcon,
      title: "Nombre Des Projets",
      value: projetsData.nombre_projets,
      footer: {
        color: "text-green-500",
        value: "",
        label: "",
      },
    },
    {
      color: "gray",
      icon: UsersIcon,
      title: "Nombre Des Client",
      value: nbrclientData.client_count,
      footer: {
        color: "text-green-500",
        value: "",
        label: "",
      },
    },
    {
      color: "gray",
      icon: UserPlusIcon,
      title: "Nombres Des Utilisateurs",
      value: nbrusers.user_count,
      footer: {
        color: "text-red-500",
        value: "",
        label: "",
      },
    },
    {
      color: "gray",
      icon: ChartBarIcon,
      title: "Les revenus",
      value: `$${montantData.montant_total}`,
      footer: {
        color: "text-green-500",
        value: "",
        label: "",
      },
    },
  ];
};
