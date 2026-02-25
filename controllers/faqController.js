const faqController = {
    // Get FAQ page
    getFAQ(req, res) {
        const user = req.session.username ? { username: req.session.username } : null;
        
        const faqs = [
            {
                question: 'Hva er WCAG?',
                answer: 'WCAG (Web Content Accessibility Guidelines) er internasjonale retningslinjer for tilgjengelighet på nett. Retningslinjene er utviklet av W3C og definerer hvordan man kan gjøre nettinnhold mer tilgjengelig for personer med funksjonshemninger.'
            },
            {
                question: 'Hva betyr WCAG-score?',
                answer: 'WCAG-scoren er en vurdering av hvor tilgjengelig et nettsted er. Scoren går fra 0 til 100, der 100 er best. Scoren beregnes basert på WAVE-analyseverktøyet som sjekker for ulike tilgjengelighetsproblemer som kontrastfeil, manglende alt-tekster, feil bruk av overskrifter, etc.'
            },
            {
                question: 'Hvordan legges til en vurdering?',
                answer: 'For å legge til en vurdering må du først opprette en konto og logge inn. Deretter kan du gå til "Legg til vurdering"-siden, fylle inn nettstedets navn og URL, og deretter fylle i vurderingsdetaljene.'
            },
            {
                question: 'Hva er en WAVE-analyse?',
                answer: 'WAVE (Web Accessibility Evaluation Tool) er et verktøy som analyserer nettsider for tilgjengelighetsproblemer. Verktøyet identifiserer feil, advarsler og funksjoner som kan forbedre tilgjengeligheten.'
            },
            {
                question: 'Kan jeg stemme på vurderinger?',
                answer: 'Ja, du kan stemme positivt eller negativt på vurderinger. Du må være logget inn for å stemme. Stemmene hjelper andre brukere med å finne de mest nyttige vurderingene.'
            },
            {
                question: 'Hva gjør jeg hvis jeg ser en upassende vurdering?',
                answer: 'Hvis du ser en vurdering som er upassende, feilaktig eller spam, kan du rapportere den ved å klikke på "Rapporter"-knappen på vurderingssiden. Administratorene vil deretter behandle rapporten.'
            },
            {
                question: 'Hvordan blir jeg administrator?',
                answer: 'Administratorer er roller som er tildelt av systemets eier. Kontakt systemadministratoren hvis du ønsker å bli administrator.'
            },
            {
                question: 'Hva betyr de ulike WAVE-kategoriene?',
                answer: 'WAVE-analysen gir resultater i flere kategorier: Feil (errors) er alvorlige tilgjengelighetsproblemer, Advarsler (alerts) er potensielle problemer, Funksjoner (features) er positive elementer, Strukturelt (structural) viser strukturproblemer, og ARIA/HTML5 viser bruk av tilgjengelighetsattributter.'
            },
            {
                question: 'Hvordan tolkes WCAG-prinsippene?',
                answer: 'WCAG er basert på fire prinsipp: 1) Mulig å oppfatte - informasjon må presenteres på måter brukere kan oppfatte, 2) Mulig å betjene - brukergrensesnittet må være mulig å betjene, 3) Forståelig - informasjon og betjening må være forståelig, 4) Robust - innholdet må være robust nok til å tolkes av ulike brukeragenter.'
            },
            {
                question: 'Er dette en offisiell WCAG-evaluering?',
                answer: 'Nei, vurderingene på denne siden er community-baserte og er ment som veiledning. For en offisiell WCAG-evaluering anbefales det å kontakte profesjonelle tilgjengelighetskonsulenter eller bruke offisielle evalueringsverktøy.'
            }
        ];
        
        res.render('faq', {
            faqs,
            user
        });
    }
};

module.exports = faqController;

