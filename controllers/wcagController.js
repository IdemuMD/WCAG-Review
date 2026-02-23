// Static WCAG assessment data (no database)
const assessments = [
    {
        id: 1,
        websiteName: 'Example Portal',
        websiteUrl: 'https://www.example.com',
        imageUrl: 'https://via.placeholder.com/600x400?text=Example+Portal',
        assessment: 'Nettsiden har god tilgjengelighet med klare kontraster og semantisk HTML. Noen mindre forbedringer kan gjøres på lenke-tekst og skjema-labels.',
        score: 4,
        criteriaChecked: [
            'Tilstrekkelig kontrast (4.5:1 for normal tekst)',
            'Semantiske overskriftsstrukturer',
            'Alt-tekst på bilder',
            'Tydelig fokus-indikator'
        ]
    }
];

// Get all assessments
function getAllAssessments() {
    return assessments;
}

// Get single assessment by ID
function getAssessmentById(id) {
    return assessments.find(assessment => assessment.id === parseInt(id));
}

module.exports = {
    getAllAssessments,
    getAssessmentById
};

