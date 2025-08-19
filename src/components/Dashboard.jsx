import { useAuth } from '../contexts/AuthContext.jsx';
import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle.jsx';
import CreateCategoryModal from './CreateCategoryModal.jsx';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

    const fetchCategories = async () => {
    try {
      console.log('Dashboard: Fetching categories...');
      const response = await fetch('http://localhost:8081/api/category');
      const data = await response.json();
      console.log('Dashboard: Categories response:', data);
      
      if (data.success) {
        // Transformar las categorías del backend al formato del frontend
        const transformedCategories = data.data.map((cat, index) => {
          const transformed = {
            id: cat.id_categoria,
            name: cat.nombre,
            icon: cat.icono || getCategoryIcon(cat.nombre), // Usar icono del backend o fallback
            count: cat.total_articulos || 0, // Usar el conteo real del backend
            slug: cat.nombre.toLowerCase().replace(/\s+/g, '-')
          };
          console.log(`Dashboard: Transformed category ${cat.nombre}:`, transformed);
          return transformed;
        });
        console.log('Dashboard: All transformed categories:', transformedCategories);
        setCategories(transformedCategories);
      } else {
        // Si hay error, usar categorías por defecto
        console.log('Dashboard: Error in response, using default categories');
        setDefaultCategories();
      }
    } catch (error) {
      console.error('Dashboard: Error fetching categories:', error);
      setDefaultCategories();
    } finally {
      setLoading(false);
    }
  };

  const setDefaultCategories = () => {
    const defaultCategories = [
      { id: 1, name: 'Herramientas', icon: '🔧', count: 25, slug: 'herramientas' },
      { id: 2, name: 'Materiales', icon: '📦', count: 42, slug: 'materiales' },
      { id: 3, name: 'Equipos', icon: '💻', count: 18, slug: 'equipos' },
      { id: 4, name: 'Consumibles', icon: '🧪', count: 67, slug: 'consumibles' },
      { id: 5, name: 'Vehículos', icon: '🚗', count: 12, slug: 'vehiculos' },
      { id: 6, name: 'Armamento', icon: '🔫', count: 8, slug: 'armamento' },
      { id: 7, name: 'Comunicaciones', icon: '📻', count: 15, slug: 'comunicaciones' },
      { id: 8, name: 'Seguridad', icon: '🛡️', count: 23, slug: 'seguridad' }
    ];
    setCategories(defaultCategories);
  };

  const getCategoryIcon = (categoryName) => {
    const iconMap = {
      'herramientas': '🔧',
      'materiales': '📦',
      'equipos': '💻',
      'consumibles': '🧪',
      'vehículos': '🚗',
      'armamento': '🔫',
      'comunicaciones': '📻',
      'seguridad': '🛡️',
      'equipos de comunicación': '📡',
      'tecnología': '💻',
      'logística': '🚚',
      'medicina': '🏥',
      'ropa': '👕',
      'alimentación': '🍽️'
    };
    
    const lowerName = categoryName.toLowerCase();
    for (const [key, icon] of Object.entries(iconMap)) {
      if (lowerName.includes(key)) {
        return icon;
      }
    }
    
    // Icono por defecto
    return '📋';
  };

  useEffect(() => {
    fetchCategories();
    
    // Escuchar evento para refrescar categorías cuando se crean/editan/eliminan artículos
    const handleRefreshCategories = () => {
      console.log('Dashboard received refreshCategories event');
      console.log('Current categories state:', categories);
      fetchCategories();
    };
    
    window.addEventListener('refreshCategories', handleRefreshCategories);
    
    return () => {
      window.removeEventListener('refreshCategories', handleRefreshCategories);
    };
  }, []);

  const handleLogout = () => {
    logout();
  };

  const handleCategoryClick = (categorySlug) => {
    navigate(`/dashboard/${categorySlug}`);
  };

  const isCategorySelected = (categorySlug) => {
    return location.pathname === `/dashboard/${categorySlug}`;
  };

  const handleCreateCategory = () => {
    setIsModalOpen(true);
  };

  const handleCategoryCreated = () => {
    fetchCategories(); // Recargar categorías después de crear una nueva
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
        <div className="w-full px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Sistema de Inventario PNP
              </h1>
            </div>
            <div className="flex items-center space-x-6">
              <ThemeToggle />
              <span className="text-gray-700 dark:text-gray-300 text-lg">
                Bienvenido, <span className="font-semibold text-gray-900 dark:text-gray-100">{user?.name}</span>
              </span>
              <button
                onClick={handleLogout}
                className="bg-pink-500 hover:bg-pink-600 dark:bg-pink-600 dark:hover:bg-pink-700 text-white px-6 py-3 rounded-lg transition-all duration-300 hover:shadow-lg"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-full">
        {/* Sidebar - Panel de Categorías */}
        <aside className="w-80 bg-white dark:bg-gray-800 shadow-xl min-h-screen flex-shrink-0">
          <div className="p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                Categorías
              </h2>
              <button
                onClick={handleCreateCategory}
                className="bg-pink-500 hover:bg-pink-600 text-white p-2 rounded-lg transition-colors duration-200 hover:shadow-md"
                title="Crear nueva categoría"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            
            <nav className="space-y-3">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 group ${
                    isCategorySelected(category.slug)
                      ? 'bg-pink-100 dark:bg-pink-900/30 border-l-4 border-pink-500 dark:border-pink-400 shadow-md'
                      : 'hover:bg-pink-50 dark:hover:bg-gray-700 hover:shadow-md'
                  }`}
                >
                  <div 
                    className="flex items-center space-x-4 flex-1 cursor-pointer"
                    onClick={() => handleCategoryClick(category.slug)}
                  >
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
                      isCategorySelected(category.slug)
                        ? 'bg-pink-200 dark:bg-pink-800'
                        : 'bg-gray-100 dark:bg-gray-600'
                    }`}>
                      <span className="text-2xl">{category.icon}</span>
                    </div>
                    <span className={`font-semibold text-lg transition-colors ${
                      isCategorySelected(category.slug)
                        ? 'text-pink-700 dark:text-pink-300'
                        : 'text-gray-700 dark:text-gray-300 group-hover:text-pink-600 dark:group-hover:text-pink-400'
                    }`}>
                      {category.name}
                    </span>
                  </div>
                  
                                     <span className={`text-sm font-bold px-3 py-1 rounded-full transition-colors ${
                     isCategorySelected(category.slug)
                       ? 'bg-pink-200 text-pink-800 dark:bg-pink-800 dark:text-pink-200'
                       : 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300'
                   }`}>
                     {category.count}
                   </span>
                </div>
              ))}
            </nav>

            {/* Estadísticas rápidas */}
            <div className="mt-10 pt-8 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6">
                Resumen
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">Total de Artículos:</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200 text-lg">
                    {categories.reduce((sum, cat) => sum + cat.count, 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">Categorías:</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200 text-lg">
                    {categories.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Área Principal con Outlet */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>

      {/* Modal para crear categorías */}
      <CreateCategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCategoryCreated={handleCategoryCreated}
      />
    </div>
  );
};

export default Dashboard;
