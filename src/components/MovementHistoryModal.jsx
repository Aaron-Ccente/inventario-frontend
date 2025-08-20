import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';

const MovementHistoryModal = ({ isOpen, onClose, article, categoryName }) => {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && article) {
      fetchMovements();
    }
  }, [isOpen, article]);

  const fetchMovements = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`http://localhost:8081/api/movement/articulo/${article.id_articulo}`);
      const data = await response.json();

              if (data.success) {
          setMovements(data.data);
      } else {
        setError(data.message || 'Error al cargar el historial');
      }
    } catch (err) {
      console.log(err)
      setError('Error de conexión. Verifica tu conexión a internet e inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionIcon = (accion) => {
    return accion === 'ENTRADA' ? '📥' : '📤';
  };

  const getActionColor = (accion) => {
    return accion === 'ENTRADA' 
      ? 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30' 
      : 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-green-900/30';
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

    const downloadPDF = () => {
    if (movements.length === 0) return;

    try {
      const doc = new jsPDF();
      
      // Configuración del documento
      const pageWidth = doc.internal.pageSize.width;
      const margin = 20;
      
      // Título principal
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Historial de Movimientos', pageWidth / 2, 30, { align: 'center' });
      
      // Información del artículo
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Información del Artículo:', margin, 50);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Código: ${article.codigo}`, margin, 65);
      doc.text(`Nombre: ${article.nombre}`, margin, 75);
      doc.text(`Categoría: ${categoryName}`, margin, 85);
      doc.text(`Stock Actual: ${article.stock}`, margin, 95);
      doc.text(`Unidad: ${article.unidad}`, margin, 105);
      
      // Resumen estadístico
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Resumen del Historial:', margin, 125);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total Movimientos: ${movements.length}`, margin, 140);
      doc.text(`Entradas: ${movements.filter(m => m.accion === 'ENTRADA').length}`, margin, 150);
      doc.text(`Salidas: ${movements.filter(m => m.accion === 'SALIDA').length}`, margin, 160);
      doc.text(`Último Movimiento: ${movements.length > 0 ? formatDate(movements[0].fecha) : '-'}`, margin, 170);
      
      // Tabla de movimientos
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Detalle de Movimientos:', margin, 190);
      
             // Generar tabla manualmente con bordes
       let currentY = 200;
       const lineHeight = 8;
       const colWidths = [35, 20, 25, 25, 30, 35];
       const totalTableWidth = colWidths.reduce((a, b) => a + b, 0);
       
       // Encabezados con borde
       doc.setFontSize(10);
       doc.setFont('helvetica', 'bold');
       doc.setFillColor(59, 130, 246);
       doc.rect(margin, currentY - 5, totalTableWidth, lineHeight + 2, 'F');
       
       // Dibujar bordes verticales para encabezados
       let currentX = margin;
       doc.setDrawColor(59, 130, 246);
       doc.setLineWidth(0.5);
       
       // Borde izquierdo
       doc.line(margin, currentY - 5, margin, currentY + lineHeight - 3);
       
       doc.setTextColor(255, 255, 255);
       doc.text('Fecha', currentX + 2, currentY);
       currentX += colWidths[0];
       doc.line(currentX, currentY - 5, currentX, currentY + lineHeight - 3);
       doc.text('Tipo', currentX + 2, currentY);
       currentX += colWidths[1];
       doc.line(currentX, currentY - 5, currentX, currentY + lineHeight - 3);
       doc.text('Cantidad', currentX + 2, currentY);
       currentX += colWidths[2];
       doc.line(currentX, currentY - 5, currentX, currentY + lineHeight - 3);
       doc.text('Costo (S/)', currentX + 2, currentY);
       currentX += colWidths[3];
       doc.line(currentX, currentY - 5, currentX, currentY + lineHeight - 3);
       doc.text('Doc', currentX + 2, currentY);
       currentX += colWidths[4];
       doc.line(currentX, currentY - 5, currentX, currentY + lineHeight - 3);
       doc.text('Detalle', currentX + 2, currentY);
       doc.line(margin + totalTableWidth, currentY - 5, margin + totalTableWidth, currentY + lineHeight - 3); 
       currentY += lineHeight + 5;
       doc.setTextColor(0, 0, 0);
       movements.forEach((movement) => {
         if (currentY > 270) {
           doc.addPage();
           currentY = 20;
         }
         doc.setDrawColor(200, 200, 200);
         doc.setLineWidth(0.2);
         doc.line(margin, currentY - 3, margin + totalTableWidth, currentY - 3);
         let currentX = margin;
         doc.line(currentX, currentY - 3, currentX, currentY + lineHeight - 1);
         
         doc.setFontSize(8);
         doc.setFont('helvetica', 'normal');
         
         doc.text(formatDate(movement.fecha), currentX + 2, currentY);
         currentX += colWidths[0];
         doc.line(currentX, currentY - 3, currentX, currentY + lineHeight - 1);
         doc.text(movement.accion, currentX + 2, currentY);
         currentX += colWidths[1];
         doc.line(currentX, currentY - 3, currentX, currentY + lineHeight - 1);
         doc.text(movement.accion === 'ENTRADA' ? `+${movement.cantidad}` : `-${movement.cantidad}`, currentX + 2, currentY);
         currentX += colWidths[2];
         doc.line(currentX, currentY - 3, currentX, currentY + lineHeight - 1);
         doc.text(movement.costo_unidad ? `S/ ${parseFloat(movement.costo_unidad).toFixed(2)}` : '-', currentX + 2, currentY);
         currentX += colWidths[3];
         doc.line(currentX, currentY - 3, currentX, currentY + lineHeight - 1);
         doc.text(movement.doc || '-', currentX + 2, currentY);
         currentX += colWidths[4];
         doc.line(currentX, currentY - 3, currentX, currentY + lineHeight - 1);
         doc.text(movement.detalle || '-', currentX + 2, currentY);
         
         // Borde derecho de la fila
         doc.line(margin + totalTableWidth, currentY - 3, margin + totalTableWidth, currentY + lineHeight - 1);
         
         // Borde inferior de la fila
         doc.line(margin, currentY + lineHeight - 1, margin + totalTableWidth, currentY + lineHeight - 1);
         
         currentY += lineHeight + 2;
       });
      
      // Pie de página
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.text(`Generado el: ${new Date().toLocaleString('es-ES')}`, pageWidth / 2, currentY + 10, { align: 'center' });
      
      // Descargar el PDF
      const fileName = `historial_${article.codigo}_${article.nombre.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
    } catch (error) {
      console.log(error)
      alert('Error al generar el PDF. Por favor, inténtalo de nuevo.');
    }
  };

  if (!isOpen || !article) return null;

  return (
    <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Historial de Movimientos - {article.nombre}
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Cargando historial...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        ) : movements.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
              No hay movimientos registrados
            </h3>
            <p className="text-gray-500 dark:text-gray-500">
              Este artículo aún no tiene movimientos de entrada o salida registrados.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Cantidad
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Costo Unit.
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Documento
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Detalle
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {movements.map((movement) => (
                  <tr key={movement.id_movimiento} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900 dark:text-gray-200">
                        {formatDate(movement.fecha)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getActionIcon(movement.accion)}</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getActionColor(movement.accion)}`}>
                          {movement.accion}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className={`text-sm font-medium ${
                        movement.accion === 'ENTRADA' 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {movement.accion === 'ENTRADA' ? '+' : '-'}{movement.cantidad}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {movement.costo_unidad 
                          ? `S/. ${parseFloat(movement.costo_unidad).toFixed(2)}`
                          : '-'
                        }
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                        {movement.doc || '-'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                        {movement.detalle || '-'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Botón de descarga PDF */}
        {movements.length > 0 && (
          <div className="mt-6 mb-4 flex justify-end">
            <button
              onClick={downloadPDF}
              className="bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-all duration-300 hover:shadow-lg flex items-center space-x-2"
              title="Descargar historial en PDF"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Descargar PDF</span>
            </button>
          </div>
        )}

        {/* Resumen del historial */}
        {movements.length > 0 && (
          <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-3">Resumen del Historial:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-blue-700 dark:text-blue-300">Total Movimientos:</span>
                <span className="ml-2 font-medium dark:text-gray-300">{movements.length}</span>
              </div>
              <div>
                <span className="text-blue-700 dark:text-blue-300">Entradas:</span>
                <span className="ml-2 font-medium text-green-600">
                  {movements.filter(m => m.accion === 'ENTRADA').length}
                </span>
              </div>
              <div>
                <span className="text-blue-700 dark:text-blue-300">Salidas:</span>
                <span className="ml-2 font-medium text-red-600">
                  {movements.filter(m => m.accion === 'SALIDA').length}
                </span>
              </div>
              <div>
                <span className="text-blue-700 dark:text-blue-300">Último Movimiento:</span>
                <span className="ml-2 font-medium dark:text-gray-300">
                  {movements.length > 0 ? formatDate(movements[0].fecha) : '-'}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-6 py-3 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default MovementHistoryModal;
