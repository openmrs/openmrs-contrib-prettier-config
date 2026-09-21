export const fixtures = [
  {
    filepath: 'example.ts',
    input: 'const settings={label:"OpenMRS",enabled:true};\nconst values=["first","second"];\n',
    expected: "const settings = { label: 'OpenMRS', enabled: true };\nconst values = ['first', 'second'];\n",
  },
  {
    filepath: 'example.tsx',
    input:
      'const view = <PatientCard patientIdentifier="a-long-patient-identifier" encounterDescription="a-long-encounter-description" locationDescription="a-long-location-description" />;\n',
    expected:
      'const view = (\n  <PatientCard\n    patientIdentifier="a-long-patient-identifier"\n    encounterDescription="a-long-encounter-description"\n    locationDescription="a-long-location-description"\n  />\n);\n',
  },
  {
    filepath: 'example.scss',
    input: '.card{color:red;&:hover{color:blue}}\n',
    expected: '.card {\n  color: red;\n  &:hover {\n    color: blue;\n  }\n}\n',
  },
  {
    filepath: 'example.json',
    input: '{"label":"OpenMRS","enabled":true}\n',
    expected: '{ "label": "OpenMRS", "enabled": true }\n',
  },
  {
    filepath: 'example.md',
    input: '#   OpenMRS\n\n-   patient\n-   encounter\n',
    expected: '# OpenMRS\n\n- patient\n- encounter\n',
  },
  {
    filepath: 'wide.ts',
    input:
      'const patient = { identifier: "1234567890", givenName: "Alexandra", familyName: "Montgomery", location: "Outpatient" };\n',
    expected:
      "const patient = { identifier: '1234567890', givenName: 'Alexandra', familyName: 'Montgomery', location: 'Outpatient' };\n",
  },
  {
    filepath: 'trailing.ts',
    input:
      'const patient = { identifier: "1234567890", givenName: "Alexandra", familyName: "Montgomery", location: "Outpatient", description: "A longer description" };\n',
    expected:
      "const patient = {\n  identifier: '1234567890',\n  givenName: 'Alexandra',\n  familyName: 'Montgomery',\n  location: 'Outpatient',\n  description: 'A longer description',\n};\n",
  },
];
