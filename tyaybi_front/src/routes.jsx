import {
  HomeIcon,
  UserCircleIcon,
  TableCellsIcon,
  InformationCircleIcon,
  ServerStackIcon,
  RectangleStackIcon,
  InboxArrowDownIcon,
} from "@heroicons/react/24/solid";
import { Home, Clients,Ngp,ExcelToPdfConverter} from "@/pages/dashboard";
import { SignIn, SignUp } from "@/pages/auth";
import {Clientss} from "./pages/dashboard/clients/test";
import Newmodel from "./pages/dashboard/clients/newmodel";
import Acheminements from "@/pages/dashboard/acheminements";
const icon = {
  className: "w-5 h-5 text-inherit",
};

export const routes = [
  {
    layout: "dashboard",
    pages: [
      {
        icon: <TableCellsIcon {...icon} />,
        name: "Excelslice",
        path: "/Excelslice",
        element: <Clients />,
      },
      {
        icon: <TableCellsIcon {...icon} />,
        name: "Model 5",
        path: "/Model5",
        element: <Newmodel />,
      },
      {
        icon: <TableCellsIcon {...icon} />,
        name: "Gestion de BDD",
        path: "/Bddngp",
        element: <Ngp />,
      },
      {
        icon: <InboxArrowDownIcon {...icon} />,
        name: "Acheminements",
        path: "/Acheminements",
        element: <Acheminements />,
      }
    ],
  },
  {
    title: "auth pages",
    layout: "auth",
    pages: [
      {
        icon: <ServerStackIcon {...icon} />,
        name: "sign in",
        path: "/sign-in",
        element: <SignIn />,
      },
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "sign up",
        path: "/sign-up",
        element: <SignUp />,
      },
    ],
  },
];

export default routes;
