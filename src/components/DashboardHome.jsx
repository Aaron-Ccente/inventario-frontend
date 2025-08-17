const DashboardHome = () => {
  return (
    <div className="flex-1 p-8 bg-gray-50 dark:bg-gray-900">
      <div className="w-full">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-12">
          <div className="text-center">
            <div className="bg-pink-100 dark:bg-pink-900/30 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-8">
              <div className="text-6xl">🏢</div>
            </div>
            <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-6">
              Bienvenido al Dashboard
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-xl leading-relaxed mb-10 max-w-2xl mx-auto">
              Selecciona una categoría del panel izquierdo para gestionar el inventario del Sistema PNP
            </p>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-8 max-w-3xl mx-auto">
              <div className="flex items-center justify-center space-x-4 mb-4">
                <div className="w-3 h-3 bg-pink-500 rounded-full animate-pulse"></div>
                <div className="w-3 h-3 bg-pink-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                <div className="w-3 h-3 bg-pink-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                Esta área mostrará el contenido de la categoría seleccionada.
                <br />
                Haz clic en cualquier categoría del panel lateral para comenzar a gestionar el inventario.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
