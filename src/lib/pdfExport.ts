import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { api } from './api';
import { AdminStats, Player, ScoreRecord } from '../types/game';

function getBase64ImageFromUrl(imageUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width || 200;
      canvas.height = img.naturalHeight || img.height || 200;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } else {
        reject(new Error('Canvas context failed'));
      }
    };
    img.onerror = (e) => reject(e);
    img.src = imageUrl;
  });
}

export async function exportToPDF(type: 'users' | 'scores', stats?: AdminStats | null) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const today = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // 1. Header Banner
  doc.setFillColor(216, 27, 96); // #D81B60 Elephant House Pink
  doc.rect(0, 0, pageWidth, 80, 'F');

  // Gold accent line
  doc.setFillColor(255, 179, 0); // #FFB300 Amber Gold
  doc.rect(0, 80, pageWidth, 4, 'F');

  // Try Embedding Logo
  let textStartX = 30;
  try {
    const logoBase64 = await getBase64ImageFromUrl('/logo.png');
    // White background badge for logo
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(25, 12, 64, 56, 8, 8, 'F');
    // Add Logo Image
    doc.addImage(logoBase64, 'PNG', 28, 15, 58, 50);
    textStartX = 100;
  } catch (err) {
    console.warn('Could not embed logo in PDF:', err);
  }

  // Header Titles
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.setTextColor(255, 255, 255);
  doc.text('ELEPHANT HOUSE ICE CREAM', textStartX, 36);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(255, 240, 245);
  const title =
    type === 'users'
      ? 'AR Tongue Catch Game — Registered Players Report'
      : 'AR Tongue Catch Game — Session Score Logs Report';
  doc.text(title, textStartX, 56);

  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text(`Generated: ${today}`, pageWidth - 30, 56, { align: 'right' });

  let startY = 106;

  // 2. Summary KPI Box if available
  if (stats) {
    doc.setFillColor(248, 249, 250);
    doc.setDrawColor(220, 220, 220);
    doc.roundedRect(30, startY, pageWidth - 60, 48, 6, 6, 'FD');

    const kpiY = startY + 22;
    const colWidth = (pageWidth - 60) / 4;

    // KPI 1
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(216, 27, 96);
    doc.text(String(stats.total_users ?? 0), 30 + colWidth * 0.5, kpiY, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('TOTAL PLAYERS', 30 + colWidth * 0.5, kpiY + 14, { align: 'center' });

    // KPI 2
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(216, 27, 96);
    doc.text(String(stats.total_games ?? 0), 30 + colWidth * 1.5, kpiY, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('TOTAL GAMES PLAYED', 30 + colWidth * 1.5, kpiY + 14, { align: 'center' });

    // KPI 3
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(216, 27, 96);
    doc.text(`${stats.highest_score ?? 0} pts`, 30 + colWidth * 2.5, kpiY, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('HIGHEST SCORE', 30 + colWidth * 2.5, kpiY + 14, { align: 'center' });

    // KPI 4
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(216, 27, 96);
    doc.text(`${stats.average_score ?? 0} pts`, 30 + colWidth * 3.5, kpiY, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('AVERAGE SCORE', 30 + colWidth * 3.5, kpiY + 14, { align: 'center' });

    startY += 65;
  }

  // 3. Fetch Data & Build Table
  if (type === 'users') {
    const res = await api.getAdminUsers({ limit: 1000 });
    const users: Player[] = res.users?.data || [];

    const tableHeaders = [
      ['#', 'Player Name', 'Mobile Number', 'Email Address', 'High Score', 'Games', 'Registered Date']
    ];

    const tableRows = users.map((u, idx) => [
      idx + 1,
      u.name,
      u.mobile,
      u.email || '—',
      `${u.highest_score || 0} pts`,
      u.total_games || 0,
      u.created_at ? new Date(u.created_at).toLocaleDateString('en-GB') : '—'
    ]);

    autoTable(doc, {
      startY: startY,
      head: tableHeaders,
      body: tableRows,
      margin: { left: 30, right: 30 },
      theme: 'striped',
      headStyles: {
        fillColor: [216, 27, 96],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 9,
        halign: 'left'
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 25 },
        1: { fontStyle: 'bold' },
        4: { halign: 'center', fontStyle: 'bold', textColor: [216, 27, 96] },
        5: { halign: 'center' },
        6: { halign: 'center' }
      },
      styles: {
        fontSize: 8.5,
        cellPadding: 6,
        textColor: [40, 40, 40]
      },
      alternateRowStyles: {
        fillColor: [253, 242, 248] // soft pink tint
      },
      didDrawPage: (data) => {
        const pageCount = doc.internal.pages.length - 1;
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `Page ${data.pageNumber} of ${pageCount} | Elephant House AR Campaign`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 15,
          { align: 'center' }
        );
      }
    });

    const dateSlug = new Date().toISOString().split('T')[0];
    doc.save(`elephant_house_players_${dateSlug}.pdf`);
  } else {
    // Score Logs
    const res = await api.getAdminScores({ limit: 1000 });
    const scores: ScoreRecord[] = res.scores?.data || [];

    const tableHeaders = [
      ['Log ID', 'Player Name', 'Mobile Number', 'Marks (Score)', 'Popsicles Caught', 'Duration', 'Played Date & Time']
    ];

    const tableRows = scores.map((s) => [
      `#${s.id}`,
      s.user?.name || `User #${s.user_id}`,
      s.user?.mobile || '—',
      `${s.score} marks`,
      `${s.popsicles_caught} 🍦`,
      `${s.duration_seconds}s`,
      s.created_at ? new Date(s.created_at).toLocaleString('en-GB') : '—'
    ]);

    autoTable(doc, {
      startY: startY,
      head: tableHeaders,
      body: tableRows,
      margin: { left: 30, right: 30 },
      theme: 'striped',
      headStyles: {
        fillColor: [216, 27, 96],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 9,
        halign: 'left'
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 40 },
        1: { fontStyle: 'bold' },
        3: { halign: 'center', fontStyle: 'bold', textColor: [255, 143, 0] },
        4: { halign: 'center' },
        5: { halign: 'center' },
        6: { halign: 'center' }
      },
      styles: {
        fontSize: 8.5,
        cellPadding: 6,
        textColor: [40, 40, 40]
      },
      alternateRowStyles: {
        fillColor: [254, 243, 199] // soft amber tint
      },
      didDrawPage: (data) => {
        const pageCount = doc.internal.pages.length - 1;
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `Page ${data.pageNumber} of ${pageCount} | Elephant House AR Campaign`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 15,
          { align: 'center' }
        );
      }
    });

    const dateSlug = new Date().toISOString().split('T')[0];
    doc.save(`elephant_house_scores_${dateSlug}.pdf`);
  }
}
