import { useState, useEffect } from 'react';

const MovementModal = ({ isOpen, onClose, onMovementCreated, article, categoryName }) => {
  const [formData, setFormData] = useState({
    accion: 'ENTRADA',
    doc: '',
    detalle: '',
    cantidad: '',
    costo_unidad: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Resetear formulario cuando se abre el modal
  useEffect(() => {
    if (isOpen && article) {
      setFormData({
        accion: 'ENTRADA',
        doc: '',
        detalle: '',
        cantidad: '',
        costo_unidad: ''
      });
      setError('');
      setSuccess('');
    }
  }, [isOpen, article]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Si cambia la acción, limpiar costo unitario para salidas
    if (name === 'accion' && value === 'SALIDA') {
      setFormData(prev => ({
        ...prev,
        accion: value,
        costo_unidad: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.cantidad || parseFloat(formData.cantidad) <= 0) {
      setError('La cantidad debe ser mayor a 0');
      return;
    }

    if (formData.accion === 'ENTRADA' && (!formData.costo_unidad || parseFloat(formData.costo_unidad) <= 0)) {
      setError('Para entradas, el costo unitario es requerido y debe ser mayor a 0');
      return;
    }

    if (formData.accion === 'SALIDA' && parseFloat(formData.cantidad) > article.stock) {
      setError(`Stock insuficiente. Stock actual: ${article.stock}, Cantidad solicitada: ${formData.cantidad}`);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:8081/movement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_articulo: article.id_articulo,
          accion: formData.accion,
          doc: formData.doc.trim() || null,
          detalle: formData.detalle.trim() || null,
          cantidad: parseFloat(formData.cantidad),
          costo_unidad: formData.accion === 'SALIDA' ? null : parseFloat(formData.costo_unidad)
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(data.message);
        setTimeout(() => {
          onMovementCreated();
          onClose();
        }, 1500);
      } else {
        setError(data.message || 'Error al crear el movimiento');
      }
    } catch (err) {
      console.error('Network error:', err);
      setError('Error de conexión. Verifica tu conexión a internet e inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!isOpen || !article) return null;

  return (
    <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Registrar Movimiento - {article.nombre}
          </h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Información del artículo */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Código:</span>
              <span className="ml-2 text-gray-600 dark:text-gray-400">{article.codigo}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Stock Actual:</span>
              <span className="ml-2 text-gray-600 dark:text-gray-400">{article.stock}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Categoría:</span>
              <span className="ml-2 text-gray-600 dark:text-gray-400">{categoryName}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Unidad:</span>
              <span className="ml-2 text-gray-600 dark:text-gray-400">{article.unidad}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tipo de Acción */}
            <div>
              <label htmlFor="accion" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo de Movimiento *
              </label>
              <select
                id="accion"
                name="accion"
                value={formData.accion}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                disabled={loading}
                required
              >
                <option value="ENTRADA">Entrada</option>
                <option value="SALIDA">Salida</option>
              </select>
            </div>

            {/* Cantidad */}
            <div>
              <label htmlFor="cantidad" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cantidad *
              </label>
              <input
                type="number"
                id="cantidad"
                name="cantidad"
                value={formData.cantidad}
                onChange={handleInputChange}
                min="0.01"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                placeholder="0.00"
                disabled={loading}
                required
              />
            </div>

            {/* Documento */}
            <div>
              <label htmlFor="doc" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Documento
              </label>
              <input
                type="text"
                id="doc"
                name="doc"
                value={formData.doc}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                placeholder="Número de factura, remito, etc."
                disabled={loading}
              />
            </div>

            {/* Costo Unitario (solo para entradas) */}
            {formData.accion === 'ENTRADA' && (
              <div>
                <label htmlFor="costo_unidad" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Costo Unitario *
                </label>
                <input
                  type="number"
                  id="costo_unidad"
                  name="costo_unidad"
                  value={formData.costo_unidad}
                  onChange={handleInputChange}
                  min="0.01"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  placeholder="0.00"
                  disabled={loading}
                  required
                />
              </div>
            )}
          </div>

          {/* Detalle */}
          <div>
            <label htmlFor="detalle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Detalle del Movimiento
            </label>
            <textarea
              id="detalle"
              name="detalle"
              value={formData.detalle}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
              placeholder="Descripción del movimiento, motivo, proveedor, etc."
              disabled={loading}
            />
          </div>

                     {/* Resumen del movimiento */}
           {formData.cantidad && (
             <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
               <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Resumen del Movimiento:</h4>
               <div className="grid grid-cols-2 gap-4 text-sm">
                 <div>
                   <span className="text-blue-700 dark:text-blue-300">Stock Actual:</span>
                   <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                     {parseFloat(article.stock || 0).toFixed(2)}
                   </span>
                 </div>
                 <div>
                   <span className="text-blue-700 dark:text-blue-300">Movimiento:</span>
                   <span className={`ml-2 font-medium ${
                     formData.accion === 'ENTRADA' 
                       ? 'text-green-600 dark:text-green-400' 
                       : 'text-red-600 dark:text-red-400'
                   }`}>
                     {formData.accion === 'ENTRADA' ? '+' : '-'}{parseFloat(formData.cantidad || 0).toFixed(2)}
                   </span>
                 </div>
                 <div>
                   <span className="text-blue-700 dark:text-blue-300">Nuevo Stock:</span>
                   <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                     {formData.accion === 'ENTRADA' 
                       ? (parseFloat(article.stock || 0) + parseFloat(formData.cantidad || 0)).toFixed(2)
                       : (parseFloat(article.stock || 0) - parseFloat(formData.cantidad || 0)).toFixed(2)
                     }
                   </span>
                 </div>
                 {formData.accion === 'ENTRADA' && formData.costo_unidad && (
                   <div>
                     <span className="text-blue-700 dark:text-blue-300">Costo Total:</span>
                     <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                       ${(parseFloat(formData.cantidad || 0) * parseFloat(formData.costo_unidad || 0)).toFixed(2)}
                     </span>
                   </div>
                 )}
               </div>
             </div>
           )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
              <p className="text-green-600 dark:text-green-400 text-sm">{success}</p>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !formData.cantidad || (formData.accion === 'ENTRADA' && !formData.costo_unidad)}
              className="flex-1 px-4 py-3 bg-pink-500 hover:bg-pink-600 disabled:bg-pink-400 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Registrando...' : 'Registrar Movimiento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MovementModal;
