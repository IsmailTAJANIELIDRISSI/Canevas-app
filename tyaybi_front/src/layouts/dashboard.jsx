import { useEffect, useState } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Cog6ToothIcon } from "@heroicons/react/24/solid";
import { IconButton } from "@material-tailwind/react";
import { Sidenav, DashboardNavbar, Configurator, Footer } from "@/widgets/layout";
import routes from "@/routes";
import { useMaterialTailwindController, setOpenConfigurator } from "@/context";


export function Dashboard() {
  const [controller, dispatch] = useMaterialTailwindController();
  const { sidenavType } = controller;
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(0); // State to store user role

  useEffect(() => {
    const token = localStorage.getItem("token");
    const currentPath = window.location.pathname;
    if (currentPath !== "/auth/sign-up") {
      if (token) {
        
      } else {
        navigate("/auth/sign-in");
      }
    }
  }, [localStorage.getItem("token"),navigate]);

  return (
    <div className="min-h-screen bg-blue-gray-50/50">
      <Sidenav
        routes={routes.map(route => { // Map over routes and filter based on user role
            return {
              ...route,
              pages: route.pages.filter(page => { // Filter pages based on user role
                if (page.name === "Gestion des utilisateurs" && userRole !== 1) {
                  return false; // Remove "Gestion des utilisateurs" page if user role is not 1
                }
                return true;
              })
            };
          
          return route;
        })}
        brandImg={
          sidenavType === "dark" ? "/img/logo-ct.png" : "/img/logo-ct-dark.png"
        }
      />
      <div className="p-4 xl:ml-80">
        <DashboardNavbar />
        
        <Routes>
          {routes.map(
            ({ layout, pages }) =>
              layout === "dashboard" &&
              pages.map(({ path, element }) => (
                <Route exact path={path} element={element} key={path} />
              ))
          )}
        </Routes>
        <div className="text-blue-gray-600">
          <Footer />
        </div>
      </div>
    </div>
  );
}

Dashboard.displayName = "/src/layout/dashboard.jsx";

export default Dashboard;
