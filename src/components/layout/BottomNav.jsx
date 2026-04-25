import { NavLink } from "react-router-dom";

function BottomNav() {
  const activeClass = "text-lavender font-semibold";
  const baseClass = "text-gray-600";

  return (
    <nav className="w-full fixed bottom-0 left-0 bg-cream border-t border-lilac">
      <div className="flex justify-around py-3 text-sm">

        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive ? activeClass : baseClass
          }
        >
          Home
        </NavLink>

        <NavLink
          to="/calendar"
          className={({ isActive }) =>
            isActive ? activeClass : baseClass
          }
        >
          Calendar
        </NavLink>

        <NavLink
          to="/log"
          className={({ isActive }) =>
            isActive ? activeClass : baseClass
          }
        >
          Log
        </NavLink>

        <NavLink
          to="/insights"
          className={({ isActive }) =>
            isActive ? activeClass : baseClass
          }
        >
          Insights
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            isActive ? activeClass : baseClass
          }
        >
          Profile
        </NavLink>

      </div>
    </nav>
  );
}

export default BottomNav;
