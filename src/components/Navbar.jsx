import { NavLink } from 'react-router-dom';
import logo from '../img/logo_hotel.jpg'

const Navbar = () => {
  return (
    <nav style={{ backgroundColor: '#71a78c' }} className="text-white p-4 shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo y título */}
        <div className="flex items-center space-x-3">
          <img src={logo} alt="Logo Hotel" className="h-10 w-auto rounded" />
          <span className="text-lg font-semibold">Hotel Quinta Vista Verde</span>
        </div>

        {/* Navegación */}
        <div className="flex space-x-6">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? 'underline font-bold' : 'hover:underline'
            }
          >
            Inicio
          </NavLink>
          <NavLink
            to="/lista-huespedes"
            className={({ isActive }) =>
              isActive ? 'underline font-bold' : 'hover:underline'
            }
          >
            Lista Huéspedes
          </NavLink>
          <NavLink
            to="/registro-huesped"
            className={({ isActive }) =>
              isActive ? 'underline font-bold' : 'hover:underline'
            }
          >
            Registrar Huésped
          </NavLink>
          <NavLink
            to="/reservas"
            className={({ isActive }) =>
              isActive ? 'underline font-bold' : 'hover:underline'
            }
          >
            Reservas
          </NavLink>
          <NavLink
            to="/registro-reserva"
            className={({ isActive }) =>
              isActive ? 'underline font-bold' : 'hover:underline'
            }
          >
            Registrar Reserva
          </NavLink>
          <NavLink
            to="/habitaciones"
            className={({ isActive }) =>
              isActive ? 'underline font-bold' : 'hover:underline'
            }
          >
            Habitaciones
          </NavLink>
          <NavLink
            to="/reportes"
            className={({ isActive }) =>
              isActive ? 'underline font-bold' : 'hover:underline'
            }
          >
            Reportes
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
