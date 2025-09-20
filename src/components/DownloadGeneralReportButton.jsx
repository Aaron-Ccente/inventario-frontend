// components/DownloadGeneralReportButton.jsx
import jsPDF from 'jspdf';

const DownloadGeneralReportButton = ({ data }) => {
  const downloadGeneralPDF = async () => {
    if (!data || data.length === 0) {
      alert('No hay datos para generar el reporte.');
      return;
    }

    try {
      const doc = new jsPDF();
      
      // Configuración del documento
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 15;
      const tableWidth = pageWidth - (margin * 2);
      let currentY = 15;

      // Función para agregar nueva página si es necesario
      const checkNewPage = (neededSpace = 20) => {
        if (currentY + neededSpace > pageHeight - 20) {
          doc.addPage();
          currentY = 15;
          return true;
        }
        return false;
      };

      // Encabezado con gradiente y logo
      doc.setFillColor(47, 84, 150);
      doc.rect(0, 0, pageWidth, 60, 'F');
      
      // Título principal
      doc.setFontSize(20);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text('INFORME GENERAL DE INVENTARIO', pageWidth / 2, 25, { align: 'center' });
      
      // Subtítulo
      doc.setFontSize(14);
      doc.text('POLICÍA NACIONAL DEL PERÚ', pageWidth / 2, 35, { align: 'center' });
      
      // Fecha de generación
      doc.setFontSize(10);
      doc.text(`Generado: ${new Date().toLocaleDateString('es-PE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`, pageWidth / 2, 45, { align: 'center' });
      
      currentY = 70;

      // Procesar datos para el PDF
      const categorias = {};
      
      data.forEach((row) => {
        if (!row.nombre_categoria) return;

        if (!categorias[row.nombre_categoria]) {
          categorias[row.nombre_categoria] = {
            articulos: []
          };
        }
        
        if (row.id_articulo) {
          const stockActual = parseFloat(row.stock_actual) || 0;
          const totalMovimientosAcumulado = parseFloat(row.total_movimientos_acumulado) || 0;
          const totalMovimientos = parseInt(row.total_movimientos) || 0;
          
          let stockInicial = 0;
          let stockFinal = stockActual;
          
          if (totalMovimientos === 0) {
            stockInicial = stockActual;
          } else {
            stockInicial = stockActual - totalMovimientosAcumulado;
          }

          stockInicial = Math.max(0, stockInicial);
          stockFinal = Math.max(0, stockFinal);

          categorias[row.nombre_categoria].articulos.push({
            codigo: row.codigo || '-',
            nombre: row.nombre_articulo || '-',
            unidad: row.unidad || '-',
            stock_inicial: stockInicial,
            stock_final: stockFinal,
            diferencia: stockFinal - stockInicial
          });
        }
      });

      // Función para dibujar tabla manualmente con diseño mejorado
      const drawTable = (headers, data, startY, isCategoriaTable = true) => {
        const colWidths = isCategoriaTable 
          ? [20, 65, 20, 25, 25, 25] // Anchos de columnas para tabla de categoría
          : [30, 55, 20, 25, 25, 25]; // Anchos para tabla resumen
        
        const rowHeight = 8;
        const headerHeight = 10;
        const tableContentWidth = colWidths.reduce((a, b) => a + b, 0);
        
        // Ajustar anchos si la tabla es más ancha que la página
        const scaleFactor = tableWidth / tableContentWidth;
        if (scaleFactor < 1) {
          for (let i = 0; i < colWidths.length; i++) {
            colWidths[i] = colWidths[i] * scaleFactor;
          }
        }
        
        let x = margin;
        let y = startY;

        // Dibujar fondo de encabezado con bordes redondeados
        doc.setFillColor(47, 84, 150);
        doc.rect(x, y, tableContentWidth, headerHeight, 'F');
        
        // Texto de encabezados
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        
        let currentX = x;
        headers.forEach((header, i) => {
          const textX = currentX + (colWidths[i] / 2);
          const textY = y + headerHeight/2 + 2;
          
          if (i === 0 || i === 2) {
            doc.text(header, textX, textY, { align: 'center' });
          } else if (i >= 3) {
            doc.text(header, currentX + colWidths[i] - 3, textY, { align: 'right' });
          } else {
            doc.text(header, currentX + 3, textY);
          }
          currentX += colWidths[i];
        });

        y += headerHeight;

        // Dibujar filas de datos
        data.forEach((row, rowIndex) => {
          // Verificar si necesita nueva página
          if (y + rowHeight > pageHeight - 20) {
            doc.addPage();
            y = 15;
            
            // Redibujar encabezados de tabla en nueva página
            doc.setFillColor(47, 84, 150);
            doc.rect(margin, y, tableContentWidth, headerHeight, 'F');
            
            currentX = margin;
            headers.forEach((header, i) => {
              const textX = currentX + (colWidths[i] / 2);
              const textY = y + headerHeight/2 + 2;
              
              if (i === 0 || i === 2) {
                doc.text(header, textX, textY, { align: 'center' });
              } else if (i >= 3) {
                doc.text(header, currentX + colWidths[i] - 3, textY, { align: 'right' });
              } else {
                doc.text(header, currentX + 3, textY);
              }
              currentX += colWidths[i];
            });
            
            y += headerHeight;
          }

          // Alternar color de fondo para filas
          if (rowIndex % 2 === 0) {
            doc.setFillColor(245, 245, 245);
            doc.rect(x, y, tableContentWidth, rowHeight, 'F');
          }

          currentX = x;
          row.forEach((cell, colIndex) => {
            const textY = y + rowHeight/2 + 2;
            
            // Restablecer color de texto
            doc.setTextColor(0, 0, 0);
            
            // Aplicar color para diferencias
            if (colIndex === 5) {
              const diff = parseFloat(cell);
              if (diff > 0) {
                doc.setTextColor(0, 128, 0); // Verde
              } else if (diff < 0) {
                doc.setTextColor(220, 0, 0); // Rojo
              }
            }

            if (colIndex === 0 || colIndex === 2) {
              doc.text(String(cell), currentX + colWidths[colIndex]/2, textY, { align: 'center' });
            } else if (colIndex >= 3) {
              doc.text(String(cell), currentX + colWidths[colIndex] - 3, textY, { align: 'right' });
            } else {
              // Truncar texto largo para la columna de nombre
              const text = String(cell);
              const maxWidth = colWidths[colIndex] - 6;
              let truncatedText = text;
              
              if (doc.getTextWidth(text) > maxWidth) {
                truncatedText = text.substring(0, 20) + '...';
              }
              
              doc.text(truncatedText, currentX + 3, textY);
            }
            currentX += colWidths[colIndex];
          });

          y += rowHeight;
        });

        // Dibujar bordes de la tabla
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.2);
        doc.rect(x, startY, tableContentWidth, y - startY);

        return y + 10;
      };

      // Generar contenido por categoría
      Object.keys(categorias).forEach((nombreCategoria) => {
        const categoria = categorias[nombreCategoria];

        // Verificar si necesita nueva página para la categoría
        checkNewPage(30);

        // Título de categoría con icono
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(47, 84, 150);
        
        // Fondo para el título de categoría
        doc.setFillColor(240, 245, 250);
        doc.rect(margin, currentY - 5, tableWidth, 12, 'F');
        
        doc.text(`${nombreCategoria.toUpperCase()}`, margin + 5, currentY + 3);
        currentY += 15;

        if (!categoria.articulos || categoria.articulos.length === 0) {
          doc.setFontSize(10);
          doc.setFont('helvetica', 'italic');
          doc.setTextColor(102, 102, 102);
          doc.text('No hay artículos en esta categoría.', margin + 5, currentY);
          doc.setTextColor(0, 0, 0);
          currentY += 15;
        } else {
          // Preparar datos para la tabla
          const headers = ['CÓDIGO', 'ARTÍCULO', 'UNIDAD', 'INICIAL', 'FINAL', 'DIFER.'];
          const tableData = categoria.articulos.map(articulo => [
            articulo.codigo,
            articulo.nombre,
            articulo.unidad,
            articulo.stock_inicial.toFixed(2),
            articulo.stock_final.toFixed(2),
            articulo.diferencia.toFixed(2)
          ]);

          // Dibujar tabla
          currentY = drawTable(headers, tableData, currentY);

          // Calcular totales
          const totalInicial = categoria.articulos.reduce((sum, art) => sum + art.stock_inicial, 0);
          const totalFinal = categoria.articulos.reduce((sum, art) => sum + art.stock_final, 0);
          const totalDiferencia = categoria.articulos.reduce((sum, art) => sum + art.diferencia, 0);

          // Agregar línea de totales
          checkNewPage(15);
          
          doc.setFillColor(240, 240, 240);
          doc.rect(margin, currentY, tableWidth, 10, 'F');
          
          doc.setTextColor(0, 0, 0);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9);
          
          doc.text('TOTAL CATEGORÍA', margin + 5, currentY + 7);
          doc.text(totalInicial.toFixed(2), margin + tableWidth - 80, currentY + 7, { align: 'right' });
          doc.text(totalFinal.toFixed(2), margin + tableWidth - 50, currentY + 7, { align: 'right' });
          
          // Color para total diferencia
          if (totalDiferencia > 0) {
            doc.setTextColor(0, 128, 0);
          } else if (totalDiferencia < 0) {
            doc.setTextColor(220, 0, 0);
          }
          doc.text(totalDiferencia.toFixed(2), margin + tableWidth - 20, currentY + 7, { align: 'right' });
          
          doc.setTextColor(0, 0, 0);
          currentY += 20;
        }
      });

      // Agregar resumen general al final
      checkNewPage(50);
      
      // Título de resumen
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(47, 84, 150);
      doc.text('RESUMEN GENERAL', pageWidth / 2, currentY, { align: 'center' });
      currentY += 15;

      // Preparar datos para tabla resumen
      const headersResumen = ['CATEGORÍA', 'ARTÍCULOS', 'UNIDAD', 'INICIAL', 'FINAL', 'DIFER.'];
      const resumenData = Object.keys(categorias).map(nombreCategoria => {
        const categoria = categorias[nombreCategoria];
        const totalInicial = categoria.articulos.reduce((sum, art) => sum + art.stock_inicial, 0);
        const totalFinal = categoria.articulos.reduce((sum, art) => sum + art.stock_final, 0);
        const totalDiferencia = totalFinal - totalInicial;
        
        return [
          nombreCategoria,
          categoria.articulos.length.toString(),
          '-',
          totalInicial.toFixed(2),
          totalFinal.toFixed(2),
          totalDiferencia.toFixed(2)
        ];
      });

      // Totales generales
      const totalArticulos = resumenData.reduce((sum, row) => sum + parseInt(row[1]), 0);
      const totalInicialGeneral = resumenData.reduce((sum, row) => sum + parseFloat(row[3]), 0);
      const totalFinalGeneral = resumenData.reduce((sum, row) => sum + parseFloat(row[4]), 0);
      const totalDiferenciaGeneral = totalFinalGeneral - totalInicialGeneral;

      resumenData.push([
        'TOTAL GENERAL',
        totalArticulos.toString(),
        '-',
        totalInicialGeneral.toFixed(2),
        totalFinalGeneral.toFixed(2),
        totalDiferenciaGeneral.toFixed(2)
      ]);

      // Dibujar tabla de resumen
      currentY = drawTable(headersResumen, resumenData, currentY, false);

      // Pie de página con diseño
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        
        // Línea decorativa
        doc.setDrawColor(47, 84, 150);
        doc.setLineWidth(0.5);
        doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
        
        doc.setFontSize(8);
        doc.setTextColor(102, 102, 102);
        doc.text(`Página ${i} de ${pageCount} • Sistema de Inventario PNP • ${new Date().getFullYear()}`, 
                pageWidth / 2, pageHeight - 10, 
                { align: 'center' });
      }

      // Guardar PDF
      doc.save('informe_general_inventario_pnp.pdf');

    } catch (error) {
      console.error('Error completo:', error);
      alert(`Error al generar el PDF: ${error.message}`);
    }
  };

  return (
    <button
      onClick={downloadGeneralPDF}
      className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white px-6 py-3 rounded-lg transition-all duration-300 hover:shadow-lg flex items-center space-x-2"
      title="Descargar informe general en PDF"
      disabled={!data || data.length === 0}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <span>Descargar Reporte General PDF</span>
    </button>
  );
};

export default DownloadGeneralReportButton;