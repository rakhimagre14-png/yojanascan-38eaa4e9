export type Profile = {
  name: string;
  age: number | null;
  gender: "male" | "female" | "other" | "";
  state: string;
  residence: "urban" | "rural" | "";
  category: "general" | "obc" | "sc" | "st" | "";
  religion: "hindu" | "muslim" | "christian" | "sikh" | "buddhist" | "jain" | "parsi" | "other" | "";
  occupation:
    | "student"
    | "farmer"
    | "salaried"
    | "self_employed"
    | "unemployed"
    | "homemaker"
    | "retired"
    | "labour"
    | "";
  annualIncome: number | null; // INR
  landHolding: number | null; // acres, farmers
  disability: boolean;
  bpl: boolean;
  hasBankAccount: boolean;
  // Documents (uploaded / on-hand)
  documents: {
    aadhaar: boolean;
    pan: boolean;
    voterId: boolean;
    incomeCertificate: boolean;
    casteCertificate: boolean;
    domicile: boolean;
    disabilityCertificate: boolean;
    bankPassbook: boolean;
    rationCard: boolean;
    landRecord: boolean;
    marksheet: boolean;
  };
};

export type DocKey = keyof Profile["documents"];

export const DOCUMENT_LABELS: Record<DocKey, string> = {
  aadhaar: "Aadhaar Card",
  pan: "PAN Card",
  voterId: "Voter ID",
  incomeCertificate: "Income Certificate",
  casteCertificate: "Caste Certificate",
  domicile: "Domicile / Residence Certificate",
  disabilityCertificate: "Disability Certificate (UDID)",
  bankPassbook: "Bank Passbook",
  rationCard: "Ration Card",
  landRecord: "Land Record (Khasra / 7-12)",
  marksheet: "Latest Marksheet",
};

export type Scheme = {
  id: string;
  name: string;
  ministry: string;
  category: "Housing" | "Agriculture" | "Education" | "Health" | "Employment" | "Women & Child" | "Social Welfare" | "Finance";
  summary: string;
  benefits: string;
  requiredDocs: DocKey[];
  link: string;
  eligible: (p: Profile) => { ok: boolean; reasons: string[] };
};

const need = (p: Profile, docs: DocKey[]) => docs.filter((d) => !p.documents[d]);

export const SCHEMES: Scheme[] = [
  {
    id: "pmay-g",
    name: "Pradhan Mantri Awas Yojana (Gramin)",
    ministry: "Ministry of Rural Development",
    category: "Housing",
    summary: "Financial assistance to build a pucca house for rural households without adequate shelter.",
    benefits: "₹1.20 lakh (plain) / ₹1.30 lakh (hilly) + MGNREGA labour + toilet support.",
    requiredDocs: ["aadhaar", "bankPassbook", "incomeCertificate"],
    link: "https://pmayg.nic.in/",
    eligible: (p) => {
      const r: string[] = [];
      if (p.residence !== "rural") r.push("Meant for rural households");
      if ((p.annualIncome ?? Infinity) > 300000) r.push("Household income should be under ₹3,00,000");
      return { ok: r.length === 0, reasons: r };
    },
  },
  {
    id: "pmay-u",
    name: "Pradhan Mantri Awas Yojana (Urban) 2.0",
    ministry: "Ministry of Housing & Urban Affairs",
    category: "Housing",
    summary: "Interest subsidy and assistance for urban housing under EWS/LIG/MIG categories.",
    benefits: "Up to ₹1.80 lakh interest subsidy on home loans.",
    requiredDocs: ["aadhaar", "pan", "incomeCertificate", "bankPassbook"],
    link: "https://pmay-urban.gov.in/",
    eligible: (p) => {
      const r: string[] = [];
      if (p.residence !== "urban") r.push("Meant for urban households");
      if ((p.annualIncome ?? Infinity) > 900000) r.push("Income should be under ₹9,00,000 (MIG-II cap)");
      return { ok: r.length === 0, reasons: r };
    },
  },
  {
    id: "pm-kisan",
    name: "PM-KISAN Samman Nidhi",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    category: "Agriculture",
    summary: "Direct income support to landholding farmer families.",
    benefits: "₹6,000/year in three equal instalments directly to bank account.",
    requiredDocs: ["aadhaar", "bankPassbook", "landRecord"],
    link: "https://pmkisan.gov.in/",
    eligible: (p) => {
      const r: string[] = [];
      if (p.occupation !== "farmer") r.push("Only for farmer families");
      if ((p.landHolding ?? 0) <= 0) r.push("Requires cultivable land in your name");
      return { ok: r.length === 0, reasons: r };
    },
  },
  {
    id: "kcc",
    name: "Kisan Credit Card (KCC)",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    category: "Agriculture",
    summary: "Short-term credit for cultivation and allied activities at subsidised interest.",
    benefits: "Loans up to ₹3 lakh at 4% effective interest with timely repayment.",
    requiredDocs: ["aadhaar", "pan", "landRecord", "bankPassbook"],
    link: "https://www.myscheme.gov.in/schemes/kcc",
    eligible: (p) => {
      const r: string[] = [];
      if (p.occupation !== "farmer") r.push("Only for farmers / tenant cultivators");
      if ((p.age ?? 0) < 18) r.push("Must be 18 or older");
      return { ok: r.length === 0, reasons: r };
    },
  },
  {
    id: "ayushman",
    name: "Ayushman Bharat — PM Jan Arogya Yojana",
    ministry: "Ministry of Health & Family Welfare",
    category: "Health",
    summary: "Cashless secondary and tertiary care hospitalisation cover for eligible families.",
    benefits: "₹5 lakh per family per year at empanelled hospitals.",
    requiredDocs: ["aadhaar", "rationCard"],
    link: "https://pmjay.gov.in/",
    eligible: (p) => {
      const r: string[] = [];
      if (!p.bpl && (p.annualIncome ?? Infinity) > 250000)
        r.push("Deprivation-based SECC list or BPL / low income required");
      return { ok: r.length === 0, reasons: r };
    },
  },
  {
    id: "ayushman-vaya",
    name: "Ayushman Vaya Vandana (70+)",
    ministry: "Ministry of Health & Family Welfare",
    category: "Health",
    summary: "Free health cover for every senior citizen aged 70 and above, regardless of income.",
    benefits: "₹5 lakh/year top-up cover for 70+ citizens.",
    requiredDocs: ["aadhaar"],
    link: "https://pmjay.gov.in/",
    eligible: (p) => {
      const r: string[] = [];
      if ((p.age ?? 0) < 70) r.push("Must be 70 or older");
      return { ok: r.length === 0, reasons: r };
    },
  },
  {
    id: "sukanya",
    name: "Sukanya Samriddhi Yojana",
    ministry: "Ministry of Finance",
    category: "Women & Child",
    summary: "Long-term savings scheme for the girl child with attractive tax-free interest.",
    benefits: "~8.2% p.a. interest, 80C deduction, maturity at 21 years.",
    requiredDocs: ["aadhaar", "bankPassbook"],
    link: "https://www.nsiindia.gov.in/",
    eligible: (p) => {
      const r: string[] = [];
      if (p.gender !== "female") r.push("Account is for a girl child");
      if ((p.age ?? 99) > 10) r.push("Girl child must be under 10 years old");
      return { ok: r.length === 0, reasons: r };
    },
  },
  {
    id: "ujjwala",
    name: "PM Ujjwala Yojana 2.0",
    ministry: "Ministry of Petroleum & Natural Gas",
    category: "Women & Child",
    summary: "Free LPG connection to women from poor households.",
    benefits: "Free deposit, first refill and stove; subsidy on refills.",
    requiredDocs: ["aadhaar", "bankPassbook", "rationCard"],
    link: "https://www.pmuy.gov.in/",
    eligible: (p) => {
      const r: string[] = [];
      if (p.gender !== "female") r.push("Applicant must be a woman");
      if ((p.age ?? 0) < 18) r.push("Must be 18 or older");
      if (!p.bpl && (p.annualIncome ?? Infinity) > 200000) r.push("Preference for BPL / low-income households");
      return { ok: r.length === 0, reasons: r };
    },
  },
  {
    id: "nsp-post-matric",
    name: "Post-Matric Scholarship (SC/ST/OBC)",
    ministry: "Ministry of Social Justice & Empowerment",
    category: "Education",
    summary: "Scholarship for students from SC/ST/OBC communities studying post Class 10.",
    benefits: "Full tuition + maintenance allowance, paid via DBT.",
    requiredDocs: ["aadhaar", "casteCertificate", "incomeCertificate", "marksheet", "bankPassbook"],
    link: "https://scholarships.gov.in/",
    eligible: (p) => {
      const r: string[] = [];
      if (p.occupation !== "student") r.push("Must be a student");
      if (!["sc", "st", "obc"].includes(p.category)) r.push("Only for SC / ST / OBC categories");
      if ((p.annualIncome ?? Infinity) > 250000) r.push("Family income should be under ₹2,50,000");
      return { ok: r.length === 0, reasons: r };
    },
  },
  {
    id: "pragati",
    name: "AICTE Pragati Scholarship (Girls)",
    ministry: "Ministry of Education",
    category: "Education",
    summary: "Scholarship for girl students pursuing technical education.",
    benefits: "₹50,000 per year for tuition, books and stationery.",
    requiredDocs: ["aadhaar", "incomeCertificate", "marksheet", "bankPassbook"],
    link: "https://www.aicte-india.org/",
    eligible: (p) => {
      const r: string[] = [];
      if (p.gender !== "female") r.push("Only for female students");
      if (p.occupation !== "student") r.push("Must be currently studying");
      if ((p.annualIncome ?? Infinity) > 800000) r.push("Family income should be under ₹8,00,000");
      return { ok: r.length === 0, reasons: r };
    },
  },
  {
    id: "mudra",
    name: "PM MUDRA Yojana",
    ministry: "Ministry of Finance",
    category: "Finance",
    summary: "Collateral-free loans for micro and small non-farm enterprises.",
    benefits: "Loans up to ₹20 lakh under Shishu / Kishor / Tarun / Tarun Plus.",
    requiredDocs: ["aadhaar", "pan", "bankPassbook"],
    link: "https://www.mudra.org.in/",
    eligible: (p) => {
      const r: string[] = [];
      if (!["self_employed", "unemployed", "salaried", "homemaker", "labour"].includes(p.occupation))
        r.push("Meant for micro-entrepreneurs and aspiring business owners");
      if ((p.age ?? 0) < 18) r.push("Must be 18 or older");
      return { ok: r.length === 0, reasons: r };
    },
  },
  {
    id: "standup",
    name: "Stand-Up India",
    ministry: "Department of Financial Services",
    category: "Finance",
    summary: "Bank loans for SC/ST and women entrepreneurs to set up greenfield enterprises.",
    benefits: "₹10 lakh to ₹1 crore composite loan.",
    requiredDocs: ["aadhaar", "pan", "bankPassbook", "casteCertificate"],
    link: "https://www.standupmitra.in/",
    eligible: (p) => {
      const r: string[] = [];
      const isSCST = p.category === "sc" || p.category === "st";
      if (!(isSCST || p.gender === "female")) r.push("For SC/ST or women entrepreneurs");
      if ((p.age ?? 0) < 18) r.push("Must be 18 or older");
      return { ok: r.length === 0, reasons: r };
    },
  },
  {
    id: "pmsym",
    name: "PM Shram Yogi Maandhan",
    ministry: "Ministry of Labour & Employment",
    category: "Social Welfare",
    summary: "Voluntary pension scheme for unorganised sector workers.",
    benefits: "Assured ₹3,000/month pension after age 60.",
    requiredDocs: ["aadhaar", "bankPassbook"],
    link: "https://maandhan.in/",
    eligible: (p) => {
      const r: string[] = [];
      if (!(p.age && p.age >= 18 && p.age <= 40)) r.push("Age must be between 18 and 40");
      if ((p.annualIncome ?? Infinity) > 180000) r.push("Monthly income should be ≤ ₹15,000");
      if (!["labour", "self_employed", "unemployed", "homemaker"].includes(p.occupation))
        r.push("For unorganised sector workers");
      return { ok: r.length === 0, reasons: r };
    },
  },
  {
    id: "iay-disability",
    name: "Deendayal Disabled Rehabilitation Scheme",
    ministry: "Dept. of Empowerment of Persons with Disabilities",
    category: "Social Welfare",
    summary: "Support for education, vocational training and rehabilitation of persons with disabilities.",
    benefits: "Aids, appliances, scholarships and skill training.",
    requiredDocs: ["aadhaar", "disabilityCertificate"],
    link: "https://depwd.gov.in/",
    eligible: (p) => {
      const r: string[] = [];
      if (!p.disability) r.push("Requires certified disability (UDID)");
      return { ok: r.length === 0, reasons: r };
    },
  },
  {
    id: "nrega",
    name: "MGNREGA — 100 Days Work Guarantee",
    ministry: "Ministry of Rural Development",
    category: "Employment",
    summary: "Guaranteed 100 days of wage employment per rural household per year.",
    benefits: "State-notified daily wage, paid via DBT.",
    requiredDocs: ["aadhaar", "bankPassbook"],
    link: "https://nrega.nic.in/",
    eligible: (p) => {
      const r: string[] = [];
      if (p.residence !== "rural") r.push("For rural households only");
      if ((p.age ?? 0) < 18) r.push("Must be 18 or older");
      return { ok: r.length === 0, reasons: r };
    },
  },
  {
    id: "matru-vandana",
    name: "PM Matru Vandana Yojana",
    ministry: "Ministry of Women & Child Development",
    category: "Women & Child",
    summary: "Maternity benefit for pregnant women and lactating mothers.",
    benefits: "₹5,000 (first child) + ₹6,000 (second, if girl) in instalments.",
    requiredDocs: ["aadhaar", "bankPassbook"],
    link: "https://wcd.nic.in/schemes/pradhan-mantri-matru-vandana-yojana",
    eligible: (p) => {
      const r: string[] = [];
      if (p.gender !== "female") r.push("Only for women");
      if (!(p.age && p.age >= 18 && p.age <= 45)) r.push("Applicable during reproductive age");
      return { ok: r.length === 0, reasons: r };
    },
  },
  {
    id: "atal-pension",
    name: "Atal Pension Yojana",
    ministry: "Ministry of Finance (PFRDA)",
    category: "Social Welfare",
    summary: "Guaranteed pension for citizens, especially those in the unorganised sector.",
    benefits: "Pension of ₹1,000 – ₹5,000/month after 60 based on contribution.",
    requiredDocs: ["aadhaar", "bankPassbook"],
    link: "https://www.pfrda.org.in/",
    eligible: (p) => {
      const r: string[] = [];
      if (!(p.age && p.age >= 18 && p.age <= 40)) r.push("Age must be between 18 and 40");
      if (!p.hasBankAccount) r.push("Requires an active bank account");
      return { ok: r.length === 0, reasons: r };
    },
  },
];

export function evaluate(profile: Profile) {
  const results = SCHEMES.map((s) => {
    const { ok, reasons } = s.eligible(profile);
    const missingDocs = need(profile, s.requiredDocs);
    return { scheme: s, ok, reasons, missingDocs };
  });
  return {
    eligible: results.filter((r) => r.ok),
    ineligible: results.filter((r) => !r.ok),
  };
}

export const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan",
  "Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Delhi","Jammu & Kashmir","Ladakh","Puducherry","Chandigarh","Andaman & Nicobar",
  "Dadra & Nagar Haveli and Daman & Diu","Lakshadweep",
];
