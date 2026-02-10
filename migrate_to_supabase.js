const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load env vars manually
const loadEnv = () => {
    try {
        const envPath = path.resolve(__dirname, '.env.local');
        if (!fs.existsSync(envPath)) {
            console.error('.env.local not found!');
            process.exit(1);
        }
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
                process.env[key.trim()] = value.trim();
            }
        });
    } catch (e) {
        console.error('Error loading .env.local', e);
    }
};

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const getVal = (obj, searchKey) => {
    if (obj[searchKey] !== undefined) return obj[searchKey];
    const normalizedSearch = searchKey.toLowerCase().replace(/[^\w\s]/gi, '');
    const key = Object.keys(obj).find(k => {
        const normalizedK = k.toLowerCase().replace(/[^\w\s]/gi, '');
        return normalizedK === normalizedSearch;
    });
    return key ? obj[key] : undefined;
};

const cleanNaN = (val) => val === "NaN" || val === null || val === undefined ? undefined : val;

const runMigration = async () => {
    try {
        console.log('Reading data...');
        // Fix path resolution: data folder is in project root, same level as this script
        const dataPath = path.join(__dirname, 'data', 'raynet_data_3.json');

        if (!fs.existsSync(dataPath)) {
            throw new Error(`Data file not found at: ${dataPath}`);
        }

        const rawData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

        console.log(`Found ${rawData.length} items. Mapping...`);

        const projects = rawData.map(item => ({
            id: getVal(item, "Kód"),
            name: getVal(item, "Předmět"),
            customer: getVal(item, "Klient") || "-",
            manager: getVal(item, "Vlastník") || "-",
            status: "Aktivní",
            deadline: "-",

            closed_at: cleanNaN(getVal(item, "Uzavřeno")),
            category: cleanNaN(getVal(item, "Kategorie")),
            abra_order: cleanNaN(getVal(item, "Abra Objednávka")),
            abra_project: cleanNaN(getVal(item, "Abra Zakázka")),
            body_delivery: cleanNaN(getVal(item, "Dodání nástavby")),
            customer_handover: cleanNaN(getVal(item, "Předání zákazníkovi")),
            chassis_delivery: cleanNaN(getVal(item, "Dodání podvozku")),
            production_status: cleanNaN(getVal(item, "Status Výroby")),
            mounting_company: cleanNaN(getVal(item, "Montážní společnost")),
            body_setup: cleanNaN(getVal(item, "Nástavba nastavení")),
            serial_number: cleanNaN(getVal(item, "Výrobní číslo")),

            quantity: 1,
            action_needed_by: 'internal',
            note: "",
            created_at: new Date().toISOString()
        })).filter(p => p.name);

        console.log(`Prepared ${projects.length} projects for insertion.`);

        // Upsert data to avoid duplicates (assuming ID is unique and primary key)
        const { error } = await supabase.from('projects').upsert(projects);

        if (error) {
            console.error('Error inserting data:', error);
        } else {
            console.log('Migration successful!');
        }

    } catch (e) {
        console.error('Migration failed:', e);
    }
};

runMigration();
