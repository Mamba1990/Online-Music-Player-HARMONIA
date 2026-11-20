// Ajoute des pistes libres de droits depuis Wikimedia Commons.
// Usage : node scripts/addCommonsTracks.js "Nom du fichier.ogg" ["Autre fichier.ogg|180"] [--dry-run]
//   - le nom est celui de la page Commons (avec ou sans le préfixe "File:")
//   - "|180" force la durée en secondes si Commons ne la donne pas
// Le script lit l'URL directe, la licence et l'auteur via l'API de Commons, refuse les
// licences non libres (NC, ND, droits réservés) et n'ajoute jamais deux fois le même fichier.
// dotenv est chargé dynamiquement plus bas (absent du test)
import { pathToFileURL } from 'url';

const API = 'https://commons.wikimedia.org/w/api.php';
const ALLOWED = /^(public domain|pd\b|cc0|cc[- ]by(?![- ](nc|nd))|cc[- ]by[- ]sa|cc[- ]zero)/i;
const stripTags = (html = '') => html.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

export async function resolveFile(input) {
    const [rawName, rawDuration] = input.split('|');
    const name = rawName.trim().replace(/^File:/i, '');
    const url = `${API}?${new URLSearchParams({
        action: 'query',
        titles: `File:${name}`,
        prop: 'imageinfo',
        iiprop: 'url|mediatype|extmetadata|metadata|size',
        format: 'json',
        formatversion: '2',
    })}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'HarmoniaStudentProject/1.0' } });
    if (!res.ok) throw new Error(`Commons a répondu ${res.status}`);
    const page = (await res.json())?.query?.pages?.[0];
    const info = page?.imageinfo?.[0];
    if (!page || page.missing || !info) throw new Error(`Fichier introuvable sur Commons : ${name}`);
    if (!/^AUDIO$/i.test(info.mediatype || '')) throw new Error(`Ce n'est pas un fichier audio : ${name}`);

    const meta = info.extmetadata || {};
    const license = stripTags(meta.LicenseShortName?.value) || 'unknown';
    if (!ALLOWED.test(license)) throw new Error(`Licence refusée (${license}) pour ${name}`);

    const stem = name.replace(/\.[a-z0-9]+$/i, '');
    const cut = stem.indexOf(' - ');
    const artist = cut > 0 ? stem.slice(0, cut).trim() : stripTags(meta.Artist?.value) || 'Unknown artist';
    const title = cut > 0 ? stem.slice(cut + 3).trim() : stem;

    let duration = Number(rawDuration);
    if (!duration) {
        const found = (info.metadata || []).find((m) => ['length', 'playtime_seconds', 'duration'].includes(m.name));
        duration = Math.round(Number(found?.value) || Number(info.duration) || 0);
    }
    return {
        title,
        artist: `${artist} (${license})`,
        duration,
        filePath: info.url.split("?")[0],
    };
}

async function main() {
    await import('dotenv/config');
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry-run');
    const inputs = args.filter((a) => !a.startsWith('--'));
    if (!inputs.length) {
        console.error('Donne au moins un nom de fichier Commons. Exemple :\n  node scripts/addCommonsTracks.js "Edvard Grieg - piano concerto in a minor, op. 16 - ii. adagio.ogg"');
        process.exit(1);
    }

    const results = [];
    for (const input of inputs) {
        try {
            results.push(await resolveFile(input));
        } catch (err) {
            console.error(`✗ ${input.split('|')[0]} : ${err.message}`);
        }
    }
    if (!results.length) process.exit(1);

    results.forEach((t) => console.log(`✓ ${t.artist} — ${t.title} (${t.duration}s)\n  ${t.filePath}`));
    if (dryRun) return console.log('\n--dry-run : rien n’a été écrit dans la base.');

    const { default: mongoose } = await import('mongoose');
    const { default: Track } = await import('../models/Track.js');
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!uri) {
        console.error('Variable MONGO_URI absente. Lance par exemple : MONGO_URI="mongodb+srv://..." node scripts/addCommonsTracks.js ...');
        process.exit(1);
    }
    await mongoose.connect(uri);
    console.log(`\nBase : ${mongoose.connection.name}`);
    let added = 0;
    for (const t of results) {
        if (await Track.exists({ filePath: t.filePath })) {
            console.log(`= déjà présent : ${t.title}`);
            continue;
        }
        await Track.create({ title: t.title, artist: t.artist, duration: t.duration, filePath: t.filePath });
        added += 1;
        console.log(`+ ajouté : ${t.title}`);
    }
    console.log(`\n${added} piste(s) ajoutée(s).`);
    await mongoose.disconnect();
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    main().catch((err) => {
        console.error(err);
        process.exit(1);
    });
}
