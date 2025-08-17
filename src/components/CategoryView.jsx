import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import CreateArticleModal from './CreateArticleModal.jsx';
import EditCategoryModal from './EditCategoryModal.jsx';
import DeleteCategoryModal from './DeleteCategoryModal.jsx';
import EditArticleModal from './EditArticleModal.jsx';
import DeleteArticleModal from './DeleteArticleModal.jsx';
import MovementModal from './MovementModal.jsx';
import MovementHistoryModal from './MovementHistoryModal.jsx';

const CategoryView = () => {
  const { categorySlug } = useParams();
  const [category, setCategory] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditArticleModalOpen, setIsEditArticleModalOpen] = useState(false);
  const [isDeleteArticleModalOpen, setIsDeleteArticleModalOpen] = useState(false);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [isMovementHistoryModalOpen, setIsMovementHistoryModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredArticles, setFilteredArticles] = useState([]);

  // Función para obtener datos de categoría del backend
  const fetchCategoryData = async (categorySlug) => {
    try {
      console.log('Fetching category data for slug:', categorySlug);
      // Primero obtener todas las categorías del backend
      const response = await fetch('http://localhost:8081/category');
      const data = await response.json();
      console.log('Categories response:', data);
      
      if (data.success) {
        // Buscar la categoría que coincida con el slug
        const foundCategory = data.data.find(cat => {
          const catSlug = cat.nombre.toLowerCase().replace(/\s+/g, '-');
          return catSlug === categorySlug;
        });
        
        console.log('Found category:', foundCategory);
        
        if (foundCategory) {
          // Crear objeto de categoría con datos del backend
          const categoryObj = {
            id: foundCategory.id_categoria,
            name: foundCategory.nombre,
            icon: foundCategory.icono || '📋',
            description: foundCategory.descripcion || generateDescription(foundCategory.nombre),
            total_articulos: foundCategory.total_articulos || 0
          };
          
          console.log('Setting category object:', categoryObj);
          setCategory(categoryObj);
          await fetchArticles(foundCategory.id_categoria);
        } else {
          setCategory(null);
        }
      } else {
        setCategory(null);
      }
    } catch (error) {
      console.error('Error fetching category data:', error);
      setCategory(null);
    } finally {
      setLoading(false);
    }
  };

  // Función para generar descripción automática basada en el nombre
  const generateDescription = (categoryName) => {
    const descriptions = {
      'herramientas': 'Gestión de herramientas y equipos manuales',
      'materiales': 'Control de materiales de construcción y suministros',
      'equipos': 'Administración de equipos electrónicos y tecnológicos',
      'consumibles': 'Control de materiales consumibles y repuestos',
      'vehículos': 'Gestión de vehículos y transporte',
      'armamento': 'Control de armas y equipos de seguridad',
      'comunicaciones': 'Equipos de comunicación y radio',
      'seguridad': 'Equipos de protección y seguridad personal',
      'químicos': 'Sustancias químicas y reactivos',
      'medicina': 'Suministros médicos y farmacéuticos',
      'ropa': 'Vestimenta y equipos de protección',
      'alimentación': 'Provisión de alimentos y bebidas',
      'logística': 'Equipos de transporte y almacenamiento',
      'tecnología': 'Equipos tecnológicos avanzados',
      'construcción': 'Materiales y equipos de construcción',
      'electricidad': 'Equipos y materiales eléctricos',
      'plomería': 'Herramientas y materiales de plomería',
      'jardinería': 'Herramientas y materiales de jardinería',
      'limpieza': 'Productos y equipos de limpieza',
      'oficina': 'Suministros y equipos de oficina'
    };
    
    // Buscar descripción exacta
    if (descriptions[categoryName.toLowerCase()]) {
      return descriptions[categoryName.toLowerCase()];
    }
    
    // Generar descripción automática basada en palabras clave
    const lowerName = categoryName.toLowerCase();
    
    if (lowerName.includes('líquido') || lowerName.includes('liquido')) {
      return 'Control de sustancias líquidas y fluidos';
    }
    if (lowerName.includes('sopa') || lowerName.includes('alimento')) {
      return 'Gestión de alimentos y productos comestibles';
    }
    if (lowerName.includes('textil') || lowerName.includes('tela')) {
      return 'Materiales textiles y telas';
    }
    if (lowerName.includes('papel') || lowerName.includes('documento')) {
      return 'Suministros de papel y documentos';
    }
    if (lowerName.includes('metal') || lowerName.includes('acero')) {
      return 'Materiales metálicos y aleaciones';
    }
    if (lowerName.includes('madera') || lowerName.includes('leño')) {
      return 'Materiales de madera y productos forestales';
    }
    if (lowerName.includes('plástico') || lowerName.includes('polímero')) {
      return 'Materiales plásticos y polímeros';
    }
    if (lowerName.includes('vidrio') || lowerName.includes('cristal')) {
      return 'Materiales de vidrio y cristal';
    }
    if (lowerName.includes('cerámica') || lowerName.includes('porcelana')) {
      return 'Materiales cerámicos y porcelana';
    }
    if (lowerName.includes('pintura') || lowerName.includes('color')) {
      return 'Pinturas, tintes y materiales de color';
    }
    
    // Descripción genérica para categorías no reconocidas
    return `Gestión y control de ${categoryName.toLowerCase()}`;
  };

  useEffect(() => {
    fetchCategoryData(categorySlug);
  }, [categorySlug]);

  // Efecto adicional para recargar artículos cuando cambie la categoría
  useEffect(() => {
    if (category) {
      fetchArticles(category.id);
    }
  }, [category]);

  // Efecto para filtrar artículos cuando cambie el término de búsqueda
  useEffect(() => {
    if (articles.length > 0) {
      if (searchTerm.trim() === '') {
        setFilteredArticles(articles);
      } else {
        const filtered = articles.filter(article => 
          article.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          article.nombre.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredArticles(filtered);
      }
    } else {
      setFilteredArticles([]);
    }
  }, [searchTerm, articles]);

  const fetchArticles = async (categoryId) => {
    try {
      console.log('🔄 fetchArticles llamado con categoryId:', categoryId);
      console.log('🌐 URL de la petición:', `http://localhost:8081/article/categoria/${categoryId}`);
      
      const response = await fetch(`http://localhost:8081/article/categoria/${categoryId}`);
      const data = await response.json();
      console.log('📊 Articles response data:', data);
      
      if (data.success) {
        console.log('✅ Artículos obtenidos exitosamente');
        console.log('📦 Artículos antes de setArticles:', articles);
        setArticles(data.data);
        console.log('📦 Artículos después de setArticles:', data.data);
        
        // Verificar si el stock se actualizó
        if (data.data.length > 0) {
          console.log('🔍 Verificando stock de artículos:');
          data.data.forEach(article => {
            console.log(`  - ${article.nombre}: Stock = ${article.stock}`);
          });
        }
      } else {
        console.log('❌ No articles found or error:', data.message);
        setArticles([]);
      }
    } catch (error) {
      console.error('❌ Error fetching articles:', error);
      setArticles([]);
    }
  };

  const handleCreateArticle = () => {
    setIsModalOpen(true);
  };

  const handleArticleCreated = () => {
    console.log('Article created, refreshing articles for category:', category.id);
    fetchArticles(category.id);
    // También actualizar el conteo en el dashboard
    window.dispatchEvent(new CustomEvent('refreshCategories'));
  };

  const handleCategoryUpdated = () => {
    console.log('Category updated, refreshing data...');
    console.log('Current categorySlug:', categorySlug);
    // Recargar datos de la categoría
    fetchCategoryData(categorySlug);
    // También actualizar el panel izquierdo del dashboard
    console.log('Dispatching refreshCategories event...');
    window.dispatchEvent(new CustomEvent('refreshCategories'));
  };

  const handleCategoryDeleted = () => {
    // Redirigir al dashboard después de eliminar
    window.location.href = '/dashboard';
  };

  const handleEditArticle = (article) => {
    setSelectedArticle(article);
    setIsEditArticleModalOpen(true);
  };

  const handleDeleteArticle = (article) => {
    setSelectedArticle(article);
    setIsDeleteArticleModalOpen(true);
  };

  const handleArticleUpdated = () => {
    fetchArticles(category.id);
    // También actualizar el conteo en el dashboard
    window.dispatchEvent(new CustomEvent('refreshCategories'));
  };

  const handleArticleDeleted = () => {
    fetchArticles(category.id);
    // También actualizar el conteo en el dashboard
    window.dispatchEvent(new CustomEvent('refreshCategories'));
  };

  const handleMovementCreated = () => {
    console.log('🔄 handleMovementCreated llamado');
    console.log('📁 Categoría ID:', category.id);
    console.log('📁 Categoría objeto:', category);
    
    // Recargar artículos para actualizar el stock
    console.log('🔄 Recargando artículos...');
    fetchArticles(category.id);
    
    // También actualizar el conteo en el dashboard
    console.log('🔄 Disparando evento refreshCategories...');
    window.dispatchEvent(new CustomEvent('refreshCategories'));
  };

  const handleOpenMovement = (article) => {
    setSelectedArticle(article);
    setIsMovementModalOpen(true);
  };

  const handleOpenMovementHistory = (article) => {
    setSelectedArticle(article);
    setIsMovementHistoryModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex-1 p-8 bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando categoría...</p>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="flex-1 p-8 bg-gray-50 dark:bg-gray-900">
        <div className="w-full">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
            <div className="text-center">
              <div className="text-6xl mb-4">❓</div>
              <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                Categoría no encontrada
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                La categoría solicitada no existe en el sistema.
              </p>
              <p className="text-gray-500 dark:text-gray-500 mt-2">
                Intenta crear la categoría desde el dashboard o verifica el nombre.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 bg-gray-50 dark:bg-gray-900">
      <div className="w-full">
        {/* Header de la categoría */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="bg-pink-100 dark:bg-pink-900/30 p-4 rounded-full">
                <span className="text-5xl">{category.icon}</span>
              </div>
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-3">
                  {category.name}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-xl leading-relaxed">
                  {category.description}
                </p>
              </div>
            </div>
            
            {/* Botones de acción para la categoría */}
            <div className="flex space-x-3">
                             <button
                 onClick={() => setIsEditModalOpen(true)}
                 className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200 p-3 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700"
                 title="Editar categoría"
               >
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                 </svg>
               </button>
               <button
                 onClick={() => setIsDeleteModalOpen(true)}
                 className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200 p-3 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-700"
                 title="Eliminar categoría"
               >
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                 </svg>
               </button>
            </div>
          </div>
        </div>

                 {/* Lista de artículos */}
         <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
           <div className="flex justify-between items-center mb-8">
             <div>
               <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                 Artículos en {category.name}
               </h2>
               <p className="text-gray-600 dark:text-gray-400">
                 Total: {filteredArticles.length} artículos
               </p>
             </div>
             <button 
               onClick={handleCreateArticle}
               className="bg-pink-500 hover:bg-pink-600 dark:bg-pink-600 dark:hover:bg-pink-700 text-white px-6 py-3 rounded-lg transition-all duration-300 hover:shadow-lg flex items-center space-x-2"
             >
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
               </svg>
               <span>Agregar Artículo</span>
             </button>
           </div>

           {/* Campo de búsqueda */}
           <div className="mb-6">
             <div className="relative max-w-md">
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                 <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                 </svg>
               </div>
               <input
                 type="text"
                 placeholder="Buscar por código o nombre..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
               />
               {searchTerm && (
                 <button
                   onClick={() => setSearchTerm('')}
                   className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                 >
                   <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                   </svg>
                 </button>
               )}
             </div>
             {searchTerm && (
               <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                 Mostrando {filteredArticles.length} de {articles.length} artículos
               </p>
             )}
           </div>

                     {filteredArticles.length === 0 ? (
             <div className="text-center py-12">
               <div className="text-6xl mb-4">
                 {articles.length === 0 ? '📦' : '🔍'}
               </div>
               <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                 {articles.length === 0 
                   ? 'No hay artículos en esta categoría'
                   : 'No se encontraron artículos con esa búsqueda'
                 }
               </h3>
               <p className="text-gray-500 dark:text-gray-500">
                 {articles.length === 0 
                   ? 'Comienza agregando el primer artículo haciendo clic en "Agregar Artículo"'
                   : 'Intenta con otros términos de búsqueda'
                 }
               </p>
             </div>
           ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Código
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Unidad
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Detalle
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider text-center">
                      Acciones
                    </th>
                  </tr>
                </thead>
                                 <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                   {filteredArticles.map((article) => (
                    <tr key={article.id_articulo} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-200">
                          {article.codigo}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-200">
                          {article.nombre}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {article.unidad}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                          {article.detalle || 'Sin detalle'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-200">
                          {article.stock}
                        </div>
                      </td>
                                             <td className="px-6 py-4">
                         <div className="flex items-center justify-center space-x-2">
                           <button 
                             onClick={() => handleOpenMovement(article)}
                             className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-colors duration-200 p-2 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg"
                             title="Registrar movimiento"
                           >
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                             </svg>
                           </button>
                           <button 
                             onClick={() => handleOpenMovementHistory(article)}
                             className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 transition-colors duration-200 p-2 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg"
                             title="Ver historial de movimientos"
                           >
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                             </svg>
                           </button>
                           <button 
                             onClick={() => handleEditArticle(article)}
                             className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"
                             title="Editar artículo"
                           >
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                             </svg>
                           </button>
                           <button 
                             onClick={() => handleDeleteArticle(article)}
                             className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200 p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                             title="Eliminar artículo"
                           >
                             <svg className="w-5 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1 1v3M4 7h16" />
                             </svg>
                           </button>
                         </div>
                       </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal para crear artículos */}
      <CreateArticleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onArticleCreated={handleArticleCreated}
        categoryId={category.id}
        categoryName={category.name}
      />

      {/* Modal para editar categoría */}
      <EditCategoryModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onCategoryUpdated={handleCategoryUpdated}
        category={category}
      />

             {/* Modal para eliminar categoría */}
       <DeleteCategoryModal
         isOpen={isDeleteModalOpen}
         onClose={() => setIsDeleteModalOpen(false)}
         onCategoryDeleted={handleCategoryDeleted}
         category={category}
       />

       {/* Modal para editar artículo */}
       <EditArticleModal
         isOpen={isEditArticleModalOpen}
         onClose={() => setIsEditArticleModalOpen(false)}
         onArticleUpdated={handleArticleUpdated}
         article={selectedArticle}
         categoryName={category.name}
       />

               {/* Modal para eliminar artículo */}
        <DeleteArticleModal
          isOpen={isDeleteArticleModalOpen}
          onClose={() => setIsDeleteArticleModalOpen(false)}
          onArticleDeleted={handleArticleDeleted}
          article={selectedArticle}
          categoryName={category.name}
        />

        {/* Modal para registrar movimiento */}
        <MovementModal
          isOpen={isMovementModalOpen}
          onClose={() => setIsMovementModalOpen(false)}
          onMovementCreated={handleMovementCreated}
          article={selectedArticle}
          categoryName={category.name}
        />

        {/* Modal para historial de movimientos */}
        <MovementHistoryModal
          isOpen={isMovementHistoryModalOpen}
          onClose={() => setIsMovementHistoryModalOpen(false)}
          article={selectedArticle}
          categoryName={category.name}
        />
      </div>
    );
  };

export default CategoryView;
