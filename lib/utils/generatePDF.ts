import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Facture } from '@/types/facture';
import { useClientStore } from '@/lib/stores/clientStore';
import { genererXMLFacturX } from './generateFacturX';

export function genererPDF(facture: Facture) {
    // 1. Initialisation de jsPDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // 2. En-tête de l'entreprise (Expéditeur)
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("ENTREPRISE BTP DEMO", 15, 20);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("123 Avenue des Champs, 75000 PARIS", 15, 28);
    doc.text("SIRET: 123 456 789 00012 | TVA: FRXX999999999", 15, 33);
    doc.text("Email: contact@btp-demo.fr | Tel: 01 23 45 67 89", 15, 38);

    // 3. Destinataire (Client)
    const clientStore = useClientStore.getState();
    const client = clientStore.clients.find(c => c.id === facture.clientId);

    doc.setFillColor(245, 245, 245);
    doc.rect(110, 20, 85, 40, 'F');

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Facturé à :", 115, 28);
    doc.text(facture.clientName, 115, 35);

    if (client) {
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(client.adresseFacturation, 115, 42);
        doc.text(`${client.codePostalFacturation} ${client.villeFacturation}`, 115, 47);
    }

    // 4. Informations de la facture
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    let typeLabel = "FACTURE";
    if (facture.type === "ACOMPTE") typeLabel = "FACTURE D'ACOMPTE";
    if (facture.type === "AVANCEMENT") typeLabel = "FACTURE D'AVANCEMENT";
    if (facture.type === "SOLDE") typeLabel = "FACTURE DE SOLDE";

    doc.text(`${typeLabel} N° ${facture.reference}`, 15, 60);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Date d'émission: ${new Date(facture.dateEmission).toLocaleDateString('fr-FR')}`, 15, 68);
    if (facture.dateEcheance) {
        doc.text(`Date d'échéance: ${new Date(facture.dateEcheance).toLocaleDateString('fr-FR')}`, 15, 74);
    }
    if (facture.devisId) {
        // En vrai, récupérer la réf devis
        doc.text(`Devis lié: ${facture.devisId}`, 15, 80);
    }

    // 5. Tableau des montants (Résumé)
    const tableData = [
        ["Total HT", `${facture.montantHT.toFixed(2)} €`],
        ["Total TVA", `${facture.montantTVA.toFixed(2)} €`],
        ["Total TTC", `${facture.montantTTC.toFixed(2)} €`],
    ];

    if (facture.hasRetenueGarantie && facture.montantRetenueGarantie) {
        tableData.push([`Retenue de garantie (${facture.tauxRetenueGarantie || 5}%)`, `- ${facture.montantRetenueGarantie.toFixed(2)} €`]);
    }

    let netAPayer = facture.montantTTC;

    if (facture.hasRetenueGarantie && facture.montantRetenueGarantie) {
        netAPayer -= facture.montantRetenueGarantie;
    }

    if (facture.acomptesDeduits && facture.acomptesDeduits.length > 0) {
        let totalDeduits = 0;
        facture.acomptesDeduits.forEach((ac, index) => {
            tableData.push([`Acompte déduit`, `- ${ac.montantDeduit.toFixed(2)} €`]);
            totalDeduits += ac.montantDeduit;
        });
        netAPayer -= totalDeduits;
    }

    tableData.push(["NET À PAYER", `${netAPayer.toFixed(2)} €`]);

    (doc as any).autoTable({
        startY: 95,
        head: [['Désignation', 'Montant']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] }, // bg-blue-500
        columnStyles: {
            0: { cellWidth: 120 },
            1: { cellWidth: 'auto', halign: 'right' }
        },
        didParseCell: function (data: any) {
            if (data.row.index === tableData.length - 1 && data.section === 'body') {
                data.cell.styles.fontStyle = 'bold';
                data.cell.styles.textColor = [15, 23, 42]; // text-slate-900
                data.cell.styles.fillColor = [241, 245, 249]; // bg-slate-100
            }
        }
    });

    // 6. Pied de page & Conditions
    const finalY = (doc as any).lastAutoTable.finalY + 20;
    doc.setFontSize(9);
    doc.setTextColor(100);
    if (facture.hasRetenueGarantie && facture.dateLiberationRetenue) {
        doc.text(`Une retenue de garantie a été appliquée. Date de libération théorique : ${new Date(facture.dateLiberationRetenue).toLocaleDateString('fr-FR')}`, 15, finalY);
    }

    doc.text("En cas de retard de paiement, une pénalité de 3 fois le taux d'intérêt légal sera appliquée.", 15, finalY + 10);
    doc.text("Indemnité forfaitaire pour frais de recouvrement : 40 euros.", 15, finalY + 15);

    // Retourne le document pour être sauvegardé
    return doc;
}

export function telechargerPDF(facture: Facture) {
    const doc = genererPDF(facture);
    doc.save(`Facture_${facture.reference}.pdf`);
}
