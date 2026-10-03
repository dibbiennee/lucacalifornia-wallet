/**
 * I prefissi internazionali, per chi scrive un numero da fuori Italia.
 *
 * Un paese solo per riga: il codice ISO lo distingue anche quando due paesi
 * condividono il prefisso (Stati Uniti e Canada: +1; Russia e Kazakistan: +7).
 * Questo file gira anche nel browser: niente API di Node qui dentro.
 */

export interface Paese {
  /** Codice ISO a due lettere: "IT". */
  readonly iso: string;
  readonly nome: string;
  /** Il prefisso senza "+": "39". */
  readonly prefisso: string;
}

/** L'Italia è il punto di partenza di ogni campo. */
export const ISO_PREDEFINITO = "IT";

/** I primi della lista, nell'ordine: chi arriva da fuori viene soprattutto da qui. Poi tutti gli altri in ordine alfabetico. */
const IN_CIMA = ["IT", "GB", "US", "FR", "DE", "ES", "CH", "NL", "BE", "AT", "PT", "PL", "RO", "BR", "AR", "CA", "AU", "RU", "UA", "AL"] as const;

const TUTTI: readonly Paese[] = [
  { iso: "AF", nome: "Afghanistan", prefisso: "93" },
  { iso: "AL", nome: "Albania", prefisso: "355" },
  { iso: "DZ", nome: "Algeria", prefisso: "213" },
  { iso: "AD", nome: "Andorra", prefisso: "376" },
  { iso: "AO", nome: "Angola", prefisso: "244" },
  { iso: "AG", nome: "Antigua e Barbuda", prefisso: "1268" },
  { iso: "SA", nome: "Arabia Saudita", prefisso: "966" },
  { iso: "AR", nome: "Argentina", prefisso: "54" },
  { iso: "AM", nome: "Armenia", prefisso: "374" },
  { iso: "AW", nome: "Aruba", prefisso: "297" },
  { iso: "AU", nome: "Australia", prefisso: "61" },
  { iso: "AT", nome: "Austria", prefisso: "43" },
  { iso: "AZ", nome: "Azerbaigian", prefisso: "994" },
  { iso: "BS", nome: "Bahamas", prefisso: "1242" },
  { iso: "BH", nome: "Bahrein", prefisso: "973" },
  { iso: "BD", nome: "Bangladesh", prefisso: "880" },
  { iso: "BB", nome: "Barbados", prefisso: "1246" },
  { iso: "BE", nome: "Belgio", prefisso: "32" },
  { iso: "BZ", nome: "Belize", prefisso: "501" },
  { iso: "BJ", nome: "Benin", prefisso: "229" },
  { iso: "BT", nome: "Bhutan", prefisso: "975" },
  { iso: "BY", nome: "Bielorussia", prefisso: "375" },
  { iso: "BO", nome: "Bolivia", prefisso: "591" },
  { iso: "BA", nome: "Bosnia ed Erzegovina", prefisso: "387" },
  { iso: "BW", nome: "Botswana", prefisso: "267" },
  { iso: "BR", nome: "Brasile", prefisso: "55" },
  { iso: "BN", nome: "Brunei", prefisso: "673" },
  { iso: "BG", nome: "Bulgaria", prefisso: "359" },
  { iso: "BF", nome: "Burkina Faso", prefisso: "226" },
  { iso: "BI", nome: "Burundi", prefisso: "257" },
  { iso: "KH", nome: "Cambogia", prefisso: "855" },
  { iso: "CM", nome: "Camerun", prefisso: "237" },
  { iso: "CA", nome: "Canada", prefisso: "1" },
  { iso: "CV", nome: "Capo Verde", prefisso: "238" },
  { iso: "TD", nome: "Ciad", prefisso: "235" },
  { iso: "CL", nome: "Cile", prefisso: "56" },
  { iso: "CN", nome: "Cina", prefisso: "86" },
  { iso: "CY", nome: "Cipro", prefisso: "357" },
  { iso: "CO", nome: "Colombia", prefisso: "57" },
  { iso: "KM", nome: "Comore", prefisso: "269" },
  { iso: "CG", nome: "Congo", prefisso: "242" },
  { iso: "CD", nome: "Congo (Rep. Dem.)", prefisso: "243" },
  { iso: "KP", nome: "Corea del Nord", prefisso: "850" },
  { iso: "KR", nome: "Corea del Sud", prefisso: "82" },
  { iso: "CI", nome: "Costa d'Avorio", prefisso: "225" },
  { iso: "CR", nome: "Costa Rica", prefisso: "506" },
  { iso: "HR", nome: "Croazia", prefisso: "385" },
  { iso: "CU", nome: "Cuba", prefisso: "53" },
  { iso: "CW", nome: "Curaçao", prefisso: "599" },
  { iso: "DK", nome: "Danimarca", prefisso: "45" },
  { iso: "DM", nome: "Dominica", prefisso: "1767" },
  { iso: "EC", nome: "Ecuador", prefisso: "593" },
  { iso: "EG", nome: "Egitto", prefisso: "20" },
  { iso: "SV", nome: "El Salvador", prefisso: "503" },
  { iso: "AE", nome: "Emirati Arabi Uniti", prefisso: "971" },
  { iso: "ER", nome: "Eritrea", prefisso: "291" },
  { iso: "EE", nome: "Estonia", prefisso: "372" },
  { iso: "SZ", nome: "Eswatini", prefisso: "268" },
  { iso: "ET", nome: "Etiopia", prefisso: "251" },
  { iso: "FJ", nome: "Figi", prefisso: "679" },
  { iso: "PH", nome: "Filippine", prefisso: "63" },
  { iso: "FI", nome: "Finlandia", prefisso: "358" },
  { iso: "FR", nome: "Francia", prefisso: "33" },
  { iso: "GA", nome: "Gabon", prefisso: "241" },
  { iso: "GM", nome: "Gambia", prefisso: "220" },
  { iso: "GE", nome: "Georgia", prefisso: "995" },
  { iso: "DE", nome: "Germania", prefisso: "49" },
  { iso: "GH", nome: "Ghana", prefisso: "233" },
  { iso: "JM", nome: "Giamaica", prefisso: "1876" },
  { iso: "JP", nome: "Giappone", prefisso: "81" },
  { iso: "GI", nome: "Gibilterra", prefisso: "350" },
  { iso: "DJ", nome: "Gibuti", prefisso: "253" },
  { iso: "JO", nome: "Giordania", prefisso: "962" },
  { iso: "GR", nome: "Grecia", prefisso: "30" },
  { iso: "GD", nome: "Grenada", prefisso: "1473" },
  { iso: "GL", nome: "Groenlandia", prefisso: "299" },
  { iso: "GP", nome: "Guadalupa", prefisso: "590" },
  { iso: "GU", nome: "Guam", prefisso: "1671" },
  { iso: "GT", nome: "Guatemala", prefisso: "502" },
  { iso: "GN", nome: "Guinea", prefisso: "224" },
  { iso: "GW", nome: "Guinea-Bissau", prefisso: "245" },
  { iso: "GQ", nome: "Guinea Equatoriale", prefisso: "240" },
  { iso: "GY", nome: "Guyana", prefisso: "592" },
  { iso: "GF", nome: "Guyana Francese", prefisso: "594" },
  { iso: "HT", nome: "Haiti", prefisso: "509" },
  { iso: "HN", nome: "Honduras", prefisso: "504" },
  { iso: "HK", nome: "Hong Kong", prefisso: "852" },
  { iso: "IN", nome: "India", prefisso: "91" },
  { iso: "ID", nome: "Indonesia", prefisso: "62" },
  { iso: "IR", nome: "Iran", prefisso: "98" },
  { iso: "IQ", nome: "Iraq", prefisso: "964" },
  { iso: "IE", nome: "Irlanda", prefisso: "353" },
  { iso: "IS", nome: "Islanda", prefisso: "354" },
  { iso: "KY", nome: "Isole Cayman", prefisso: "1345" },
  { iso: "CK", nome: "Isole Cook", prefisso: "682" },
  { iso: "FO", nome: "Isole Fær Øer", prefisso: "298" },
  { iso: "MH", nome: "Isole Marshall", prefisso: "692" },
  { iso: "SB", nome: "Isole Salomone", prefisso: "677" },
  { iso: "VI", nome: "Isole Vergini Americane", prefisso: "1340" },
  { iso: "VG", nome: "Isole Vergini Britanniche", prefisso: "1284" },
  { iso: "IL", nome: "Israele", prefisso: "972" },
  { iso: "IT", nome: "Italia", prefisso: "39" },
  { iso: "KZ", nome: "Kazakistan", prefisso: "7" },
  { iso: "KE", nome: "Kenya", prefisso: "254" },
  { iso: "KG", nome: "Kirghizistan", prefisso: "996" },
  { iso: "KI", nome: "Kiribati", prefisso: "686" },
  { iso: "XK", nome: "Kosovo", prefisso: "383" },
  { iso: "KW", nome: "Kuwait", prefisso: "965" },
  { iso: "LA", nome: "Laos", prefisso: "856" },
  { iso: "LS", nome: "Lesotho", prefisso: "266" },
  { iso: "LV", nome: "Lettonia", prefisso: "371" },
  { iso: "LB", nome: "Libano", prefisso: "961" },
  { iso: "LR", nome: "Liberia", prefisso: "231" },
  { iso: "LY", nome: "Libia", prefisso: "218" },
  { iso: "LI", nome: "Liechtenstein", prefisso: "423" },
  { iso: "LT", nome: "Lituania", prefisso: "370" },
  { iso: "LU", nome: "Lussemburgo", prefisso: "352" },
  { iso: "MO", nome: "Macao", prefisso: "853" },
  { iso: "MK", nome: "Macedonia del Nord", prefisso: "389" },
  { iso: "MG", nome: "Madagascar", prefisso: "261" },
  { iso: "MW", nome: "Malawi", prefisso: "265" },
  { iso: "MY", nome: "Malaysia", prefisso: "60" },
  { iso: "MV", nome: "Maldive", prefisso: "960" },
  { iso: "ML", nome: "Mali", prefisso: "223" },
  { iso: "MT", nome: "Malta", prefisso: "356" },
  { iso: "MA", nome: "Marocco", prefisso: "212" },
  { iso: "MQ", nome: "Martinica", prefisso: "596" },
  { iso: "MR", nome: "Mauritania", prefisso: "222" },
  { iso: "MU", nome: "Mauritius", prefisso: "230" },
  { iso: "MX", nome: "Messico", prefisso: "52" },
  { iso: "FM", nome: "Micronesia", prefisso: "691" },
  { iso: "MD", nome: "Moldavia", prefisso: "373" },
  { iso: "MC", nome: "Monaco", prefisso: "377" },
  { iso: "MN", nome: "Mongolia", prefisso: "976" },
  { iso: "ME", nome: "Montenegro", prefisso: "382" },
  { iso: "MS", nome: "Montserrat", prefisso: "1664" },
  { iso: "MZ", nome: "Mozambico", prefisso: "258" },
  { iso: "MM", nome: "Myanmar", prefisso: "95" },
  { iso: "NA", nome: "Namibia", prefisso: "264" },
  { iso: "NR", nome: "Nauru", prefisso: "674" },
  { iso: "NP", nome: "Nepal", prefisso: "977" },
  { iso: "NI", nome: "Nicaragua", prefisso: "505" },
  { iso: "NE", nome: "Niger", prefisso: "227" },
  { iso: "NG", nome: "Nigeria", prefisso: "234" },
  { iso: "NO", nome: "Norvegia", prefisso: "47" },
  { iso: "NC", nome: "Nuova Caledonia", prefisso: "687" },
  { iso: "NZ", nome: "Nuova Zelanda", prefisso: "64" },
  { iso: "OM", nome: "Oman", prefisso: "968" },
  { iso: "NL", nome: "Paesi Bassi", prefisso: "31" },
  { iso: "PK", nome: "Pakistan", prefisso: "92" },
  { iso: "PW", nome: "Palau", prefisso: "680" },
  { iso: "PS", nome: "Palestina", prefisso: "970" },
  { iso: "PA", nome: "Panama", prefisso: "507" },
  { iso: "PG", nome: "Papua Nuova Guinea", prefisso: "675" },
  { iso: "PY", nome: "Paraguay", prefisso: "595" },
  { iso: "PE", nome: "Perù", prefisso: "51" },
  { iso: "PF", nome: "Polinesia Francese", prefisso: "689" },
  { iso: "PL", nome: "Polonia", prefisso: "48" },
  { iso: "PR", nome: "Porto Rico", prefisso: "1787" },
  { iso: "PT", nome: "Portogallo", prefisso: "351" },
  { iso: "QA", nome: "Qatar", prefisso: "974" },
  { iso: "GB", nome: "Regno Unito", prefisso: "44" },
  { iso: "CZ", nome: "Repubblica Ceca", prefisso: "420" },
  { iso: "CF", nome: "Repubblica Centrafricana", prefisso: "236" },
  { iso: "DO", nome: "Repubblica Dominicana", prefisso: "1809" },
  { iso: "RE", nome: "Réunion", prefisso: "262" },
  { iso: "RO", nome: "Romania", prefisso: "40" },
  { iso: "RW", nome: "Ruanda", prefisso: "250" },
  { iso: "RU", nome: "Russia", prefisso: "7" },
  { iso: "KN", nome: "Saint Kitts e Nevis", prefisso: "1869" },
  { iso: "LC", nome: "Saint Lucia", prefisso: "1758" },
  { iso: "VC", nome: "Saint Vincent e Grenadine", prefisso: "1784" },
  { iso: "WS", nome: "Samoa", prefisso: "685" },
  { iso: "SM", nome: "San Marino", prefisso: "378" },
  { iso: "ST", nome: "São Tomé e Príncipe", prefisso: "239" },
  { iso: "SN", nome: "Senegal", prefisso: "221" },
  { iso: "RS", nome: "Serbia", prefisso: "381" },
  { iso: "SC", nome: "Seychelles", prefisso: "248" },
  { iso: "SL", nome: "Sierra Leone", prefisso: "232" },
  { iso: "SG", nome: "Singapore", prefisso: "65" },
  { iso: "SY", nome: "Siria", prefisso: "963" },
  { iso: "SK", nome: "Slovacchia", prefisso: "421" },
  { iso: "SI", nome: "Slovenia", prefisso: "386" },
  { iso: "SO", nome: "Somalia", prefisso: "252" },
  { iso: "ES", nome: "Spagna", prefisso: "34" },
  { iso: "LK", nome: "Sri Lanka", prefisso: "94" },
  { iso: "US", nome: "Stati Uniti", prefisso: "1" },
  { iso: "ZA", nome: "Sudafrica", prefisso: "27" },
  { iso: "SD", nome: "Sudan", prefisso: "249" },
  { iso: "SS", nome: "Sud Sudan", prefisso: "211" },
  { iso: "SR", nome: "Suriname", prefisso: "597" },
  { iso: "SE", nome: "Svezia", prefisso: "46" },
  { iso: "CH", nome: "Svizzera", prefisso: "41" },
  { iso: "TJ", nome: "Tagikistan", prefisso: "992" },
  { iso: "TW", nome: "Taiwan", prefisso: "886" },
  { iso: "TZ", nome: "Tanzania", prefisso: "255" },
  { iso: "TH", nome: "Thailandia", prefisso: "66" },
  { iso: "TL", nome: "Timor Est", prefisso: "670" },
  { iso: "TG", nome: "Togo", prefisso: "228" },
  { iso: "TO", nome: "Tonga", prefisso: "676" },
  { iso: "TT", nome: "Trinidad e Tobago", prefisso: "1868" },
  { iso: "TN", nome: "Tunisia", prefisso: "216" },
  { iso: "TR", nome: "Turchia", prefisso: "90" },
  { iso: "TM", nome: "Turkmenistan", prefisso: "993" },
  { iso: "TC", nome: "Turks e Caicos", prefisso: "1649" },
  { iso: "TV", nome: "Tuvalu", prefisso: "688" },
  { iso: "UA", nome: "Ucraina", prefisso: "380" },
  { iso: "UG", nome: "Uganda", prefisso: "256" },
  { iso: "HU", nome: "Ungheria", prefisso: "36" },
  { iso: "UY", nome: "Uruguay", prefisso: "598" },
  { iso: "UZ", nome: "Uzbekistan", prefisso: "998" },
  { iso: "VU", nome: "Vanuatu", prefisso: "678" },
  { iso: "VE", nome: "Venezuela", prefisso: "58" },
  { iso: "VN", nome: "Vietnam", prefisso: "84" },
  { iso: "YE", nome: "Yemen", prefisso: "967" },
  { iso: "ZM", nome: "Zambia", prefisso: "260" },
  { iso: "ZW", nome: "Zimbabwe", prefisso: "263" },
];

const PER_ISO = new Map(TUTTI.map((p) => [p.iso, p] as const));

/** L'elenco da mostrare: i più probabili in cima, poi gli altri in ordine alfabetico. */
export const PAESI: readonly Paese[] = [
  ...IN_CIMA.map((iso) => PER_ISO.get(iso)).filter((p): p is Paese => p !== undefined),
  ...TUTTI.filter((p) => !(IN_CIMA as readonly string[]).includes(p.iso)).sort((a, b) => a.nome.localeCompare(b.nome, "it")),
];

export function trovaPaese(iso: string): Paese {
  return PER_ISO.get(iso) ?? (PER_ISO.get(ISO_PREDEFINITO) as Paese);
}

/** La bandierina, dal codice ISO (due lettere diventano due simboli regionali). */
export function bandiera(iso: string): string {
  return [...iso.toUpperCase()].map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65)).join("");
}

/**
 * Se chi scrive incolla un numero già internazionale ("+44 7911 123456" o "0044..."),
 * lo si spezza in paese e numero. Il prefisso più lungo che combacia vince (+1268 prima di +1);
 * a parità di prefisso (Stati Uniti e Canada, Russia e Kazakistan) vale il primo dell'elenco.
 * Null se non comincia per "+" o "00", o se nessun prefisso combacia.
 */
export function daNumeroInternazionale(scritto: string): { readonly iso: string; readonly numero: string } | null {
  const pulito = scritto.trim();

  if (!pulito.startsWith("+") && !pulito.startsWith("00")) {
    return null;
  }

  const cifre = pulito.replace(/\D/g, "").replace(/^00/, "");

  for (const lunghezza of [4, 3, 2, 1]) {
    const candidato = cifre.slice(0, lunghezza);
    const paese = PAESI.find((p) => p.prefisso === candidato);

    if (paese !== undefined) {
      return { iso: paese.iso, numero: cifre.slice(lunghezza) };
    }
  }

  return null;
}
