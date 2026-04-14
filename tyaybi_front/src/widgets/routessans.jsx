import {
    HomeIcon,
    UserCircleIcon,
    TableCellsIcon,
    InformationCircleIcon,
    ServerStackIcon,
    RectangleStackIcon,
  } from "@heroicons/react/24/solid";
  import { Home, Clients,Ngp,ExcelToPdfConverter} from "@/pages/dashboard";
  import { SignIn, SignUp } from "@/pages/auth";
  import {Clientss} from "./pages/dashboard/clients/test";
  const icon = {
    className: "w-5 h-5 text-inherit",
  };
  
  export const routes = [
    {
      layout: "dashboard",
      pages: [
        {
          icon: <TableCellsIcon {...icon} />,
          name: "sans electroniques",
          path: "/Excelslice",
          element: <Clientss />,
        },
        {
          icon: <TableCellsIcon {...icon} />,
          name: "Gestion de BDD",
          path: "/Bddngp",
          element: <Ngp />,
        },
        {
          icon: <TableCellsIcon {...icon} />,
          name: "Slice Excel file",
          path: "/fileparser",
          element: <Clients />,
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
  