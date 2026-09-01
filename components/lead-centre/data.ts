export const leadStages = [
  "NEW ENQUIRIES",
  "AI QUALIFYING",
  "TEST DRIVE BOOKED",
] as const;
export const sectionLabels = [
  "Dashboard",
  "Leads Pipeline",
  "Conversations",
  "Inventory",
  "Appointments",
  "Compliance",
  "Settings",
] as const;
export const dealershipNames = [
  "BYD Melbourne City",
  "BYD Fairfield VIC",
  "BYD Fairfield",
] as const;
export const statusLabels = [
  "Contact",
  "Commitment",
  "Human assisted",
  "AI active",
] as const;

// Mock leads data
export const leads = [
  {
    name: "SMS Connect Prospect",
    vehicle: "2025 BYD SEAL",
    dealer: "BYD Melbourne City",
    score: 72,
    tag: "Contact",
    color: "blue",
  },
  {
    name: "Carsalesconnect Prospect",
    vehicle: "2025 BYD SHARK 6",
    dealer: "BYD Fairfield VIC",
    score: 68,
    tag: "Contact",
    color: "blue",
  },
  {
    name: "Carsalesconnect Prospect (2)",
    vehicle: "2025 BYD SHARK 6",
    dealer: "BYD Fairfield VIC",
    score: 90,
    tag: "Commitment",
    color: "green",
  },
  {
    name: "David Kennedy",
    vehicle: "2026 BYD SHARK 6 Premium",
    dealer: "BYD Fairfield VIC",
    score: 94,
    tag: "Commitment",
    color: "green",
  },
  {
    name: "Carsalesconnect Prospect",
    vehicle: "2025 BYD SEALION 8",
    dealer: "BYD Melbourne City",
    score: 58,
    tag: "Contact",
    color: "amber",
  },
];

// Mock inventory data
export const inventory = Array.from({ length: 12 }, (_, i) => ({
  stock: [
    "6944",
    "6993",
    "6942",
    "6990",
    "6994",
    "6991",
    "7819",
    "2871",
    "7277",
    "8618",
    "8617",
    "9854",
  ][i],
  model: `${i % 3 ? "2026" : "2025"} BYD ATTO 1`,
  paint: ["Apricity White", "Pine Lime", "Cosmos Black", "Arctic Blue"][i % 4],
  location: [
    "BYD Wollongong",
    "BYD Wagga Wagga",
    "BYD Castle Hill",
    "BYD Homebush",
    "BYD Haberfield",
    "BYD Campbelltown",
  ][i % 6],
  status: i % 4 === 2 ? "In Transit" : "Available",
  price: [
    "$23,990",
    "$24,490",
    "$24,751",
    "$25,490",
    "$25,781",
    "$27,164",
    "$27,681",
    "$28,490",
  ][i % 8],
}));

// Mock conversations data
export const conversations = [
  "Carsalesconnect Prospect",
  "Carsalesconnect Prospect",
  "Atem Tong (3)",
  "David Kennedy",
  "SMS Connect Prospect",
  "Carsalesconnect Prospect (2)",
];

// Dealership details for Settings page
export const dealershipDetails: Record<string, any> = {
  "BYD Fairfield": {
    name: "BYD Fairfield",
    legalEntity: "BYD Fairfield (EAutos Group F)",
    address: "72-74 Grand Avenue, Camellia",
    suburb: "Fairfield",
    state: "NSW",
    phone: "(02) 9724 5088",
    email: "sales@bydfairfield.com.au",
    timezone: "Australia/Sydney",
    smsSenderId: "BYDFairfield",
    autogateId: "AG-FAIRFIELD-001",
    autogateUsername: "greg.dennis@bydfairfield.com",
    weekdayHoursStart: "09:00",
    weekdayHoursEnd: "20:00",
    saturdayHoursStart: "09:00",
    saturdayHoursEnd: "17:00",
  },
  "BYD Fairfield VIC": {
    name: "BYD Fairfield VIC",
    legalEntity: "BYD Fairfield VIC (EAutos Group V)",
    address: "96 Grange Road, Fairfield",
    suburb: "Fairfield",
    state: "VIC",
    phone: "(03) 9000 1234",
    email: "sales@bydfaifieldvic.com.au",
    timezone: "Australia/Melbourne",
    smsSenderId: "BYDFldVIC",
    autogateId: "AG-FAIRFIELD-VIC-001",
    autogateUsername: "sales@bydfaifieldvic.com.au",
    weekdayHoursStart: "09:00",
    weekdayHoursEnd: "20:00",
    saturdayHoursStart: "09:00",
    saturdayHoursEnd: "17:00",
  },
  "BYD Melbourne City": {
    name: "BYD Melbourne City",
    legalEntity: "BYD Melbourne City (EAutos Group)",
    address: "435 Williamstown Road, Port Melbourne",
    suburb: "Port Melbourne",
    state: "VIC",
    phone: "(03) 9646 9000",
    email: "sales@bydmelbourne.com.au",
    timezone: "Australia/Melbourne",
    smsSenderId: "BYDMelb",
    autogateId: "AG-MELCITY-001",
    autogateUsername: "greg.dennis@bydmelbcity.com",
    weekdayHoursStart: "09:00",
    weekdayHoursEnd: "20:00",
    saturdayHoursStart: "09:00",
    saturdayHoursEnd: "17:00",
  },
};
