export const environment = {
  production: false,
  firebase: {
    apiKey: "", // Paste your Firebase API Key here
    authDomain: "vitacall-campus.firebaseapp.com",
    projectId: "vitacall-campus",
    storageBucket: "vitacall-campus.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef1234567890"
  },
  // When true or when apiKey is blank, VitaCall uses full reactive mock storage (with realistic seed data)
  demoMode: true,
  institution: {
    name: "Western Campus Health Services",
    department: "Student Affairs & Boarding House Outreach Unit",
    address: "University Boulevard, Care District",
    contact: "(02) 8920-1234 / clinic@campus.edu",
    director: "Dr. Franz Go. MD, FPSP",
    chiefNurse: "Ms. Merilyn Y. Ayo, RN, MSN"
  }
};
