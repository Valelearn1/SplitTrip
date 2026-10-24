import { Link } from 'react-router'
import { LEGAL } from './legal'
import { LegalPage } from './LegalPage'

/** Termini e condizioni (D-72). */
export function TermsPage() {
  return (
    <LegalPage title="Termini e condizioni">
      <h2>Il servizio</h2>
      <p>
        SplitTrip è un progetto didattico, realizzato da {LEGAL.owner} come progetto finale di un corso di sviluppo web.
        È gratuito e senza pubblicità.
      </p>
      <p>
        Il servizio è offerto così com'è: gira su server gratuiti, può essere lento alla prima apertura, interrompersi o
        venire chiuso, e i dati possono andare persi. Non usarlo come unico posto in cui tenere informazioni importanti.
      </p>

      <h2>Account</h2>
      <ul>
        <li>Per usare SplitTrip devi avere almeno 14 anni.</li>
        <li>Usa dati veri e custodisci la password: quello che avviene con il tuo account è sotto la tua responsabilità. Se sospetti un accesso non tuo, cambia la password dal profilo.</li>
        <li>Chi ha il codice invito di un viaggio può entrarci: condividilo solo con le persone del gruppo.</li>
      </ul>

      <h2>I tuoi contenuti</h2>
      <ul>
        <li>Spese, foto, messaggi e liste restano tuoi. Caricandoli permetti a SplitTrip di conservarli e di mostrarli alle persone del viaggio, solo per far funzionare il servizio.</li>
        <li>Carica solo contenuti di cui hai i diritti, e foto di persone che sono d'accordo.</li>
      </ul>

      <h2>Uso corretto</h2>
      <p>Non è permesso:</p>
      <ul>
        <li>caricare contenuti illegali, offensivi o che violano diritti di terzi;</li>
        <li>tentare di entrare in viaggi o account che non sono tuoi;</li>
        <li>sovraccaricare il servizio o aggirarne i limiti;</li>
        <li>usarlo per scopi commerciali.</li>
      </ul>
      <p>In caso di violazione l'account può essere sospeso e i contenuti rimossi.</p>

      <h2>Conti e consigli</h2>
      <ul>
        <li>SplitTrip non sposta denaro: calcola saldi e rimborsi in base a quello che il gruppo registra. Controllate gli importi prima di pagare.</li>
        <li>I cambi tra valute sono quelli pubblicati dalla Banca centrale europea, oppure quelli scritti a mano, e possono essere diversi da quelli applicati dalla vostra banca.</li>
        <li>Meteo, proposte di luoghi e consigli generati dall'intelligenza artificiale sono indicativi e possono essere sbagliati.</li>
      </ul>

      <h2>Responsabilità</h2>
      <p>
        Nei limiti consentiti dalla legge, l'autrice non risponde di danni causati dall'uso del servizio, da interruzioni o
        dalla perdita di dati, né degli accordi economici tra le persone del gruppo. Restano validi i diritti che la legge
        riconosce in ogni caso.
      </p>

      <h2>Modifiche e legge applicabile</h2>
      <p>
        Questi termini possono cambiare: la data in alto indica l'ultima versione, e continuando a usare SplitTrip accetti
        quella in vigore. Si applica la legge italiana. Come vengono trattati i dati personali lo spiega
        l'<Link to="/privacy">Informativa sulla privacy</Link>.
      </p>
    </LegalPage>
  )
}
