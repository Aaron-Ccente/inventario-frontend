import { useAuth } from '../hooks/useAuth.js';
import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle.jsx';
import CreateCategoryModal from './CreateCategoryModal.jsx';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

    const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:8081/api/category');
      const data = await response.json();
      
      if (data.success) {
        const transformedCategories = data.data.map((cat) => {
          const transformed = {
            id: cat.id_categoria,
            name: cat.nombre,
            icon: cat.icono,
            count: cat.total_articulos || 0,
            slug: cat.nombre.toLowerCase().replace(/\s+/g, '-')
          };
          return transformed;
        });
        setCategories(transformedCategories);
      }
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();

    const handleRefreshCategories = () => {
      fetchCategories();
    };
    
    window.addEventListener('refreshCategories', handleRefreshCategories);
    
    return () => {
      window.removeEventListener('refreshCategories', handleRefreshCategories);
    };
  }, []);

  useEffect(() => {
    setFilteredCategories(categories);
  }, [categories]);

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
    fetchCategories();
  };

  const handleDownloadReport = async (event) => {
    let button = null;
    let originalText = '';
    
    try {
      // indicador de carga
      button = event.target.closest('button');
      originalText = button.innerHTML;
      button.innerHTML = `
        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Generando PDF...
      `;
      button.disabled = true;

      const response = await fetch('http://localhost:8081/api/reporte/general', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/pdf',
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'informe_general_articulos.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-x-full';
        toast.innerHTML = `
          <div class="flex items-center space-x-3">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span class="font-semibold">¡Éxito!</span>
          </div>
          <p class="mt-2">El informe PDF ha sido generado y descargado correctamente.</p>
        `;
        document.body.appendChild(toast);
        setTimeout(() => {
          toast.classList.remove('translate-x-full');
        }, 100);
        setTimeout(() => {
          toast.classList.add('translate-x-full');
          setTimeout(() => {
            if (toast.parentNode) {
              document.body.removeChild(toast);
            }
          }, 300);
        }, 4000);
      } else {
        console.error('Error al generar el reporte:', response.status, response.statusText);
        let errorMessage = 'Error desconocido';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || 'Error desconocido';
        } catch (parseError) {
          console.log(parseError)
          errorMessage = `Error ${response.status}: ${response.statusText}`;
        }
        const errorToast = document.createElement('div');
        errorToast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-x-full';
        errorToast.innerHTML = `
          <div class="flex items-center space-x-3">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span class="font-semibold">Error</span>
          </div>
          <p class="mt-2">${errorMessage}</p>
        `;
        document.body.appendChild(errorToast);
        setTimeout(() => {
          errorToast.classList.remove('translate-x-full');
        }, 100);
        
        setTimeout(() => {
          errorToast.classList.add('translate-x-full');
          setTimeout(() => {
            if (errorToast.parentNode) {
              document.body.removeChild(errorToast);
            }
          }, 300);
        }, 4000);
      }
    } catch (error) {
      console.error('Error al descargar el reporte:', error);
      const errorToast = document.createElement('div');
      errorToast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-x-full';
      errorToast.innerHTML = `
        <div class="flex items-center space-x-3">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span class="font-semibold">Error</span>
        </div>
        <p class="mt-2">Error al descargar el reporte. Por favor, inténtalo de nuevo.</p>
      `;
      document.body.appendChild(errorToast);
      setTimeout(() => {
        errorToast.classList.remove('translate-x-full');
      }, 100);
      setTimeout(() => {
        errorToast.classList.add('translate-x-full');
        setTimeout(() => {
          if (errorToast.parentNode) {
            document.body.removeChild(errorToast);
          }
        }, 300);
      }, 4000);
    } finally {
      if (button && originalText) {
        button.innerHTML = originalText;
        button.disabled = false;
      }
    }
  };

  const filterCategories = (term) => {
    if (!term.trim()) {
      setFilteredCategories(categories);
      return;
    }
    
    const filtered = categories.filter(category =>
      category.name.toLowerCase().includes(term.toLowerCase()) ||
      category.icon.includes(term)
    );
    setFilteredCategories(filtered);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    filterCategories(value);
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
        <aside className="w-80 bg-white dark:bg-gray-800 shadow-xl min-h-screen flex-shrink-0">
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
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

            {/* Buscador de categorías */}
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar categorías..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full px-4 py-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition-all duration-200"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                {searchTerm && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setFilteredCategories(categories);
                    }}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
            
            <nav className="space-y-3">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category) => (
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
                ))
              ) : searchTerm ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">🔍</div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    No se encontraron categorías que coincidan con "{searchTerm}"
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setFilteredCategories(categories);
                    }}
                    className="mt-3 text-pink-500 hover:text-pink-600 dark:text-pink-400 dark:hover:text-pink-300 text-sm font-medium"
                  >
                    Limpiar búsqueda
                  </button>
                </div>
              ) : null}
            </nav>

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
                <button
                  onClick={handleDownloadReport}
                  className="w-full bg-pink-500 hover:bg-pink-600 dark:bg-pink-600 dark:hover:bg-pink-700 text-white px-4 py-3 rounded-lg transition-all duration-300 hover:shadow-lg flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Descargar historial general</span>
                </button>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>

      <CreateCategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCategoryCreated={handleCategoryCreated}
      />
    </div>
  );
};

export default Dashboard;
