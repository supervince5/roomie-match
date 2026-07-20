import { Outlet } from "react-router";
import BottomNavigation from "./BottomNavigation";

function AppLayout() {
  return (
    <div className="app-shell">
      <Outlet />
      <BottomNavigation />
    </div>
  );
}

export default AppLayout;