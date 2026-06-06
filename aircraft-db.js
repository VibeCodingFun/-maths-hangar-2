/* =========================================
   HIGH-PERFORMANCE AIRCRAFT ENGINE (1,000 Planes)
   Instant Load - Integrated Photographic Assets
   ========================================= */

const generateAircraftDatabase = () => {
    const allPossiblePlanes = [];

    // Stable, high-res curated photography assets matching classifications
const categoryPhotos = {
    commercial: "commercial.jpg",
    military: "military.jpg",
    prop: "prop.jpg",
    business: "business.jpg"
};

    // 20 Authentic Brands & Performance Foundations
    const brandsMatrix = [
        // 1. COMMERCIAL JETS
        { brand: "Boeing", models: ["727", "737", "747", "757", "767", "777", "787"], type: "commercial", baseSpeed: 560 },
        { brand: "Airbus", models: ["A300", "A310", "A320", "A330", "A340", "A350", "A380"], type: "commercial", baseSpeed: 550 },
        { brand: "McDonnell Douglas", models: ["DC-8", "DC-9", "DC-10", "MD-11", "MD-80", "MD-90"], type: "commercial", baseSpeed: 545 },
        { brand: "Tupolev", models: ["Tu-134", "Tu-154", "Tu-204", "Tu-214", "Tu-334"], type: "commercial", baseSpeed: 530 },
        { brand: "Convair", models: ["880", "990 Coronado"], type: "commercial", baseSpeed: 590 },

        // 2. MILITARY JETS
        { brand: "Lockheed Martin", models: ["F-16 Falcon", "F-22 Raptor", "F-35 Lightning", "U-2", "SR-71 Blackbird"], type: "military", baseSpeed: 1100 },
        { brand: "Northrop Grumman", models: ["B-2 Spirit", "F-14 Tomcat", "A-6 Intruder", "EA-6B Prowler"], type: "military", baseSpeed: 650 },
        { brand: "Mikoyan MiG", models: ["MiG-21", "MiG-29 Fulcrum", "MiG-31", "MiG-35"], type: "military", baseSpeed: 1200 },
        { brand: "Sukhoi", models: ["Su-27 Flanker", "Su-30", "Su-34", "Su-35", "Su-57 Felon"], type: "military", baseSpeed: 1150 },
        { brand: "Dassault", models: ["Mirage III", "Mirage 2000", "Rafale"], type: "military", baseSpeed: 1050 },
        { brand: "British Aerospace", models: ["Hawk", "Harrier Jump Jet", "Tornado GR4"], type: "military", baseSpeed: 620 },
        { brand: "Saab", models: ["35 Draken", "37 Viggen", "39 Gripen"], type: "military", baseSpeed: 950 },

        // 3. GENERAL AVIATION (PROPS)
        { brand: "Cessna", models: ["152", "172 Skyhawk", "182 Skylane", "206 Stationair", "210 Centurion"], type: "prop", baseSpeed: 150 },
        { brand: "Piper", models: ["PA-28 Cherokee", "PA-32 Saratoga", "PA-34 Seneca", "PA-44 Seminole"], type: "prop", baseSpeed: 170 },
        { brand: "Beechcraft", models: ["Bonanza", "Baron", "King Air 90", "King Air 200", "Duke"], type: "prop", baseSpeed: 240 },
        { brand: "De Havilland", models: ["Tiger Moth", "DHC-2 Beaver", "DHC-6 Twin Otter", "DHC-8 Dash 8"], type: "prop", baseSpeed: 210 },

        // 4. BUSINESS & HEAVY CARGO
        { brand: "Gulfstream", models: ["GIV", "GV", "G550", "G650", "G700", "G800"], type: "business", baseSpeed: 585 },
        { brand: "Bombardier", models: ["Learjet 45", "Learjet 60", "Challenger 350", "Global 7500"], type: "business", baseSpeed: 540 },
        { brand: "Embraer", models: ["Phenom 300", "Legacy 600", "Praetor 600", "ERJ-145", "E190"], type: "business", baseSpeed: 510 },
        { brand: "Antonov", models: ["An-24", "An-74", "An-124 Ruslan", "An-225 Mriya"], type: "business", baseSpeed: 490 }
    ];

    const suffixes = {
        commercial: ["-100", "-200", "-300", "ER", "LR", " Neo", " Max", " Freighter"],
        military: ["A", "B", "C", "D", " Mk II", " Block 30", " Block 50", " Super"],
        prop: [" Series II", " Custom", " Sport", " Special", " Limited", " Cruiser", " Trainer"],
        business: ["XP", "ER", " Extended", " Elite", " Precision", " Signature", " Edition"]
    };

    const configs = {
        commercial: ["(CFM56 Engines)", "(GE90 Engines)", "(Pratt & Whitney)", "(Rolls-Royce Specs)"],
        military: ["(Camouflage Livery)", "(Low-Observable Gray)", "(Air Force Variant)", "(Naval Variant)"],
        prop: ["(Glass Cockpit Build)", "(Classic Taildragger)", "(Turbo Modification)", "(Avionics Upgrade)"],
        business: ["(VIP Configuration)", "Cargo Convert", "(Garmin Suite Installed)", "(Corporate Fleet Crop)"]
    };

    // Compile all possible valid permutations cleanly
    brandsMatrix.forEach(item => {
        const typeSuffixes = suffixes[item.type];
        const typeConfigs = configs[item.type];

        item.models.forEach(model => {
            typeSuffixes.forEach(suffix => {
                typeConfigs.forEach(config => {
                    
                    let realSpeed = item.baseSpeed + (Math.floor(Math.random() * 31) - 15); // +/- 15 mph metadata variation
                    let rarity = "common";
                    const rand = Math.random();

                    // Map rarity tiers smoothly
                    if (rand >= 0.50 && rand < 0.80) {
                        rarity = "rare";
                        realSpeed = Math.floor(realSpeed * 1.10);
                    } else if (rand >= 0.80 && rand < 0.95) {
                        rarity = "epic";
                        realSpeed = Math.floor(realSpeed * 1.25);
                    } else if (rand >= 0.95) {
                        rarity = "legendary";
                        realSpeed = Math.floor(realSpeed * 1.45);
                    }

                    const fullName = `${item.brand} ${model}${suffix} ${config}`.trim().replace(/\s+/g, ' ');

allPossiblePlanes.push({
    name: fullName,
    searchQuery: `${item.brand} ${model} airplane`, // Used for fetching the image
    speed: `${realSpeed.toLocaleString()} mph`,
    rarity: rarity,
    photo: null // We will set this dynamically
});
                });
            });
        });
    });

    // High-speed array shuffling (Fisher-Yates Algorithm)
    for (let i = allPossiblePlanes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allPossiblePlanes[i], allPossiblePlanes[j]] = [allPossiblePlanes[j], allPossiblePlanes[i]];
    }

    // Slice exactly 1,000 items and append correct tracking IDs
    return allPossiblePlanes.slice(0, 1000).map((plane, index) => {
        return {
            id: index + 1,
            ...plane
        };
    });
};

const aircraftDatabase = generateAircraftDatabase();