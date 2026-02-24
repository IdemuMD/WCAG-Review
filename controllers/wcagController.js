// Static WCAG assessment data (no database)
let assessments = [
    {
        id: 1,
        websiteName: 'Example Portal',
        websiteUrl: 'https://www.example.com',
        imageUrl: 'https://via.placeholder.com/600x400?text=Example+Portal',
        assessment: 'Nettsiden har god tilgjengelighet med klare kontraster og semantisk HTML. Noen mindre forbedringer kan gjøres på lenke-tekst og skjema-labels.',
        score: 4,
        username: 'admin',
        criteriaChecked: [
            'Tilstrekkelig kontrast (4.5:1 for normal tekst)',
            'Semantiske overskriftsstrukturer',
            'Alt-tekst på bilder',
            'Tydelig fokus-indikator'
        ]
    },
    {
        id: 2,
        websiteName: 'Norsk Helsenett',
        websiteUrl: 'https://www.nhn.no',
        imageUrl: 'https://via.placeholder.com/600x400?text=Norsk+Helsenett',
        assessment: 'God tilgjengelighet generelt. Bør forbedre skjema-labels og gi mer tid på automatisk utlogging.',
        score: 3,
        username: 'tester1',
        criteriaChecked: [
            'Kontrast er god',
            'Navigasjon er logisk',
            'Mangler noen alt-tekster'
        ]
    },
    {
        id: 3,
        websiteName: 'NAV',
        websiteUrl: 'https://www.nav.no',
        imageUrl: 'https://via.placeholder.com/600x400?text=NAV',
        assessment: 'Omfattende nettside med god tilgjengelighet. Noen komplekse skjemaer kan være utfordrende for skjermlesere.',
        score: 4,
        username: 'wcag_expert',
        criteriaChecked: [
            'God kontrast',
            'Tydelig navigasjon',
            'Alt-tekst på viktige bilder'
        ]
    }
];

let nextId = 4;

// Get all assessments
function getAllAssessments() {
    return assessments;
}

// Get single assessment by ID
function getAssessmentById(id) {
    return assessments.find(assessment => assessment.id === parseInt(id));
}

// Add new assessment
function addAssessment(assessment) {
    const newAssessment = {
        id: nextId++,
        websiteName: assessment.websiteName,
        websiteUrl: assessment.websiteUrl,
        imageUrl: assessment.imageUrl || 'https://via.placeholder.com/600x400?text=No+Image',
        assessment: assessment.assessment,
        score: parseInt(assessment.score) || 3,
        username: assessment.username || 'Anonym',
        criteriaChecked: assessment.criteriaChecked ? assessment.criteriaChecked.split(',').map(c => c.trim()) : []
    };
    assessments.push(newAssessment);
    return newAssessment;
}

module.exports = {
    getAllAssessments,
    getAssessmentById,
    addAssessment
};

