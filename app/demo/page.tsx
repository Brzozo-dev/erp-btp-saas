import { redirect } from 'next/navigation';

export default function DemoPage() {
    // Pour l'instant, redirection vers login
    // Plus tard, on pourra créer une vraie démo avec des données fictives
    redirect('/login');
}
