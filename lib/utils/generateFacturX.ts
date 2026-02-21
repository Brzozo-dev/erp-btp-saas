import { Facture } from '@/types/facture';
import { useParametresStore } from '@/lib/stores/parametresStore';

/**
 * Générateur de fichier XML au format Factur-X (Norme d'Exigences Minimales EN 16931)
 * Pour l'instant, on se base sur le profil "MINIMUM" ou "BASIC WL".
 */

export function genererXMLFacturX(facture: Facture): string {
    const comptaDefaut = useParametresStore.getState().compta;

    // Format de date requis : YYYYMMDD
    const dateEmi = new Date(facture.dateEmission);
    const dateEmissionStr = `${dateEmi.getFullYear()}${String(dateEmi.getMonth() + 1).padStart(2, '0')}${String(dateEmi.getDate()).padStart(2, '0')}`;

    let dateEchStr = '';
    if (facture.dateEcheance) {
        const dateEch = new Date(facture.dateEcheance);
        dateEchStr = `${dateEch.getFullYear()}${String(dateEch.getMonth() + 1).padStart(2, '0')}${String(dateEch.getDate()).padStart(2, '0')}`;
    } else {
        dateEchStr = dateEmissionStr; // Fallback
    }

    // Le XML structuré selon le schéma CrossIndustryInvoice (CII)
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rsm:CrossIndustryInvoice xmlns:rsm="urn:un:unece:uncefact:data:standard:CrossIndustryInvoice:100"
    xmlns:qdt="urn:un:unece:uncefact:data:standard:QualifiedDataType:100"
    xmlns:ram="urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEntity:100"
    xmlns:udt="urn:un:unece:uncefact:data:standard:UnqualifiedDataType:100">
    <rsm:ExchangedDocumentContext>
        <ram:GuidelineSpecifiedDocumentContextParameter>
            <ram:ID>urn:factur-x.eu:1p0:minimum</ram:ID>
        </ram:GuidelineSpecifiedDocumentContextParameter>
    </rsm:ExchangedDocumentContext>
    <rsm:ExchangedDocument>
        <ram:ID>${facture.reference}</ram:ID>
        <ram:TypeCode>380</ram:TypeCode> <!-- 380 = Facture Commerciale -->
        <ram:IssueDateTime>
            <udt:DateTimeString format="102">${dateEmissionStr}</udt:DateTimeString>
        </ram:IssueDateTime>
    </rsm:ExchangedDocument>
    <rsm:SupplyChainTradeTransaction>
        <!-- Vendeur (Nous) -->
        <ram:ApplicableHeaderTradeAgreement>
            <ram:SellerTradeParty>
                <ram:Name>Entreprise BTP Demo</ram:Name> <!-- A remplacer par les infos de l'entreprise -->
                <ram:PostalTradeAddress>
                    <ram:CountryID>FR</ram:CountryID>
                </ram:PostalTradeAddress>
                <ram:SpecifiedTaxRegistration>
                    <ram:ID schemeID="VA">FRXX999999999</ram:ID> <!-- Numéro de TVA Intracommunautaire -->
                </ram:SpecifiedTaxRegistration>
            </ram:SellerTradeParty>
            <!-- Acheteur (Client) -->
            <ram:BuyerTradeParty>
                <ram:Name>${facture.clientName}</ram:Name>
                <ram:PostalTradeAddress>
                    <ram:CountryID>FR</ram:CountryID>
                </ram:PostalTradeAddress>
            </ram:BuyerTradeParty>
        </ram:ApplicableHeaderTradeAgreement>
        
        <ram:ApplicableHeaderTradeDelivery>
            <!-- L'adresse de livraison ou la date de prestation réelle pourrait aller ici -->
        </ram:ApplicableHeaderTradeDelivery>
        
        <ram:ApplicableHeaderTradeSettlement>
            <ram:InvoiceCurrencyCode>EUR</ram:InvoiceCurrencyCode>
            <!-- Total HT, TVA, TTC -->
            <ram:SpecifiedTradeSettlementHeaderMonetarySummation>
                <ram:LineTotalAmount>${facture.montantHT.toFixed(2)}</ram:LineTotalAmount> <!-- Net HT -->
                <ram:TaxBasisTotalAmount>${facture.montantHT.toFixed(2)}</ram:TaxBasisTotalAmount>
                <ram:TaxTotalAmount currencyID="EUR">${facture.montantTVA.toFixed(2)}</ram:TaxTotalAmount> <!-- Total TVA -->
                <ram:GrandTotalAmount>${facture.montantTTC.toFixed(2)}</ram:GrandTotalAmount> <!-- Net TTC -->
                <ram:DuePayableAmount>${facture.montantTTC.toFixed(2)}</ram:DuePayableAmount> <!-- Reste à payer, simplifié ici -->
            </ram:SpecifiedTradeSettlementHeaderMonetarySummation>
        </ram:ApplicableHeaderTradeSettlement>
    </rsm:SupplyChainTradeTransaction>
</rsm:CrossIndustryInvoice>
`;

    return xml.trim();
}

/**
 * Fonction pour déclencher le téléchargement exclusif du fichier XML
 * Dans un vrai système, ce XML est injecté comme pièce jointe dans un fichier PDF/A-3. 
 */
export function telechargerXMLFacturX(facture: Facture): void {
    const xmlContent = genererXMLFacturX(facture);

    // Création du lien de téléchargement
    const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `factur-x_${facture.reference}.xml`);

    // Simuler le clic
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
