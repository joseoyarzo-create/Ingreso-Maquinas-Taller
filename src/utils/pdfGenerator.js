import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generateReceipt = async (order) => {
  const element = document.createElement('div');
  element.style.width = '80mm';
  element.style.padding = '10mm 5mm';
  element.style.backgroundColor = 'white';
  element.style.color = 'black';
  element.style.fontFamily = 'Courier, monospace'; // Ticket style font
  element.style.fontSize = '12px';
  element.style.lineHeight = '1.2';
  element.style.textAlign = 'left';

  const logoUrl = localStorage.getItem('business_logo');
  const logoHtml = logoUrl ? `<img src="${logoUrl}" style="max-width: 50mm; margin: 0 auto 5mm display: block;" />` : '';

  element.innerHTML = `
    <div style="text-align: center; margin-bottom: 5mm;">
      ${logoHtml}
      <h2 style="margin: 0; font-size: 16px; font-weight: bold;">COMERCIAL SOTAVENTO LTDA.</h2>
      <p style="margin: 2px 0;">Servicio Técnico</p>
      <p style="margin: 2px 0;">Ancud, Calle Pudeto 351, Chile</p>
      <p style="margin: 2px 0;">Ciudad: Ancud</p>
    </div>

    <div style="border-top: 1px dashed black; border-bottom: 1px dashed black; padding: 5mm 0; margin-bottom: 5mm; text-align: center;">
      <p style="margin: 0; font-size: 20px; font-weight: bold;">ORDEN: ${order.stId}</p>
    </div>

    <div style="margin-bottom: 5mm;">
      <p><strong>CLIENTE:</strong> ${order.client}</p>
      <p><strong>TELÉFONO:</strong> ${order.phone}</p>
    </div>

    <div style="margin-bottom: 5mm;">
      <p><strong>EQUIPO:</strong> ${order.machine}</p>
      <p><strong>MODELO:</strong> ${order.model}</p>
      <p><strong>N° SERIE:</strong> ${order.serialNumber}</p>
    </div>

    <div style="margin-bottom: 5mm;">
      <p><strong>FALLA REPORTADA:</strong></p>
      <div style="border: 1px solid black; padding: 3mm; min-height: 20mm; white-space: pre-wrap;">${order.failure}</div>
    </div>

    <div style="margin-bottom: 5mm;">
      <p><strong>FECHA INGRESO:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
      <p><strong>FECHA ENTREGA:</strong> _________________</p>
    </div>

    <div style="margin-bottom: 5mm;">
      <p>[ ] Llamado  [ ] Entregado</p>
    </div>

    <div style="font-size: 9px; margin-bottom: 10mm;">
      <p style="margin: 2px 0; font-weight: bold;">CONDICIONES:</p>
      <p style="margin: 2px 0;">- Presupuesto sujeto a diagnóstico.</p>
      <p style="margin: 2px 0;">- Equipos no retirados en 30 días podrán generar costos.</p>
      <p style="margin: 2px 0;">- No responsabilidad por fallas no informadas.</p>
    </div>

    <div style="text-align: center; margin-top: 15mm;">
      <div style="border-top: 1px solid black; width: 60mm; margin: 0 auto;"></div>
      <p style="margin-top: 2px;">Firma Cliente</p>
    </div>
  `;

  document.body.appendChild(element);

  try {
    const canvas = await html2canvas(element, {
      scale: 2, // Better quality
      useCORS: true,
      logging: false,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight
    });

    const imgData = canvas.toDataURL('image/png');
    
    // 80mm width, height dynamic based on content but standard 297mm if possible
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, 297]
    });

    const imgWidth = 80;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save(`ST-${order.stId}.pdf`);
  } catch (error) {
    console.error("Error generating PDF:", error);
  } finally {
    document.body.removeChild(element);
  }
};
