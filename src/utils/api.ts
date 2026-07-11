// API Client for KCIOS (Zoho Catalyst Advanced I/O function connector with local fallbacks)

const API_BASE = "/api";

// Fallback Mock Datasets
const MOCK_CRIMINALS = [
  {
    id: "CRIM-5821",
    name: "Yashas 'Silt' Kumar",
    alias: "Silt Yashas",
    age: 34,
    aadhaar: "4820-XXXX-8921",
    phone: "+91 98450 XXXXX",
    vehicles: ["KA-01-MC-4592"],
    gang: "Lakeside Gang",
    mo: "Late night housebreaking in gated communities, bypasses CCTV using optical laser refraction",
    status: "Active / On Bail",
    riskScore: 84,
    associates: ["CRIM-1204", "CRIM-9921"],
    district: "Bengaluru City"
  },
  {
    id: "CRIM-1204",
    name: "Prathap 'Mechanic' Gowda",
    alias: "Mechanic Prathap",
    age: 29,
    aadhaar: "8391-XXXX-4820",
    phone: "+91 88842 XXXXX",
    vehicles: ["KA-02-JH-1102", "KA-01-MC-4592"],
    gang: "Lakeside Gang",
    mo: "Procures stolen key-fobs, vehicle cloning, dismantles trackers",
    status: "Absconding",
    riskScore: 78,
    associates: ["CRIM-5821"],
    district: "Bengaluru City"
  },
  {
    id: "CRIM-9921",
    name: "Mohan 'SIM' Ramegowda",
    alias: "SIM Mohan",
    age: 41,
    aadhaar: "2019-XXXX-8831",
    phone: "+91 99002 XXXXX",
    vehicles: ["KA-03-MK-7721"],
    gang: "SIM Swappers",
    mo: "SIM swapping, spoofing OTPs, financial phishing fraud",
    status: "Under Watch",
    riskScore: 71,
    associates: ["CRIM-5821"],
    district: "Mysuru City"
  },
  {
    id: "CRIM-3304",
    name: "Vikram 'Ramp' Shetty",
    alias: "Ramp Vikram",
    age: 38,
    aadhaar: "9082-XXXX-1123",
    phone: "+91 97412 XXXXX",
    vehicles: ["KA-19-EE-0091"],
    gang: "Coastal Cartel",
    mo: "Gold chain snatching, highway heist, illegal weapons distribution in coastal belt",
    status: "In Custody",
    riskScore: 92,
    associates: ["CRIM-7782"],
    district: "Mangaluru"
  },
  {
    id: "CRIM-7782",
    name: "Naveen 'Kadal' D'Souza",
    alias: "Kadal Naveen",
    age: 31,
    aadhaar: "1123-XXXX-9082",
    phone: "+91 96112 XXXXX",
    vehicles: [],
    gang: "Coastal Cartel",
    mo: "Contraband smuggling, extortion, safe house rental logistics",
    status: "Absconding",
    riskScore: 86,
    associates: ["CRIM-3304"],
    district: "Mangaluru"
  }
];

const MOCK_CASES = [
  {
    id: "FIR-2026-102",
    title: "Gated Community Burglary in Jayanagar",
    date: "2026-07-02T02:30:00Z",
    district: "Bengaluru City",
    station: "Jayanagar PS",
    crimeType: "Burglary",
    status: "Under Investigation",
    io: "Inspector H. S. Rao",
    description: "Late night break-in at Block 4, Jayanagar Residency. Lock picked cleanly, alarm system bypassed, gold valuables worth 12 Lakhs stolen. A black hatchback spotted nearby.",
    mo: "Optical laser refraction to blind external CCTV, specialized lockpick bypassing dual-bolt digital locks.",
    suspects: ["CRIM-5821"],
    connectedVehicles: ["KA-01-MC-4592"],
    evidence: ["Footprint match of size 9 sneaker", "Laser refraction residual readings", "CCTV capture of KA-01-MC-4592"]
  },
  {
    id: "FIR-2026-109",
    title: "Digital Key Fob Cloning and SUV Theft",
    date: "2026-07-04T03:45:00Z",
    district: "Bengaluru City",
    station: "HSR Layout PS",
    crimeType: "Theft",
    status: "Open",
    io: "Sub-Inspector Sandeep Kumar",
    description: "High-end Fortuner stolen from driveway in HSR Sector 2. Security cameras show a suspect using a relay device to clone key-fob signal. Vehicle tracked briefly to Nice Road before GPS went dead.",
    mo: "Radio frequency relay cloning attacks (keyless entry heist), GPS jammer deployment.",
    suspects: ["CRIM-1204"],
    connectedVehicles: ["KA-02-JH-1102"],
    evidence: ["RF signal scanner logs", "CCTV video footage of relay cloning process"]
  },
  {
    id: "FIR-2026-121",
    title: "OTP Spoofing and Bank Transfer Cyber Fraud",
    date: "2026-07-05T11:00:00Z",
    district: "Mysuru City",
    station: "Cyber Crime PS Mysuru",
    crimeType: "Cyber Crime",
    status: "Under Investigation",
    io: "Inspector Mamatha B. K.",
    description: "Victim received a call posing as a bank manager, coaxed into installing a remote desktop utility. Concurrently, a SIM swap was processed at a local retail outlet. 5.4 Lakhs debited to shell accounts.",
    mo: "Social engineering coupled with retail-store assisted SIM-swap authorization bypass.",
    suspects: ["CRIM-9921"],
    connectedVehicles: [],
    evidence: ["Retail SIM log logs", "Call details record (CDR) showing spoofed carrier packets", "IP route logs pointing to Mysuru server pool"]
  },
  {
    id: "FIR-2026-140",
    title: "Daylight Chain Snatching near Kadri Park",
    date: "2026-07-06T08:15:00Z",
    district: "Mangaluru",
    station: "Kadri PS",
    crimeType: "Chain Snatching",
    status: "Arrest Made",
    io: "Inspector Rajesh D'Souza",
    description: "Two suspects on a Pulsar motorcycle grabbed a gold chain weighing 45g from a morning walker near Kadri Park entrance. Suspects fled towards National Highway 66.",
    mo: "High-speed motorcycle pillion rider grab-and-flee, targeting elderly pedestrians near parks during early morning or evening hours.",
    suspects: ["CRIM-3304"],
    connectedVehicles: ["KA-19-EE-0091"],
    evidence: ["Recovered gold chain fragment", "Witness sketches matching Vikram Shetty's facial structure", "Confession from accomplice"]
  },
  {
    id: "FIR-2026-145",
    title: "Illegal Weapons Transport at NH-66 Checkpost",
    date: "2026-07-07T23:30:00Z",
    district: "Mangaluru",
    station: "Ullal PS",
    crimeType: "Organized Crime",
    status: "Under Investigation",
    io: "Inspector Rajesh D'Souza",
    description: "Routine check of a commercial vehicle led to recovery of three country-made pistols and 20 rounds of ammunition hidden in custom floor panels. Driver fled the scene.",
    mo: "Modification of vehicle cavities (custom floorboards) in commercial trucks to transport weapons across interstate checkpoints.",
    suspects: ["CRIM-7782", "CRIM-3304"],
    connectedVehicles: [],
    evidence: ["Three 7.65mm pistols", "Custom built compartments analysis", "Fingerprints on steering wheel"]
  }
];

const MOCK_VEHICLES = [
  { regNumber: "KA-01-MC-4592", type: "Car (Hatchback)", color: "Black", owner: "Yashas Kumar", status: "Seized", connection: "Linked to Burglary FIR-2026-102" },
  { regNumber: "KA-02-JH-1102", type: "Car (SUV)", color: "White", owner: "Prathap Gowda", status: "Wanted", connection: "Suspected in Fortuner theft FIR-2026-109" },
  { regNumber: "KA-03-MK-7721", type: "Two-Wheeler", color: "Red", owner: "Mohan Ramegowda", status: "Active", connection: "Spotted during SIM delivery fraud" },
  { regNumber: "KA-19-EE-0091", type: "Two-Wheeler (Pulsar)", color: "Blue", owner: "Vikram Shetty", status: "Impounded", connection: "Chain Snatching getaway vehicle FIR-2026-140" }
];

const MOCK_HOTSPOTS = [
  { id: "HS-BGL-1", district: "Bengaluru City", center: [12.9250, 77.5938], radius: 600, label: "Jayanagar Sector Burglary Cluster", riskLevel: "High", suggestedPatrol: "Namma 112 Route 12 - Night patrol 11 PM to 4 AM", lastIncident: "2026-07-02" },
  { id: "HS-BGL-2", district: "Bengaluru City", center: [12.9100, 77.6400], radius: 850, label: "HSR Sector 2 Keyless Theft Zone", riskLevel: "Medium", suggestedPatrol: "Cheetah Patrol 4B - Night patrols 12 AM to 5 AM", lastIncident: "2026-07-04" },
  { id: "HS-MYS-1", district: "Mysuru City", center: [12.2900, 76.6500], radius: 500, label: "SIM Swap Phishing Core", riskLevel: "Medium", suggestedPatrol: "Cyber Crime Unit awareness drive & mobile tower audits", lastIncident: "2026-07-05" },
  { id: "HS-MNG-1", district: "Mangaluru", center: [12.8730, 74.8560], radius: 700, label: "Kadri Park Snatching Hotspot", riskLevel: "High", suggestedPatrol: "Kadri Beat 3 - Morning walkers patrol 5:30 AM to 8:30 AM", lastIncident: "2026-07-06" }
];

const MOCK_DISTRICT_STATS = [
  { name: "Bengaluru City", crimeIndex: 78, predictionsCount: 12, hotspotsCount: 4, casesCount: 204, severity: "Critical" },
  { name: "Mysuru City", crimeIndex: 42, predictionsCount: 5, hotspotsCount: 2, casesCount: 65, severity: "Moderate" },
  { name: "Mangaluru", crimeIndex: 61, predictionsCount: 8, hotspotsCount: 3, casesCount: 92, severity: "High" },
  { name: "Hubballi-Dharwad", crimeIndex: 35, predictionsCount: 3, hotspotsCount: 1, casesCount: 48, severity: "Low" },
  { name: "Belagavi", crimeIndex: 28, predictionsCount: 2, hotspotsCount: 1, casesCount: 31, severity: "Low" }
];

let MOCK_AUDIT_LOGS = [
  { id: 1, timestamp: new Date(Date.now() - 7200000).toISOString(), officer: "DGP H. K. Patel", role: "DGP", action: "Accessed State dashboard metrics", piiMasked: false, resource: "Dashboard Stats" },
  { id: 2, timestamp: new Date(Date.now() - 5400000).toISOString(), officer: "Constable Kumar S.", role: "Constable", action: "Searched FIR records for 'Burglary'", piiMasked: true, resource: "Cases DB" },
  { id: 3, timestamp: new Date(Date.now() - 2880000).toISOString(), officer: "Inspector H. S. Rao", role: "Investigating Officer", action: "Viewed Criminal Yashas Kumar Profile (Aadhaar & phone masked)", piiMasked: true, resource: "Criminal: Yashas Kumar" },
];

function addMockAuditLog(officer: string, role: string, action: string, resource: string, piiMasked = true) {
  const newLog = {
    id: MOCK_AUDIT_LOGS.length + 1,
    timestamp: new Date().toISOString(),
    officer: officer || "System",
    role: role || "Officer",
    action,
    piiMasked,
    resource
  };
  MOCK_AUDIT_LOGS.unshift(newLog);
  return newLog;
}

// Helper: Make HTTP request or fallback to mock logic
async function safeFetch<T>(url: string, options?: RequestInit, fallbackGenerator?: () => T): Promise<T> {
  try {
    const token = sessionStorage.getItem('ksp_auth_token');
    const authHeaders: Record<string, string> = {};
    if (token) {
      authHeaders['Authorization'] = `Bearer ${token}`;
    }

    const modifiedOptions: RequestInit = {
      ...options,
      headers: {
        ...options?.headers,
        ...authHeaders
      }
    };

    const res = await fetch(url, modifiedOptions);
    if (!res.ok) {
      throw new Error(`Server returned code ${res.status}`);
    }
    return await res.json() as T;
  } catch (error) {
    console.warn(`API call to ${url} failed, using local browser engine. Error:`, error);
    if (fallbackGenerator) {
      return fallbackGenerator();
    }
    throw error;
  }
}

export async function fetchCriminals() {
  return safeFetch(`${API_BASE}/criminals`, undefined, () => MOCK_CRIMINALS);
}

export async function fetchCases() {
  return safeFetch(`${API_BASE}/cases`, undefined, () => MOCK_CASES);
}

export async function fetchVehicles() {
  return safeFetch(`${API_BASE}/vehicles`, undefined, () => MOCK_VEHICLES);
}

export async function fetchHotspots() {
  return safeFetch(`${API_BASE}/hotspots`, undefined, () => ({
    hotspots: MOCK_HOTSPOTS,
    districtStats: MOCK_DISTRICT_STATS
  }));
}

export async function fetchAuditLogs() {
  return safeFetch(`${API_BASE}/audit-logs`, undefined, () => MOCK_AUDIT_LOGS);
}

export async function postAuditLog(log: { officer: string; role: string; action: string; resource: string; piiMasked: boolean }) {
  return safeFetch(`${API_BASE}/audit-log`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(log)
  }, () => {
    const newLog = addMockAuditLog(log.officer, log.role, log.action, log.resource, log.piiMasked);
    return { status: "logged", log: newLog };
  });
}

export async function submitSearch(query: string, officer: string, role: string) {
  return safeFetch(`${API_BASE}/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, officer, role })
  }, () => {
    addMockAuditLog(officer, role, `Copilot Search: "${query}"`, "AI Search Gateway");
    const queryLower = query.toLowerCase();
    let responseText = "";
    const matchedData: { criminals: any[]; cases: any[]; vehicles: any[] } = { criminals: [], cases: [], vehicles: [] };

    if (queryLower.includes("vehicle") || queryLower.includes("car") || queryLower.includes("ka01") || queryLower.includes("ka02") || queryLower.includes("ka-")) {
      const matchedVeh = MOCK_VEHICLES.filter(v => 
        queryLower.includes(v.regNumber.toLowerCase().replace(/-/g, '')) || 
        queryLower.includes(v.regNumber.toLowerCase()) ||
        queryLower.includes(v.owner.toLowerCase().split(' ')[0])
      );
      matchedData.vehicles = matchedVeh;
      if (matchedVeh.length > 0) {
        const reg = matchedVeh[0].regNumber;
        matchedData.cases = MOCK_CASES.filter(c => c.connectedVehicles.includes(reg));
        matchedData.criminals = MOCK_CRIMINALS.filter(c => c.vehicles.includes(reg));
        responseText = `I found vehicle registry **${reg}** (${matchedVeh[0].color} ${matchedVeh[0].type}) registered to **${matchedVeh[0].owner}**. This vehicle is linked to **${matchedData.cases.length} active case(s)** and connected to suspect **${matchedData.criminals.map(c => c.name).join(', ')}**.`;
      } else {
        responseText = "I searched the vehicle registry database but could not match the vehicle number plate. Please check your query or supply a registration key (e.g., KA-01-MC-4592).";
      }
    } else if (queryLower.includes("burglary") || queryLower.includes("robbery") || queryLower.includes("theft") || queryLower.includes("housebreaking")) {
      const matchedCases = MOCK_CASES.filter(c => c.crimeType.toLowerCase() === "burglary" || c.crimeType.toLowerCase() === "theft");
      matchedData.cases = matchedCases;
      const suspectIds = matchedCases.flatMap(c => c.suspects);
      matchedData.criminals = MOCK_CRIMINALS.filter(c => suspectIds.includes(c.id));
      responseText = `I found **${matchedCases.length} burglary/theft incidents** matching your query. Crime hotspot analysis shows active recurrence in **Jayanagar Sector**. The primary suspect flagged by AI pattern matching is **Yashas 'Silt' Kumar** based on CCTV footprints and specialized digital bypass methods.`;
    } else if (queryLower.includes("yashas") || queryLower.includes("silt") || queryLower.includes("crim-5821")) {
      const matchedCrim = MOCK_CRIMINALS.filter(c => c.name.toLowerCase().includes("yashas") || c.id === "CRIM-5821");
      matchedData.criminals = matchedCrim;
      if (matchedCrim.length > 0) {
        const cid = matchedCrim[0].id;
        matchedData.cases = MOCK_CASES.filter(c => c.suspects.includes(cid));
        matchedData.vehicles = MOCK_VEHICLES.filter(v => matchedCrim[0].vehicles.includes(v.regNumber));
        responseText = `Displaying profile for **Yashas 'Silt' Kumar** (${cid}). He is an active member of the **Lakeside Gang** with a risk score of **84%**. Currently linked to **${matchedData.cases.length} FIR(s)** (most recently: Jayanagar burglary). Key associates detected: **Prathap Gowda** and **Mohan Ramegowda**.`;
      }
    } else if (queryLower.includes("kannada") || queryLower.includes("ಯಾರು") || queryLower.includes("ಕಳವು") || queryLower.includes("ವಾಹನ")) {
      responseText = `**ಕನ್ನಡ ಹುಡುಕಾಟ ಸಕ್ರಿಯಗೊಳಿಸಲಾಗಿದೆ:** ಕಳವು ಪ್ರಕರಣಗಳು ಮತ್ತು ಆರೋಪಿಗಳ ವಿವರಗಳನ್ನು ಹಿಂಪಡೆಯಲಾಗುತ್ತಿದೆ.\n\nಜಯನಗರ ಕನ್ನಗಳವು ಪ್ರಕರಣದಲ್ಲಿ ಶಂಕಿತ ಆರೋಪಿ **ಯಶಸ್ ಕುಮಾರ್ (CRIM-5821)** ಎಂದು ಗುರುತಿಸಲಾಗಿದೆ. ಆತನ ಕಪ್ಪು ಕಾರು **KA-01-MC-4592** ಘಟನಾ ಸ್ಥಳದ ಸಮೀಪ ಪತ್ತೆಯಾಗಿದೆ.`;
    } else if (
      queryLower.includes("schema") || queryLower.includes("er-diagram") || queryLower.includes("er diagram") ||
      queryLower.includes("database") || queryLower.includes("table") || queryLower.includes("column") ||
      queryLower.includes("primary key") || queryLower.includes("foreign key") || queryLower.includes("relationship") ||
      queryLower.includes("casemaster") || queryLower.includes("complainant") || queryLower.includes("victim") ||
      queryLower.includes("accused") || queryLower.includes("arrestsurrender") || queryLower.includes("act") ||
      queryLower.includes("section") || queryLower.includes("chargesheet") || queryLower.includes("crimeno") ||
      queryLower.includes("caseno")
    ) {
      if (queryLower.includes("crimeno") || queryLower.includes("crime number") || queryLower.includes("caseno") || queryLower.includes("case number")) {
        responseText = `According to the **KSP Police FIR System ER Diagram**, case identifiers are structured as follows:
* **CrimeNo** (VARCHAR): \`1-digit Case Category Code + 4-digit District ID + 4-digit Police Station ID (Unit ID) + 4-digit Year + 5-digit Running Serial Number\`. E.g., \`104430006202600001\` (FIR), \`304430006202600001\` (UDR).
* **CaseNo** (VARCHAR): \`YYYY + 5-digit running serial number\` (maps to the last 9 digits of CrimeNo). E.g., \`202600001\`.`;
      } else if (queryLower.includes("casemaster")) {
        responseText = `The **CaseMaster** table is the core entity in the Police FIR system database:
* **Primary Key**: \`CaseMasterID\` (INT)
* **Key Columns**:
  * \`CrimeNo\` (VARCHAR) & \`CaseNo\` (VARCHAR)
  * \`CrimeRegisteredDate\` (DATE)
  * \`IncidentFromDate\` & \`IncidentToDate\` (DATETIME)
  * \`latitude\` & \`longitude\` (DECIMAL) for GPS coordinates
  * \`BriefFacts\` (NVARCHAR(Max))
* **Foreign Keys (FKs)**:
  * \`PolicePersonID\` (FK -> Employee), \`PoliceStationID\` (FK -> Unit)
  * \`CaseCategoryID\` (CaseCategory), \`GravityOffenceID\` (GravityOffence)
  * \`CrimeMajorHeadID\` (CrimeHead), \`CrimeMinorHeadID\` (CrimeSubHead)
  * \`CaseStatusID\` (CaseStatusMaster), \`CourtID\` (Court)`;
      } else if (queryLower.includes("complainant")) {
        responseText = `The **ComplainantDetails** table holds complainant information:
* **Primary Key**: \`ComplainantID\` (INT)
* **Relationships**: Linked to \`CaseMaster\` via \`CaseMasterID\` (One-to-Many).
* **Key Columns**:
  * \`ComplainantName\` (VARCHAR), \`AgeYear\` (INT), \`GenderID\` (INT)
  * \`OccupationID\` (FK -> OccupationMaster)
  * \`ReligionID\` (FK -> ReligionMaster)
  * \`CasteID\` (FK -> CasteMaster)`;
      } else if (queryLower.includes("victim")) {
        responseText = `The **Victim** table holds details about crime victims:
* **Primary Key**: \`VictimMasterID\` (INT)
* **Relationships**: Linked to \`CaseMaster\` via \`CaseMasterID\` (One-to-Many).
* **Key Columns**:
  * \`VictimName\` (VARCHAR), \`AgeYear\` (INT), \`GenderID\` (INT)
  * \`VictimPolice\` (VARCHAR: \`1\` if victim is police, else \`0\`)`;
      } else if (queryLower.includes("accused")) {
        responseText = `The **Accused** table records accused persons:
* **Primary Key**: \`AccusedMasterID\` (INT)
* **Relationships**: Linked to \`CaseMaster\` via \`CaseMasterID\` (One-to-Many).
* **Key Columns**:
  * \`AccusedName\` (VARCHAR), \`AgeYear\` (INT), \`GenderID\` (INT)
  * \`PersonID\` (VARCHAR: sorting indicator e.g., \`A1\`, \`A2\`, \`A3\`)`;
      } else if (queryLower.includes("arrest") || queryLower.includes("surrender")) {
        responseText = `The **ArrestSurrender** table tracks custody events:
* **Primary Key**: \`ArrestSurrenderID\` (INT)
* **Foreign Keys**:
  * \`CaseMasterID\` (FK -> CaseMaster)
  * \`AccusedMasterID\` (FK -> Accused)
  * \`PoliceStationID\` (FK -> Unit), \`IOID\` (FK -> Employee), \`CourtID\` (FK -> Court)
  * \`ArrestSurrenderStateId\` & \`ArrestSurrenderDistrictId\`
* **Key Columns**:
  * \`ArrestSurrenderTypeID\` (Lookup: arrest or voluntary surrender)
  * \`ArrestSurrenderDate\` (DATE)
  * \`IsAccused\` (BIT: primary accused flag) & \`IsComplainantAccused\` (BIT)`;
      } else if (queryLower.includes("chargesheet")) {
        responseText = `The **ChargesheetDetails** table stores details of formal charge-sheeting:
* **Primary Key**: \`CSID\` (INT)
* **Key Columns**:
  * \`CaseMasterID\` (FK -> CaseMaster)
  * \`csdate\` (DATETIME)
  * \`cstype\` (CHAR: \`A\` -> Chargesheet, \`B\` -> False Case, \`C\` -> Undetected)
  * \`PolicePersonID\` (FK -> Employee)`;
      } else if (queryLower.includes("act") || queryLower.includes("section")) {
        responseText = `The **Act** & **Section** tables map legal codes:
* **Act**: \`ActCode\` (PK e.g. IPC, NDPS), \`ActDescription\`, \`ShortName\`, \`Active\` (BIT).
* **Section**: \`ActCode\` (FK), \`SectionCode\` (e.g. 302, 307), \`SectionDescription\`, \`Active\` (BIT).
* **ActSectionAssociation**: Links \`CaseMasterID\` to specific \`ActID\` and \`SectionID\` with order values (\`ActOrderID\`, \`SectionOrderID\`).`;
      } else {
        responseText = `I have loaded the **Karnataka Police Department FIR DB Schema (ER Diagram)**:
* **Core Entity**: \`CaseMaster\` (PK: \`CaseMasterID\`)
* **One-to-Many Relationships**:
  * \`CaseMaster\` -> \`Victim\` (Multiple victims per FIR)
  * \`CaseMaster\` -> \`Accused\` (Multiple accused per FIR)
  * \`CaseMaster\` -> \`ArrestSurrender\` (Multiple custody/arrest events)
  * \`CaseMaster\` -> \`ComplainantDetails\` (Multiple complainants per FIR)
  * \`CaseMaster\` -> \`ActSectionAssociation\` (Multiple acts & sections invoked)
* **One-to-One Relationship**:
  * \`CaseMaster\` -> \`Inv_OccuranceTime\` (One occurrence time/location record per FIR)
* **Supporting Masters**: \`CrimeHead\` & \`CrimeSubHead\`, \`CaseStatusMaster\`, \`CasteMaster\`, \`ReligionMaster\`, \`OccupationMaster\`, \`Court\`, \`District\`, \`State\`, and \`Unit\` (Police Station).`;
      }
    } else {
      matchedData.cases = MOCK_CASES.slice(0, 2);
      responseText = `Welcome back, Officer. I've initiated a wide search on your query: "${query}". Based on KSP active records, we have 5 loaded FIRs and 5 active criminal targets. \n\nTry asking me specialized queries like:\n- *"Show all burglary cases connected with Yashas Kumar"* \n- *"Who is the registered owner of KA-01-MC-4592?"* \n- *"Find similar cases to a daylight gold theft at Kadri Park"*`;
    }

    return {
      query,
      responseText,
      matchedData,
      suggestedQueries: [
        "Explain Yashas Kumar's criminal network connections",
        "Show burglary clusters on Jayanagar map",
        "Generate weekly intelligence report for Mangaluru district"
      ]
    };
  });
}

export async function submitSimilarCases(description: string, officer: string, role: string) {
  return safeFetch(`${API_BASE}/similar-cases`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description, officer, role })
  }, () => {
    addMockAuditLog(officer, role, "Submitted text to Similar Case Finder", "AI Similar Case Scanner");
    const inputLower = description.toLowerCase();
    
    const results = MOCK_CASES.map(c => {
      let score = 0;
      const words = inputLower.split(/\W+/);
      words.forEach(w => {
        if (w.length > 3) {
          if (c.description.toLowerCase().includes(w)) score += 2;
          if (c.mo.toLowerCase().includes(w)) score += 3;
          if (c.crimeType.toLowerCase().includes(w)) score += 5;
        }
      });
      return { case: c, score };
    })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score);

    const topMatches = results.length > 0 ? results.slice(0, 3) : [
      { case: MOCK_CASES[0], score: 2 },
      { case: MOCK_CASES[1], score: 1 }
    ];

    const suspectsList: any[] = [];
    topMatches.forEach(match => {
      match.case.suspects.forEach(sId => {
        const suspectObj = MOCK_CRIMINALS.find(c => c.id === sId);
        if (suspectObj && !suspectsList.some(s => s.id === sId)) {
          suspectsList.push(suspectObj);
        }
      });
    });

    return {
      status: "success",
      scanTimeMs: 125,
      matches: topMatches.map(m => ({
        id: m.case.id,
        title: m.case.title,
        confidence: Math.min(Math.floor(m.score * 8 + 35), 98),
        crimeType: m.case.crimeType,
        mo: m.case.mo,
        io: m.case.io,
        station: m.case.station,
        description: m.case.description
      })),
      suspects: suspectsList.map(s => ({
        id: s.id,
        name: s.name,
        alias: s.alias,
        riskScore: s.riskScore,
        mo: s.mo,
        status: s.status
      }))
    };
  });
}

export async function submitPredict(params: { district: string; hour: number; weather: string; festival: string }, officer: string, role: string) {
  const { district, hour, weather, festival } = params;
  return safeFetch(`${API_BASE}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...params, officer, role })
  }, () => {
    addMockAuditLog(officer, role, `Executed Crime Risk Prediction for ${district}`, "Predictive Crime Engine");
    
    let theftProb = 15;
    let burglaryProb = 20;
    let cyberProb = 10;
    let drugProb = 8;
    const explanation: any[] = [];

    if (hour >= 22 || hour <= 4) {
      burglaryProb += 30;
      theftProb += 15;
      explanation.push({ factor: "Late Night hours (11 PM - 4 AM)", impact: 25, type: "positive" });
    } else {
      explanation.push({ factor: "Daylight hours", impact: -10, type: "negative" });
    }

    if (weather === "Rainy") {
      burglaryProb -= 12;
      theftProb -= 10;
      explanation.push({ factor: "Heavy Rainfall (reduced mobility)", impact: -12, type: "negative" });
    } else if (weather === "Clear") {
      burglaryProb += 5;
      explanation.push({ factor: "Optimal weather conditions", impact: 5, type: "positive" });
    }

    if (festival && festival !== "None") {
      theftProb += 25;
      burglaryProb += 15;
      explanation.push({ factor: `${festival} Festival (crowded markets, empty homes)`, impact: 22, type: "positive" });
    }

    if (district === "Bengaluru City") {
      cyberProb += 25;
      burglaryProb += 10;
      explanation.push({ factor: "High demographic density & tech hub index", impact: 15, type: "positive" });
    } else if (district === "Mangaluru") {
      drugProb += 15;
      explanation.push({ factor: "Port activity & interstate transit highway proximity", impact: 12, type: "positive" });
    }

    const totalBurglaryRisk = Math.min(burglaryProb, 95);
    const totalTheftRisk = Math.min(theftProb, 95);
    const totalCyberRisk = Math.min(cyberProb, 95);
    const totalDrugRisk = Math.min(drugProb, 95);
    const overallRisk = Math.max(totalBurglaryRisk, totalTheftRisk, totalCyberRisk, totalDrugRisk);
    
    let severity = "Low";
    if (overallRisk > 70) severity = "Critical";
    else if (overallRisk > 45) severity = "High";
    else if (overallRisk > 25) severity = "Medium";

    return {
      district,
      timeWindow: `${hour.toString().padStart(2, '0')}:00 - ${(hour + 2).toString().padStart(2, '0')}:00`,
      overallRisk,
      severity,
      confidence: 89,
      predictions: [
        { type: "Burglary", probability: totalBurglaryRisk },
        { type: "Theft / Vehicle Theft", probability: totalTheftRisk },
        { type: "Cyber Fraud", probability: totalCyberRisk },
        { type: "Drug Contraband Activity", probability: totalDrugRisk }
      ],
      explainability: explanation,
      recommendations: [
        overallRisk > 60 ? "Deploy extra 2 Namma 112 interceptors on sector boundaries." : "Maintain normal patrolling rhythm.",
        overallRisk > 50 ? "Issue automatic preventive SMS alerts to registered Jayanagar Residents Association." : "Standard community messaging.",
        "Verify presence of CCTV feeds near intersection camera points."
      ]
    };
  });
}

export async function submitReport(params: { reportType: string; district: string; timePeriod: string }, officer: string, role: string) {
  const { reportType, district, timePeriod } = params;
  return safeFetch(`${API_BASE}/report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...params, officer, role })
  }, () => {
    addMockAuditLog(officer, role, `Generated ${reportType} report for ${district}`, "AI Report Generator");
    let reportTitle = "";
    let content = "";

    if (reportType === "District Summary") {
      reportTitle = `KSP AI District Intelligence Report - ${district}`;
      const activeDistrictObj = MOCK_DISTRICT_STATS.find(d => d.name === district) || MOCK_DISTRICT_STATS[0];
      content = `## 1. Executive Intelligence Overview
This report summarizes predictive and historical crime data compiled by the **KSP Crime Intelligence OS** for **${district}** over the last ${timePeriod}.

- **State Crime Index Ranking:** Rank ${activeDistrictObj.crimeIndex}/100
- **Total Cases Lodged:** ${activeDistrictObj.casesCount} cases
- **Identified Risk Hotspots:** ${activeDistrictObj.hotspotsCount} sectors
- **System Action Alerts Handled:** 41 alerts

## 2. Active Threat Hotspots
The geospatial engine has highlighted the following zones with elevated recurrence:
${MOCK_HOTSPOTS.filter(h => h.district === district).map(h => `- **${h.label}** (${h.riskLevel} Risk): patrol recommendation: *${h.suggestedPatrol}*`).join('\n')}

## 3. Recommended Resource Allocation
AI Models suggest shifting **15% extra patrolling force** to late-night shifts between 11 PM and 5 AM. Priority checkpoints should focus on highway gateways and exit terminals.

---
*Report generated securely under Trusted Execution Environment standards. Access token verified for ${officer} (${role}).*`;
    } else {
      reportTitle = `Investigation Brief: Burglary Recurrence Study`;
      content = `## 1. Modus Operandi Matching
AI Analysis of recent housebreakings in Jayanagar reveals a matched sequence:
- **Core Vector:** Lockpicking digital keypad entry devices using voltage fluctuation injection.
- **Physical Clues:** Sneaker prints matching size 9.
- **Automotive Clue:** Black hatchback vehicle license plate **KA-01-MC-4592** captured within a 200m radius of three crime scenes.

## 2. Known Suspect Links
- **Yashas 'Silt' Kumar (CRIM-5821):** Active burglar on bail, matches size 9 shoes, owner of the black hatchback, matches Lakeside Gang pattern.
- **Prathap Gowda (CRIM-1204):** Known vehicle modification associate, currently absconding.

## 3. Next Steps Recommendation
1. Execute search warrant for vehicle KA-01-MC-4592.
2. Interrogate associate Mohan Ramegowda regarding recent SIM registration locations.

---
*Report generated securely under Trusted Execution Environment standards. Access token verified for ${officer} (${role}).*`;
    }

    return {
      title: reportTitle,
      content,
      timestamp: new Date().toISOString(),
      author: officer,
      classification: "RESTRICTED // POLICE INTERNAL ONLY"
    };
  });
}

const MOCK_PATROLS = [
  { id: "PAT-01", officer: "Constable Kumar S.", assignment: "Jayanagar Sector Burglary Watch", gps: "12.9250, 77.5938", time: "11:00 PM - 04:00 AM", shift: "Night Shift", status: "Active" },
  { id: "PAT-02", officer: "Sub-Inspector Sandeep Kumar", assignment: "HSR Sector 2 Keyless Theft Patrol", gps: "12.9100, 77.6400", time: "12:00 AM - 05:00 AM", shift: "Night Shift", status: "Active" },
  { id: "PAT-03", officer: "Inspector Rajesh D'Souza", assignment: "Kadri Park Snatching Beat", gps: "12.8730, 74.8560", time: "05:30 AM - 08:30 AM", shift: "Morning Shift", status: "Active" },
  { id: "PAT-04", officer: "Constable Gowda M.", assignment: "SIM Swap Phishing Radar", gps: "12.2900, 76.6500", time: "10:00 AM - 06:00 PM", shift: "General Shift", status: "Active" }
];

const MOCK_INTELLIGENCE = [
  { id: "TRD-01", pattern: "Late Night Keyless Entry Heists", reason: "Spike in RF relay cloning device usage detected near Nice Road boundaries.", confidence: 89, relatedFirs: ["FIR-2026-109"], predictedImpact: "High probability of SUV thefts in HSR Layout Sector 2 during 12 AM - 5 AM.", district: "Bengaluru City" },
  { id: "TRD-02", pattern: "Optical CCTV Refraction Burglaries", reason: "Suspects bypassing CCTV feeds using optical laser pointers in gated communities.", confidence: 84, relatedFirs: ["FIR-2026-102"], predictedImpact: "Medium risk in Jayanagar Sector 4 between 11 PM and 3 AM.", district: "Bengaluru City" },
  { id: "TRD-03", pattern: "SIM Swap Retail Spoofing", reason: "Social engineering coupled with retail SIM swap authorizations.", confidence: 71, relatedFirs: ["FIR-2026-121"], predictedImpact: "Medium risk of phishing transfers in Mysuru district.", district: "Mysuru City" }
];

export async function fetchPatrols() {
  return safeFetch(`${API_BASE}/patrols`, undefined, () => MOCK_PATROLS);
}

export async function fetchIntelligence() {
  return safeFetch(`${API_BASE}/intelligence`, undefined, () => MOCK_INTELLIGENCE);
}

export async function postNewCase(caseObj: any) {
  return safeFetch<any>(`${API_BASE}/case`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(caseObj)
  }, () => {
    MOCK_CASES.push(caseObj);
    return { status: "success", case: caseObj };
  });
}

export async function submitOcrScan(filesList: any[]) {
  const filesPayload = filesList.map(f => ({ name: f.name, size: f.size, type: f.type }));
  return safeFetch<any[]>(`${API_BASE}/ocr`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ files: filesPayload })
  }, () => {
    return filesPayload.map(file => {
      let mockExtraction = {
        id: "FIR-2026-" + Math.floor(200 + Math.random() * 700),
        title: "Incident Title",
        date: new Date().toISOString(),
        district: "Bengaluru City",
        station: "Jayanagar PS",
        crimeType: "Burglary",
        status: "Open",
        io: "Inspector H. S. Rao",
        description: "Simulated fallback extraction details.",
        mo: "Ignition bypass",
        suspects: [],
        connectedVehicles: [],
        evidence: [],
        sections: "Sec 303 BNS",
        victim: "Complainant Name",
        accused: "Unknown",
        witness: "None",
        address: "Bengaluru",
        phone: "+91 99999 XXXXX",
        weapon: "None",
        location: "Street",
        officer: "H. S. Rao",
        latitude: 12.9716,
        longitude: 77.5946
      };
      return {
        fileName: file.name,
        detectedLanguage: "English",
        confidence: 88,
        ocrTimestamp: new Date().toISOString(),
        structuredData: mockExtraction,
        confidences: { id: 95, title: 90, accused: 45, witness: 60, weapon: 70 },
        originalText: "Simulated OCR raw text fallback."
      };
    });
  });
}

// ============================================================================
// GRAPH CRUD & RELATION BUILDER FALLBACK DATABASE & ENDPOINTS
// ============================================================================

let MOCK_GRAPH_NODES: any[] = [
  { id: "CRIM-5821", label: "Yashas Kumar", group: "criminal", title: "Yashas Kumar (Risk: 84%)", risk: 84, age: 34, status: "Active / On Bail", mo: "Late night housebreaking in gated communities, bypasses CCTV using optical laser refraction" },
  { id: "CRIM-1204", label: "Prathap Gowda", group: "criminal", title: "Prathap Gowda (Risk: 78%)", risk: 78, age: 29, status: "Absconding", mo: "Procures stolen key-fobs, vehicle cloning, dismantles trackers" },
  { id: "CRIM-9921", label: "Mohan Ramegowda", group: "criminal", title: "Mohan Ramegowda (Risk: 71%)", risk: 71, age: 41, status: "Under Watch", mo: "SIM swapping, spoofing OTPs, financial phishing fraud" },
  { id: "CRIM-3304", label: "Vikram Shetty", group: "criminal", title: "Vikram Shetty (Risk: 92%)", risk: 92, age: 38, status: "In Custody", mo: "Gold chain snatching, highway heist, illegal weapons distribution in coastal belt" },
  { id: "CRIM-7782", label: "Naveen D'Souza", group: "criminal", title: "Naveen D'Souza (Risk: 86%)", risk: 86, age: 31, status: "Absconding", mo: "Contraband smuggling, extortion, safe house rental logistics" },
  { id: "GANG-LAKESIDE", label: "Lakeside Gang", group: "gang", title: "Lakeside Gang Syndicate" },
  { id: "GANG-COASTAL", label: "Coastal Cartel", group: "gang", title: "Coastal Cartel Syndicate" },
  { id: "PHONE-YASHAS", label: "+91 98450 XXXXX", group: "phone", title: "Yashas Kumar's Registered Phone" },
  { id: "PHONE-MOHAN", label: "+91 99002 XXXXX", group: "phone", title: "Mohan Ramegowda's Registered Phone" },
  { id: "KA-01-MC-4592", label: "KA-01-MC-4592", group: "vehicle", title: "Black Hatchback owned by Yashas Kumar" },
  { id: "KA-19-EE-0091", label: "KA-19-EE-0091", group: "vehicle", title: "Blue Pulsar owned by Vikram Shetty" },
  { id: "FIR-2026-102", label: "FIR-102 (Burglary)", group: "fir", title: "Gated Community Burglary in Jayanagar" },
  { id: "FIR-2026-140", label: "FIR-140 (Snatching)", group: "fir", title: "Daylight Chain Snatching near Kadri Park" }
];

let MOCK_GRAPH_EDGES: any[] = [
  { id: "edge-1", from: "CRIM-5821", to: "GANG-LAKESIDE", label: "MEMBER_OF" },
  { id: "edge-2", from: "CRIM-1204", to: "GANG-LAKESIDE", label: "MEMBER_OF" },
  { id: "edge-3", from: "CRIM-9921", to: "GANG-LAKESIDE", label: "ASSOCIATE" },
  { id: "edge-4", from: "CRIM-3304", to: "GANG-COASTAL", label: "LEADER_OF" },
  { id: "edge-5", from: "CRIM-7782", to: "GANG-COASTAL", label: "MEMBER_OF" },
  { id: "edge-6", from: "CRIM-5821", to: "PHONE-YASHAS", label: "OWNS_PHONE" },
  { id: "edge-7", from: "CRIM-9921", to: "PHONE-MOHAN", label: "OWNS_PHONE" },
  { id: "edge-8", from: "CRIM-5821", to: "KA-01-MC-4592", label: "DRIVES" },
  { id: "edge-9", from: "CRIM-1204", to: "KA-01-MC-4592", label: "COMMONLY_USES" },
  { id: "edge-10", from: "CRIM-3304", to: "KA-19-EE-0091", label: "DRIVES" },
  { id: "edge-11", from: "FIR-2026-102", to: "CRIM-5821", label: "SUSPECT_IN" },
  { id: "edge-12", from: "FIR-2026-102", to: "KA-01-MC-4592", label: "VEHICLE_USED" },
  { id: "edge-13", from: "FIR-2026-140", to: "CRIM-3304", label: "SUSPECT_IN" },
  { id: "edge-14", from: "FIR-2026-140", to: "KA-19-EE-0091", label: "VEHICLE_USED" },
  { id: "edge-15", from: "CRIM-5821", to: "CRIM-1204", label: "ACCOMPLICE", dashes: true }
];

let MOCK_AI_SUGGESTIONS: any[] = [
  {
    id: "sug-1",
    from: "CRIM-1204",
    to: "CRIM-9921",
    label: "ACCOMPLICE",
    type: "shared phone",
    confidence: 89,
    reason: "Call Details Record (CDR) shows 4 calls between phone number vectors on the night of keyless SUV cloning heist.",
    evidence: "Tower ID cell overlaps near HSR Sector 2 and Mysuru road bypass."
  },
  {
    id: "sug-2",
    from: "CRIM-5821",
    to: "CRIM-7782",
    label: "ACCOMPLICE",
    type: "possible gang",
    confidence: 76,
    reason: "Both suspects belong to Lakeside Gang associates network. Naveen rented logistics base in Lakeside area.",
    evidence: "Safehouse rental payment logs show shared bank clearing codes."
  },
  {
    id: "sug-3",
    from: "CRIM-3304",
    to: "KA-01-MC-4592",
    label: "COMMONLY_USES",
    type: "common vehicle",
    confidence: 82,
    reason: "Blue Pulsar getaway bike owner spotted driving the black hatchback KA-01-MC-4592 at Mangaluru checkpoint.",
    evidence: "Fastag RFID transaction log matches on NH-66 Toll Plaza within 2 hours of chain snatching."
  },
  {
    id: "sug-4",
    from: "CRIM-1204",
    to: "FIR-2026-102",
    label: "SUSPECT_IN",
    type: "common crime pattern",
    confidence: 91,
    reason: "Jayanagar burglary MO closely matches suspect's previous digital bypass MO using voltage fluctuation injection.",
    evidence: "Voltage scanner printouts match device signatures seized from associate mechanic warehouse."
  }
];

export async function fetchGraphData() {
  return safeFetch<{ nodes: any[]; edges: any[] }>(`${API_BASE}/graph`, undefined, () => {
    return { nodes: MOCK_GRAPH_NODES, edges: MOCK_GRAPH_EDGES };
  });
}

export async function addGraphNode(node: any) {
  return safeFetch<any>(`${API_BASE}/graph/node`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(node)
  }, () => {
    const newNode = {
      ...node,
      title: `${node.label} (Risk: ${node.risk || 50}%)`
    };
    MOCK_GRAPH_NODES.push(newNode);
    return { status: "success", node: newNode };
  });
}

export async function editGraphNode(id: string, node: any) {
  return safeFetch<any>(`${API_BASE}/graph/node/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(node)
  }, () => {
    const index = MOCK_GRAPH_NODES.findIndex(n => n.id === id);
    if (index !== -1) {
      MOCK_GRAPH_NODES[index] = {
        ...MOCK_GRAPH_NODES[index],
        ...node,
        title: `${node.label} (Risk: ${node.risk || MOCK_GRAPH_NODES[index].risk || 50}%)`
      };
      return { status: "success", node: MOCK_GRAPH_NODES[index] };
    }
    throw new Error("Node not found");
  });
}

export async function deleteGraphNode(id: string) {
  return safeFetch<any>(`${API_BASE}/graph/node/${id}`, {
    method: 'DELETE'
  }, () => {
    MOCK_GRAPH_NODES = MOCK_GRAPH_NODES.filter(n => n.id !== id);
    MOCK_GRAPH_EDGES = MOCK_GRAPH_EDGES.filter(e => e.from !== id && e.to !== id);
    return { status: "success", id };
  });
}

export async function addGraphRelationship(edge: any) {
  return safeFetch<any>(`${API_BASE}/graph/relationship`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(edge)
  }, () => {
    const newEdge = {
      id: `edge-${Date.now()}`,
      ...edge
    };
    MOCK_GRAPH_EDGES.push(newEdge);
    return { status: "success", edge: newEdge };
  });
}

export async function deleteGraphRelationship(edgeId: string) {
  return safeFetch<any>(`${API_BASE}/graph/relationship/delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: edgeId })
  }, () => {
    MOCK_GRAPH_EDGES = MOCK_GRAPH_EDGES.filter(e => e.id !== edgeId);
    return { status: "success", id: edgeId };
  });
}

export async function fetchAISuggestions() {
  return safeFetch<any[]>(`${API_BASE}/graph/suggestions`, undefined, () => MOCK_AI_SUGGESTIONS);
}

export async function acceptAISuggestion(suggestionId: string) {
  return safeFetch<any>(`${API_BASE}/graph/suggestions/accept`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: suggestionId })
  }, () => {
    const sugg = MOCK_AI_SUGGESTIONS.find(s => s.id === suggestionId);
    if (sugg) {
      const newEdge = {
        id: `edge-${Date.now()}`,
        from: sugg.from,
        to: sugg.to,
        label: sugg.label
      };
      MOCK_GRAPH_EDGES.push(newEdge);
      MOCK_AI_SUGGESTIONS = MOCK_AI_SUGGESTIONS.filter(s => s.id !== suggestionId);
      return { status: "success", edge: newEdge };
    }
    throw new Error("Suggestion not found");
  });
}

export async function rejectAISuggestion(suggestionId: string) {
  return safeFetch<any>(`${API_BASE}/graph/suggestions/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: suggestionId })
  }, () => {
    MOCK_AI_SUGGESTIONS = MOCK_AI_SUGGESTIONS.filter(s => s.id !== suggestionId);
    return { status: "success", id: suggestionId };
  });
}


// ============================================================================
// AI DECISION INTELLIGENCE ENGINE MOCK DATA & ENDPOINTS
// ============================================================================

// State store to keep accepted/rejected/completed recommendations per FIR
let MOCK_RECOMMENDATION_STATES: Record<string, any[]> = {};
let MOCK_DECISION_FEEDBACKS: any[] = [];

// Initialize recommendations logic for case reports
function generateRecommendationsForFIR(firId: string) {
  if (MOCK_RECOMMENDATION_STATES[firId]) {
    return MOCK_RECOMMENDATION_STATES[firId];
  }

  let list: any[] = [];
  if (firId === "FIR-2026-102") {
    list = [
      {
        id: "rec-102-1",
        type: "patrol",
        recommendation: "Increase night patrols in Jayanagar Sector 4.",
        reason: "12 burglaries occurred in this specific sector in past 2 months during night hours.",
        evidence: "High concentration of active Lakeside Gang members in Jayanagar outskirts.",
        confidence: 92,
        historicalComparison: "25% higher burglary rate than Jul 2025 Jayanagar metrics.",
        explainability: "+30% Late Night hours factor, +25% Jayanagar density index, +15% Lakeside Gang threat.",
        status: "pending",
        assignedOfficer: ""
      },
      {
        id: "rec-102-2",
        type: "officer",
        recommendation: "Assign Inspector H. S. Rao as lead investigator.",
        reason: "Inspector H. S. Rao solved 3 similar laser-bypassed burglary heists in J.P. Nagar.",
        evidence: "MO signatures show 98% footprint matching with Lakeside Gang lockpick voltage signatures.",
        confidence: 88,
        historicalComparison: "Lead solved 85% of cases assigned matching Lakeside MO.",
        explainability: "+45% specialized MO expertise index, +25% active sector assignments.",
        status: "pending",
        assignedOfficer: ""
      },
      {
        id: "rec-102-3",
        type: "evidence",
        recommendation: "Deploy forensic team to scan backdoor terminal lock circuit logs.",
        reason: "Digital keypad shows sign of keyless voltage injection bypass.",
        evidence: "Physical trace values show 5V micro-surge spike on security board.",
        confidence: 78,
        historicalComparison: "Circuit logging led to arrest in 4 past digital burglaries.",
        explainability: "+50% voltage bypass footprint correlation, +28% bypass residual levels.",
        status: "pending",
        assignedOfficer: ""
      },
      {
        id: "rec-102-4",
        type: "action",
        recommendation: "File search warrant for suspect vehicle KA-01-MC-4592.",
        reason: "Vehicle was captured by CCTV within 200m radius of burglary scene within 15 minutes of heist.",
        evidence: "Automated Number Plate Recognition (ANPR) feed matched registered owner Yashas Kumar.",
        confidence: 94,
        historicalComparison: "Search warrants on ANPR matches yield 90% evidence recovery rates.",
        explainability: "+60% spatial overlap timeline, +34% suspect registration ownership.",
        status: "pending",
        assignedOfficer: ""
      }
    ];
  } else if (firId === "FIR-2026-109") {
    list = [
      {
        id: "rec-109-1",
        type: "patrol",
        recommendation: "Increase CCTV monitoring and highway interceptors on Nice Road exit gateways.",
        reason: "Keyless relay cloning heists depend on fast getaway routes to bypass tracking signals.",
        evidence: "GPS tracker went dead near Nice Road exit corridor.",
        confidence: 84,
        historicalComparison: "Highway interception recovered 4 stolen SUVs in past quarters.",
        explainability: "+40% exit route proximity index, +30% GPS jammer vector.",
        status: "pending",
        assignedOfficer: ""
      },
      {
        id: "rec-109-2",
        type: "officer",
        recommendation: "Assign Sub-Inspector Sandeep Kumar as field logistics lead.",
        reason: "SI Sandeep leads Nice Road checkpoint response team.",
        evidence: "CCTV shows he was active inspector during past HSR Sector 2 patrols.",
        confidence: 76,
        historicalComparison: "SI Sandeep successfully intercepted 3 vehicle heists.",
        explainability: "+50% local geography knowledge, +26% checkpost control status.",
        status: "pending",
        assignedOfficer: ""
      },
      {
        id: "rec-109-3",
        type: "evidence",
        recommendation: "Audit radio-frequency scanner logs near driveway coordinate.",
        reason: "Cloning key fob requires radio signals relay transmitter.",
        evidence: "Resident reported suspicious vehicle idling near gate with dashboard antenna.",
        confidence: 89,
        historicalComparison: "RF log auditing discovered relay rigs in 5 separate cases.",
        explainability: "+55% proximity signal capture logs, +34% RF telemetry values.",
        status: "pending",
        assignedOfficer: ""
      }
    ];
  } else {
    // Default recommendations for other FIRs
    list = [
      {
        id: `rec-${firId}-1`,
        type: "escalation",
        recommendation: "Escalate to Cyber Crime cell & trace ISP logs.",
        reason: "Pattern matches multi-jurisdictional digital spoofing.",
        evidence: "SIM swaps activated concurrently from Mysuru retail nodes.",
        confidence: 81,
        historicalComparison: "Escalated cyber cases solved 40% faster.",
        explainability: "+50% cyber tracking vector, +31% digital logs verification.",
        status: "pending",
        assignedOfficer: ""
      },
      {
        id: `rec-${firId}-2`,
        type: "patrol",
        recommendation: "Deploy field patrols near active carrier retail store areas.",
        reason: "SIM swappers rely on retail store complicity or coercion to authorize SIM replacements.",
        evidence: "Suspect SIM register timestamps align with retail store logging database.",
        confidence: 72,
        historicalComparison: "Retail audits reduced fake SIM activations by 60% in Mysuru.",
        explainability: "+42% retail node overlap, +30% telecom vector.",
        status: "pending",
        assignedOfficer: ""
      }
    ];
  }

  MOCK_RECOMMENDATION_STATES[firId] = list;
  return list;
}

export async function fetchDecisionIntelligence(firId: string) {
  return safeFetch<any>(`${API_BASE}/decision-intelligence/${firId}`, { method: 'GET' }, () => {
    // Generate risk metrics statefully
    let riskScore = 75;
    let severity = "High";
    let repeatProb = 65;
    let gangProb = 50;
    let patternSimilarity = 70;
    let victimRisk = 12;
    let expectedTrend = "Stabilizing";
    let hotspotImpact = "Low area threat expansion";
    let nearbyCrimesCount = 3;
    let relatedFirs: string[] = [];
    let likelySuspects: string[] = [];

    if (firId === "FIR-2026-102") {
      riskScore = 92;
      severity = "Critical";
      repeatProb = 84;
      gangProb = 78;
      patternSimilarity = 90;
      victimRisk = 15;
      expectedTrend = "Spiking (High risk of residential burglary next week due to festival)";
      hotspotImpact = "+12% increase in regional burglary index rating";
      nearbyCrimesCount = 12;
      relatedFirs = ["FIR-2026-921", "FIR-2026-109"];
      likelySuspects = ["Yashas 'Silt' Kumar (CRIM-5821)", "Prathap Gowda (CRIM-1204)"];
    } else if (firId === "FIR-2026-109") {
      riskScore = 78;
      severity = "High";
      repeatProb = 70;
      gangProb = 65;
      patternSimilarity = 85;
      victimRisk = 8;
      expectedTrend = "Escalating (Active SUV theft ring in sector)";
      hotspotImpact = "+8% increase in HSR Sector index";
      nearbyCrimesCount = 5;
      relatedFirs = ["FIR-2026-102"];
      likelySuspects = ["Prathap Gowda (CRIM-1204)"];
    } else if (firId === "FIR-2026-121") {
      riskScore = 71;
      severity = "High";
      repeatProb = 60;
      gangProb = 80;
      patternSimilarity = 70;
      victimRisk = 40;
      expectedTrend = "Stable (Localized phishing transfers)";
      hotspotImpact = "+4% change in Mysuru risk index";
      nearbyCrimesCount = 3;
      relatedFirs = ["FIR-2026-121"];
      likelySuspects = ["Mohan 'SIM' Ramegowda (CRIM-9921)"];
    } else if (firId === "FIR-2026-140") {
      riskScore = 62;
      severity = "Medium";
      repeatProb = 90;
      gangProb = 20;
      patternSimilarity = 88;
      victimRisk = 70;
      expectedTrend = "Declining (Arrest made)";
      hotspotImpact = "-5% reduction in Kadri Park incident rate";
      nearbyCrimesCount = 4;
      relatedFirs = ["FIR-2026-145"];
      likelySuspects = ["Vikram 'Ramp' Shetty (CRIM-3304)"];
    } else if (firId === "FIR-2026-145") {
      riskScore = 86;
      severity = "High";
      repeatProb = 75;
      gangProb = 92;
      patternSimilarity = 80;
      victimRisk = 5;
      expectedTrend = "Stable (Interstate checkpoint logs under watch)";
      hotspotImpact = "+9% threat to NH-66 entry gateways";
      nearbyCrimesCount = 2;
      relatedFirs = ["FIR-2026-140"];
      likelySuspects = ["Naveen D'Souza (CRIM-7782)", "Vikram Shetty (CRIM-3304)"];
    }

    const recommendations = generateRecommendationsForFIR(firId);

    // Calculate outcomes tracking checklist
    const totalCount = recommendations.length;
    const acceptedCount = recommendations.filter(r => r.status === 'accepted' || r.status === 'completed').length;
    const completedCount = recommendations.filter(r => r.status === 'completed').length;
    const implementationPercentage = totalCount > 0 ? Math.round((acceptedCount / totalCount) * 100) : 0;

    return {
      firId,
      riskScore,
      severity,
      probabilities: {
        repeatOffender: repeatProb,
        gangConnection: gangProb,
        patternSimilarity,
        victimRisk
      },
      expectations: {
        expectedTrend,
        hotspotImpact,
        nearbyCrimesCount,
        likelySuspects,
        relatedFirs
      },
      recommendations,
      implementation: {
        implementationPercentage,
        completedCount,
        totalCount,
        checklist: recommendations.map(r => ({
          recId: r.id,
          taskName: r.recommendation,
          status: r.status === 'completed' ? 'completed' : r.status === 'accepted' ? 'active' : 'pending',
          assignedOfficer: r.assignedOfficer || "Not Assigned"
        }))
      }
    };
  });
}

export async function updateRecommendationStatus(
  firId: string,
  recId: string,
  action: 'accept' | 'reject' | 'complete' | 'assign',
  data?: any
) {
  return safeFetch<any>(`${API_BASE}/decision-intelligence/recommendation/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ firId, recId, action, data })
  }, () => {
    const list = generateRecommendationsForFIR(firId);
    const rec = list.find(r => r.id === recId);
    if (rec) {
      if (action === 'accept') {
        rec.status = 'accepted';
      } else if (action === 'reject') {
        rec.status = 'rejected';
      } else if (action === 'complete') {
        rec.status = 'completed';
      } else if (action === 'assign') {
        rec.assignedOfficer = data?.officer || "Assigned Officer";
        if (rec.status === 'pending') {
          rec.status = 'accepted'; // Auto accept when officer assigned
        }
      }
      return { status: "success", recommendation: rec };
    }
    throw new Error("Recommendation not found");
  });
}

export async function submitFeedback(firId: string, rating: number, comment: string) {
  return safeFetch<any>(`${API_BASE}/decision-intelligence/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ firId, rating, comment })
  }, () => {
    const record = {
      id: `feed-${Date.now()}`,
      firId,
      rating,
      comment,
      timestamp: new Date().toISOString()
    };
    MOCK_DECISION_FEEDBACKS.unshift(record);
    return { status: "success", feedback: record };
  });
}

export async function fetchOutcomeAnalysis() {
  return safeFetch<any>(`${API_BASE}/decision-intelligence/outcome-analysis`, { method: 'GET' }, () => {
    // Generate outcomes metrics based on feedback rates
    const totalFeedbackCount = MOCK_DECISION_FEEDBACKS.length || 12;
    const avgRating = MOCK_DECISION_FEEDBACKS.length > 0 
      ? Math.round((MOCK_DECISION_FEEDBACKS.reduce((sum, f) => sum + f.rating, 0) / MOCK_DECISION_FEEDBACKS.length) * 10) / 10
      : 4.4;

    return {
      totalDecisions: 28,
      acceptedCount: 22,
      rejectedCount: 4,
      completedCount: 15,
      avgRating,
      totalFeedbackCount,
      calibrationProgress: [
        { epoch: "Week 1", accuracy: 82, rating: 4.1 },
        { epoch: "Week 2", accuracy: 85, rating: 4.2 },
        { epoch: "Week 3", accuracy: 88, rating: 4.3 },
        { epoch: "Week 4", accuracy: 91, rating: avgRating }
      ],
      recentFeedbackLogs: MOCK_DECISION_FEEDBACKS.slice(0, 5)
    };
  });
}

let MOCK_CRIME_TYPES: string[] = ["Burglary", "Theft", "Cyber Crime", "Chain Snatching", "Organized Crime"];

export async function fetchCrimeTypes() {
  return safeFetch<string[]>(`${API_BASE}/crime-types`, undefined, () => MOCK_CRIME_TYPES);
}

export async function addCrimeType(type: string) {
  return safeFetch<string[]>(`${API_BASE}/crime-types`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type })
  }, () => {
    const cleanType = type.trim();
    if (cleanType && !MOCK_CRIME_TYPES.some(t => t.toLowerCase() === cleanType.toLowerCase())) {
      MOCK_CRIME_TYPES.push(cleanType);
    }
    return MOCK_CRIME_TYPES;
  });
}

// ─── KSP SCHEMA CRUD CLIENT OPERATIONS ────────────────────────────────────────

export interface CrudPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CrudResponse<T> {
  data: T[];
  pagination: CrudPagination;
}

/**
 * Fetch KSP Database tables structure/schemas metadata
 */
export async function fetchCrudMetadata(): Promise<any> {
  return safeFetch<any>(`${API_BASE}/crud-metadata`, { method: 'GET' }, () => {
    // Return standard client-side fallback
    return {};
  });
}

/**
 * Fetch records from a KSP table with support for pagination, search, sorting
 */
export async function fetchCrudList<T>(
  tableName: string, 
  params: { page?: number; limit?: number; search?: string; sortField?: string; sortOrder?: 'asc' | 'desc' } = {}
): Promise<CrudResponse<T>> {
  const query = new URLSearchParams();
  if (params.page) query.append('page', String(params.page));
  if (params.limit) query.append('limit', String(params.limit));
  if (params.search) query.append('search', params.search);
  if (params.sortField) query.append('sortField', params.sortField);
  if (params.sortOrder) query.append('sortOrder', params.sortOrder);

  return safeFetch<CrudResponse<T>>(`${API_BASE}/crud/${tableName}?${query.toString()}`, { method: 'GET' }, () => {
    // Local client-side fallback mock implementation
    return {
      data: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }
    };
  });
}

/**
 * Fetch a single record details from a table
 */
export async function fetchCrudRecord<T>(tableName: string, id: string | number): Promise<T> {
  return safeFetch<T>(`${API_BASE}/crud/${tableName}/${id}`, { method: 'GET' });
}

/**
 * Insert a new record into a KSP table
 */
export async function createCrudRecord<T>(tableName: string, data: any): Promise<T> {
  return safeFetch<T>(`${API_BASE}/crud/${tableName}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}

/**
 * Update an existing record in a KSP table
 */
export async function updateCrudRecord<T>(tableName: string, id: string | number, data: any): Promise<T> {
  return safeFetch<T>(`${API_BASE}/crud/${tableName}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}

/**
 * Delete a record (soft delete) in a KSP table
 */
export async function deleteCrudRecord(tableName: string, id: string | number): Promise<{ status: string; message: string }> {
  return safeFetch<any>(`${API_BASE}/crud/${tableName}/${id}`, {
    method: 'DELETE'
  });
}



