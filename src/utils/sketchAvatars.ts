// Illustrated circular vector avatars inspired by the campus avatar demos
// Cohesive art style: Cornflower blue background, warm peach skin, deep indigo hair & slate blue apparel

const createSvgDataUri = (svgContent: string): string => {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent.trim().replace(/\s+/g, ' '))}`;
};

// Common SVG template wrapper ensuring clean circular clipping
const wrapAvatar = (content: string): string => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <clipPath id="avatarCircle">
      <circle cx="50" cy="50" r="48" />
    </clipPath>
  </defs>
  <g clip-path="url(#avatarCircle)">
    <rect width="100" height="100" fill="#5B92E5" />
    ${content}
  </g>
</svg>
`;

// 1. Man with Short Hair, Mustache, Collared Shirt & Dark Tie (Executive / Admin)
export const AVATAR_01_ADMIN_MUSTACHE = createSvgDataUri(wrapAvatar(`
  <!-- Shoulders & Suit/Shirt -->
  <path d="M15 100 C17 76 30 72 50 72 C70 72 83 76 85 100 Z" fill="#3B6B9C" />
  <!-- Neck -->
  <path d="M43 54 L43 75 L57 75 L57 54 Z" fill="#FCD5B5" />
  <!-- Neck Shadow -->
  <path d="M43 54 L43 64 C48 69 52 69 57 64 L57 54 C53 61 47 61 43 54 Z" fill="#DE9978" />
  <!-- Shirt Collar -->
  <path d="M38 72 L47 84 L50 84 L50 72 Z" fill="#284E75" />
  <path d="M62 72 L53 84 L50 84 L50 72 Z" fill="#284E75" />
  <!-- Necktie -->
  <polygon points="50,78 47,82 53,82" fill="#152942" />
  <path d="M47 82 L53 82 L55 100 L45 100 Z" fill="#193354" />
  <!-- Head / Face -->
  <path d="M35 36 C35 55 42 63 50 63 C58 63 65 55 65 36 C65 22 58 18 50 18 C42 18 35 22 35 36 Z" fill="#FCD5B5" />
  <!-- Mustache -->
  <path d="M44 48 C46 46 48.5 47 50 48 C51.5 47 54 46 56 48 C56 49.5 53 51.5 50 50 C47 51.5 44 49.5 44 48 Z" fill="#193354" />
  <!-- Hair: Side-parted executive cut -->
  <path d="M34 36 C33 24 40 16 50 16 C61 16 67 22 67 34 C64 31 59 26 53 25 C47 24 41 27 34 36 Z" fill="#193354" />
  <rect x="34" y="32" width="2.5" height="8" rx="1" fill="#193354" />
  <rect x="63.5" y="32" width="2.5" height="8" rx="1" fill="#193354" />
`));

// 2. Woman with Straight Hair & Bangs, Scoop Neckline
export const AVATAR_02_BANGS_WOMAN = createSvgDataUri(wrapAvatar(`
  <!-- Long hair in back -->
  <path d="M28 35 C28 65 29 80 32 100 L68 100 C71 80 72 65 72 35 Z" fill="#193354" />
  <!-- Shoulders & Scoop Top -->
  <path d="M15 100 C17 76 30 72 50 72 C70 72 83 76 85 100 Z" fill="#3B6B9C" />
  <path d="M37 72 C41 84 59 84 63 72 Z" fill="#FCD5B5" />
  <!-- Neck -->
  <path d="M43 54 L43 76 L57 76 L57 54 Z" fill="#FCD5B5" />
  <!-- Neck Shadow -->
  <path d="M43 54 L43 64 C48 69 52 69 57 64 L57 54 C53 61 47 61 43 54 Z" fill="#DE9978" />
  <!-- Head / Face -->
  <path d="M36 36 C36 54 42 63 50 63 C58 63 64 54 64 36 C64 22 58 18 50 18 C42 18 36 22 36 36 Z" fill="#FCD5B5" />
  <!-- Front Straight Bangs & Hair sides -->
  <path d="M32 36 C32 21 40 16 50 16 C60 16 68 21 68 36 L68 44 C65 44 64 38 61 38 L39 38 C36 38 35 44 32 44 Z" fill="#193354" />
`));

// 3. Young Man with Parted Fringe & Open Polo Collar (Student)
export const AVATAR_03_POLO_STUDENT = createSvgDataUri(wrapAvatar(`
  <!-- Shoulders & Polo Shirt -->
  <path d="M15 100 C17 76 30 72 50 72 C70 72 83 76 85 100 Z" fill="#3B6B9C" />
  <!-- Neck -->
  <path d="M43 54 L43 76 L57 76 L57 54 Z" fill="#FCD5B5" />
  <!-- Neck Shadow -->
  <path d="M43 54 L43 64 C48 69 52 69 57 64 L57 54 C53 61 47 61 43 54 Z" fill="#DE9978" />
  <!-- Polo Collar & V-Notch -->
  <path d="M40 72 L47 84 L50 84 L50 72 Z" fill="#284E75" />
  <path d="M60 72 L53 84 L50 84 L50 72 Z" fill="#284E75" />
  <line x1="50" y1="84" x2="50" y2="94" stroke="#193354" stroke-width="1.8" />
  <!-- Head / Face -->
  <path d="M35 36 C35 55 42 63 50 63 C58 63 65 55 65 36 C65 22 58 18 50 18 C42 18 35 22 35 36 Z" fill="#FCD5B5" />
  <!-- Hair: Short parted fringe -->
  <path d="M33 34 C33 22 41 16 50 16 C60 16 67 22 67 34 C64 30 58 26 51 26 C44 26 38 29 33 34 Z" fill="#193354" />
  <path d="M47 26 C49 32 50 35 52 35 C53 32 54 28 55 26" fill="#193354" />
`));

// 4. Woman with Topknot Bun & Collared Blouse (Faculty / Director)
export const AVATAR_04_BUN_BLOUSE = createSvgDataUri(wrapAvatar(`
  <!-- Topknot Bun -->
  <circle cx="50" cy="14" r="7.5" fill="#193354" />
  <!-- Shoulders & Blouse -->
  <path d="M15 100 C17 76 30 72 50 72 C70 72 83 76 85 100 Z" fill="#3B6B9C" />
  <!-- Collared V-Neckline -->
  <path d="M41 72 L47 85 L50 85 L50 72 Z" fill="#284E75" />
  <path d="M59 72 L53 85 L50 85 L50 72 Z" fill="#284E75" />
  <polygon points="50,76 47,84 53,84" fill="#FCD5B5" />
  <!-- Neck -->
  <path d="M44 54 L44 76 L56 76 L56 54 Z" fill="#FCD5B5" />
  <!-- Neck Shadow -->
  <path d="M44 54 L44 64 C48 69 52 69 56 64 L56 54 C52 61 48 61 44 54 Z" fill="#DE9978" />
  <!-- Head / Face -->
  <path d="M36 36 C36 54 42 63 50 63 C58 63 64 54 64 36 C64 22 58 18 50 18 C42 18 36 22 36 36 Z" fill="#FCD5B5" />
  <!-- Sleek Hair pulled back -->
  <path d="M35 34 C35 20 42 17 50 17 C58 17 65 20 65 34 C63 29 58 24 50 24 C42 24 37 29 35 34 Z" fill="#193354" />
`));

// 5. Man with Medium Swept-Back Hair & Crew Neck Tee
export const AVATAR_05_SWEPT_MAN = createSvgDataUri(wrapAvatar(`
  <!-- Hair back behind neck -->
  <path d="M31 40 C30 55 32 66 38 72 L62 72 C68 66 70 55 69 40 Z" fill="#193354" />
  <!-- Shoulders & Tee -->
  <path d="M15 100 C17 76 30 72 50 72 C70 72 83 76 85 100 Z" fill="#3B6B9C" />
  <path d="M41 72 C44 78 56 78 59 72 Z" fill="#284E75" />
  <!-- Neck -->
  <path d="M43 54 L43 75 L57 75 L57 54 Z" fill="#FCD5B5" />
  <!-- Neck Shadow -->
  <path d="M43 54 L43 64 C48 69 52 69 57 64 L57 54 C53 61 47 61 43 54 Z" fill="#DE9978" />
  <!-- Head / Face -->
  <path d="M35 36 C35 55 42 63 50 63 C58 63 65 55 65 36 C65 22 58 18 50 18 C42 18 35 22 35 36 Z" fill="#FCD5B5" />
  <!-- Swept-back hair style -->
  <path d="M33 34 C33 20 41 15 50 15 C60 15 67 20 67 34 C65 26 58 22 50 22 C42 22 36 26 33 34 Z" fill="#193354" />
  <path d="M32 34 C31 44 33 50 35 53 C36 48 35 40 36 34 Z" fill="#193354" />
  <path d="M68 34 C69 44 67 50 65 53 C64 48 65 40 64 34 Z" fill="#193354" />
`));

// 6. Woman with Layered Bob & V-Neck Top
export const AVATAR_06_BOB_WOMAN = createSvgDataUri(wrapAvatar(`
  <!-- Shoulders & V-Neck -->
  <path d="M15 100 C17 76 30 72 50 72 C70 72 83 76 85 100 Z" fill="#3B6B9C" />
  <polygon points="50,83 42,72 58,72" fill="#FCD5B5" />
  <!-- Neck -->
  <path d="M43 54 L43 76 L57 76 L57 54 Z" fill="#FCD5B5" />
  <!-- Neck Shadow -->
  <path d="M43 54 L43 64 C48 69 52 69 57 64 L57 54 C53 61 47 61 43 54 Z" fill="#DE9978" />
  <!-- Head / Face -->
  <path d="M36 36 C36 54 42 63 50 63 C58 63 64 54 64 36 C64 22 58 18 50 18 C42 18 36 22 36 36 Z" fill="#FCD5B5" />
  <!-- Layered Bob Hair curving around cheeks -->
  <path d="M31 38 C31 22 40 16 50 16 C60 16 69 22 69 38 C69 54 64 62 60 62 C61 54 64 46 64 36 C60 30 55 28 50 28 C45 28 40 30 36 36 C36 46 39 54 40 62 C36 62 31 54 31 38 Z" fill="#193354" />
`));

// 7. Man with Curly Hair & Trimmed Beard (Creative / Scholar)
export const AVATAR_07_CURLY_BEARD = createSvgDataUri(wrapAvatar(`
  <!-- Shoulders & Tee -->
  <path d="M15 100 C17 76 30 72 50 72 C70 72 83 76 85 100 Z" fill="#3B6B9C" />
  <path d="M41 72 C44 78 56 78 59 72 Z" fill="#284E75" />
  <!-- Neck -->
  <path d="M43 54 L43 75 L57 75 L57 54 Z" fill="#FCD5B5" />
  <!-- Neck Shadow -->
  <path d="M43 54 L43 64 C48 69 52 69 57 64 L57 54 C53 61 47 61 43 54 Z" fill="#DE9978" />
  <!-- Head / Face -->
  <path d="M35 36 C35 55 42 63 50 63 C58 63 65 55 65 36 C65 22 58 18 50 18 C42 18 35 22 35 36 Z" fill="#FCD5B5" />
  <!-- Trimmed Beard & Mustache -->
  <path d="M37 46 C37 60 43 65 50 65 C57 65 63 60 63 46 C61 51 57 54 50 54 C43 54 39 51 37 46 Z" fill="#193354" />
  <path d="M44 48 C46 46 48.5 47 50 48 C51.5 47 54 46 56 48 C56 49.5 53 51.5 50 50 C47 51.5 44 49.5 44 48 Z" fill="#193354" />
  <!-- Curly textured hair -->
  <path d="M32 34 C30 25 36 15 50 15 C64 15 70 25 68 34 C65 28 60 22 50 22 C40 22 35 28 32 34 Z" fill="#193354" />
  <circle cx="34" cy="22" r="4.5" fill="#193354" />
  <circle cx="44" cy="16" r="4.5" fill="#193354" />
  <circle cx="56" cy="16" r="4.5" fill="#193354" />
  <circle cx="66" cy="22" r="4.5" fill="#193354" />
`));

// 8. Woman with Voluminous Wavy Hair & Scoop Tank Top
export const AVATAR_08_WAVY_WOMAN = createSvgDataUri(wrapAvatar(`
  <!-- Voluminous wavy back hair -->
  <path d="M22 45 C20 62 25 72 32 75 L68 75 C75 72 80 62 78 45 C78 28 66 16 50 16 C34 16 22 28 22 45 Z" fill="#193354" />
  <!-- Shoulders & Scoop Tank Top -->
  <path d="M15 100 C17 76 30 72 50 72 C70 72 83 76 85 100 Z" fill="#3B6B9C" />
  <path d="M35 72 C39 88 61 88 65 72 Z" fill="#FCD5B5" />
  <!-- Neck -->
  <path d="M43 54 L43 78 L57 78 L57 54 Z" fill="#FCD5B5" />
  <!-- Neck Shadow -->
  <path d="M43 54 L43 64 C48 69 52 69 57 64 L57 54 C53 61 47 61 43 54 Z" fill="#DE9978" />
  <!-- Head / Face -->
  <path d="M36 36 C36 54 42 63 50 63 C58 63 64 54 64 36 C64 22 58 18 50 18 C42 18 36 22 36 36 Z" fill="#FCD5B5" />
  <!-- Side wavy locks framing face -->
  <path d="M34 34 C33 46 36 54 39 58 C37 52 36 44 38 34 Z" fill="#193354" />
  <path d="M66 34 C67 46 64 54 61 58 C63 52 64 44 62 34 Z" fill="#193354" />
`));

// 9. Young Man with Messy Hair & Wireframe Glasses (Scholar / Tech Student)
export const AVATAR_09_GLASSES_SCHOLAR = createSvgDataUri(wrapAvatar(`
  <!-- Shoulders & Tee -->
  <path d="M15 100 C17 76 30 72 50 72 C70 72 83 76 85 100 Z" fill="#3B6B9C" />
  <path d="M41 72 C44 78 56 78 59 72 Z" fill="#284E75" />
  <!-- Neck -->
  <path d="M43 54 L43 75 L57 75 L57 54 Z" fill="#FCD5B5" />
  <!-- Neck Shadow -->
  <path d="M43 54 L43 64 C48 69 52 69 57 64 L57 54 C53 61 47 61 43 54 Z" fill="#DE9978" />
  <!-- Head / Face -->
  <path d="M35 36 C35 55 42 63 50 63 C58 63 65 55 65 36 C65 22 58 18 50 18 C42 18 35 22 35 36 Z" fill="#FCD5B5" />
  <!-- Wireframe Spectacles / Glasses -->
  <circle cx="42.5" cy="44" r="5.2" fill="none" stroke="#193354" stroke-width="1.8" />
  <circle cx="57.5" cy="44" r="5.2" fill="none" stroke="#193354" stroke-width="1.8" />
  <line x1="47.7" y1="44" x2="52.3" y2="44" stroke="#193354" stroke-width="1.8" />
  <line x1="37.3" y1="43" x2="34" y2="42" stroke="#193354" stroke-width="1.5" />
  <line x1="62.7" y1="43" x2="66" y2="42" stroke="#193354" stroke-width="1.5" />
  <!-- Messy short hair -->
  <path d="M33 34 C33 22 41 16 50 16 C60 16 67 22 67 34 C64 30 58 26 50 26 C42 26 37 30 33 34 Z" fill="#193354" />
  <path d="M37 20 L35 15 L42 18 Z" fill="#193354" />
  <path d="M53 16 L56 12 L61 17 Z" fill="#193354" />
`));

// 10. Woman with Center-Parted Long Silky Straight Hair
export const AVATAR_10_LONG_HAIR_WOMAN = createSvgDataUri(wrapAvatar(`
  <!-- Long straight hair falling over front shoulders -->
  <path d="M26 35 C26 65 28 85 34 100 L66 100 C72 85 74 65 74 35 C74 18 63 15 50 15 C37 15 26 18 26 35 Z" fill="#193354" />
  <!-- Shoulders & Tank Top -->
  <path d="M15 100 C17 76 30 72 50 72 C70 72 83 76 85 100 Z" fill="#3B6B9C" />
  <path d="M37 72 C41 86 59 86 63 72 Z" fill="#FCD5B5" />
  <!-- Neck -->
  <path d="M43 54 L43 78 L57 78 L57 54 Z" fill="#FCD5B5" />
  <!-- Neck Shadow -->
  <path d="M43 54 L43 64 C48 69 52 69 57 64 L57 54 C53 61 47 61 43 54 Z" fill="#DE9978" />
  <!-- Head / Face -->
  <path d="M36 36 C36 54 42 63 50 63 C58 63 64 54 64 36 C64 22 58 18 50 18 C42 18 36 22 36 36 Z" fill="#FCD5B5" />
  <!-- Symmetrical parted locks falling down chest -->
  <path d="M33 34 C33 52 35 68 37 80 C39 68 40 50 39 34 Z" fill="#193354" />
  <path d="M67 34 C67 52 65 68 63 80 C61 68 60 50 61 34 Z" fill="#193354" />
`));

// 11. Man with Trimmed Beard & Collared Dress Shirt (Senior Faculty / Professor)
export const AVATAR_11_BEARD_FACULTY = createSvgDataUri(wrapAvatar(`
  <!-- Shoulders & Collared Dress Shirt -->
  <path d="M15 100 C17 76 30 72 50 72 C70 72 83 76 85 100 Z" fill="#3B6B9C" />
  <!-- Sharp dress collar -->
  <path d="M38 72 L47 84 L50 84 L50 72 Z" fill="#284E75" />
  <path d="M62 72 L53 84 L50 84 L50 72 Z" fill="#284E75" />
  <polygon points="50,78 47,84 53,84" fill="#FCD5B5" />
  <line x1="50" y1="84" x2="50" y2="100" stroke="#284E75" stroke-width="1.8" />
  <!-- Neck -->
  <path d="M43 54 L43 75 L57 75 L57 54 Z" fill="#FCD5B5" />
  <!-- Neck Shadow -->
  <path d="M43 54 L43 64 C48 69 52 69 57 64 L57 54 C53 61 47 61 43 54 Z" fill="#DE9978" />
  <!-- Head / Face -->
  <path d="M35 36 C35 55 42 63 50 63 C58 63 65 55 65 36 C65 22 58 18 50 18 C42 18 35 22 35 36 Z" fill="#FCD5B5" />
  <!-- Full Trimmed Beard & Mustache -->
  <path d="M36 46 C36 61 42 65 50 65 C58 65 64 61 64 46 C62 51 57 55 50 55 C43 55 38 51 36 46 Z" fill="#193354" />
  <path d="M44 48 C46 46 48.5 47 50 48 C51.5 47 54 46 56 48 C56 49.5 53 51.5 50 50 C47 51.5 44 49.5 44 48 Z" fill="#193354" />
  <!-- Clean side-parted hair -->
  <path d="M34 34 C33 22 41 16 50 16 C60 16 67 22 67 34 C64 29 58 24 50 24 C42 24 37 29 34 34 Z" fill="#193354" />
`));

// 12. Woman with Sleek Pixie Cut & Scoop Blouse
export const AVATAR_12_PIXIE_WOMAN = createSvgDataUri(wrapAvatar(`
  <!-- Shoulders & Scoop Top -->
  <path d="M15 100 C17 76 30 72 50 72 C70 72 83 76 85 100 Z" fill="#3B6B9C" />
  <path d="M38 72 C42 82 58 82 62 72 Z" fill="#FCD5B5" />
  <!-- Neck -->
  <path d="M43 54 L43 76 L57 76 L57 54 Z" fill="#FCD5B5" />
  <!-- Neck Shadow -->
  <path d="M43 54 L43 64 C48 69 52 69 57 64 L57 54 C53 61 47 61 43 54 Z" fill="#DE9978" />
  <!-- Head / Face -->
  <path d="M36 36 C36 54 42 63 50 63 C58 63 64 54 64 36 C64 22 58 18 50 18 C42 18 36 22 36 36 Z" fill="#FCD5B5" />
  <!-- Sleek Short Pixie Cut -->
  <path d="M33 34 C33 20 42 16 50 16 C59 16 67 20 67 34 C64 30 58 24 49 25 C43 26 38 29 33 34 Z" fill="#193354" />
  <path d="M34 32 C33 38 34 44 36 46 C37 42 36 36 36 32 Z" fill="#193354" />
  <path d="M66 32 C67 38 66 44 64 46 C63 42 64 36 64 32 Z" fill="#193354" />
`));

// 13. Young Man with Modern Taper Fade / Textured Top
export const AVATAR_13_FADE_STUDENT = createSvgDataUri(wrapAvatar(`
  <!-- Shoulders & Tee -->
  <path d="M15 100 C17 76 30 72 50 72 C70 72 83 76 85 100 Z" fill="#3B6B9C" />
  <path d="M41 72 C44 78 56 78 59 72 Z" fill="#284E75" />
  <!-- Neck -->
  <path d="M43 54 L43 75 L57 75 L57 54 Z" fill="#FCD5B5" />
  <!-- Neck Shadow -->
  <path d="M43 54 L43 64 C48 69 52 69 57 64 L57 54 C53 61 47 61 43 54 Z" fill="#DE9978" />
  <!-- Head / Face -->
  <path d="M35 36 C35 55 42 63 50 63 C58 63 65 55 65 36 C65 22 58 18 50 18 C42 18 35 22 35 36 Z" fill="#FCD5B5" />
  <!-- Modern Textured High Fade -->
  <path d="M34 32 C34 20 42 15 50 15 C58 15 66 20 66 32 C62 26 56 22 50 22 C44 22 38 26 34 32 Z" fill="#193354" />
  <path d="M37 20 L39 16 L44 19 Z" fill="#193354" />
  <path d="M47 18 L50 14 L53 18 Z" fill="#193354" />
  <path d="M56 19 L60 16 L63 20 Z" fill="#193354" />
`));

// 14. Woman with Shoulder-Length Wavy Hair with Side Bang
export const AVATAR_14_WAVY_BOB = createSvgDataUri(wrapAvatar(`
  <!-- Wavy hair in back -->
  <path d="M26 38 C25 60 28 72 34 80 L66 80 C72 72 75 60 74 38 Z" fill="#193354" />
  <!-- Shoulders & Tee -->
  <path d="M15 100 C17 76 30 72 50 72 C70 72 83 76 85 100 Z" fill="#3B6B9C" />
  <path d="M41 72 C44 78 56 78 59 72 Z" fill="#284E75" />
  <!-- Neck -->
  <path d="M43 54 L43 76 L57 76 L57 54 Z" fill="#FCD5B5" />
  <!-- Neck Shadow -->
  <path d="M43 54 L43 64 C48 69 52 69 57 64 L57 54 C53 61 47 61 43 54 Z" fill="#DE9978" />
  <!-- Head / Face -->
  <path d="M36 36 C36 54 42 63 50 63 C58 63 64 54 64 36 C64 22 58 18 50 18 C42 18 36 22 36 36 Z" fill="#FCD5B5" />
  <!-- Side-swept wavy bangs -->
  <path d="M32 34 C32 20 41 16 50 16 C60 16 68 20 68 34 C64 32 58 24 48 24 C40 24 35 28 32 34 Z" fill="#193354" />
`));

// 15. Young Man in Casual Hooded Sweatshirt (Hoodie Student)
export const AVATAR_15_HOODIE_STUDENT = createSvgDataUri(wrapAvatar(`
  <!-- Shoulders & Hoodie Body -->
  <path d="M15 100 C17 76 30 72 50 72 C70 72 83 76 85 100 Z" fill="#3B6B9C" />
  <!-- Drawn Hoodie Opening & Inner Tee -->
  <path d="M34 78 C34 94 43 100 50 100 C57 100 66 94 66 78 C62 74 56 73 50 73 C44 73 38 74 34 78 Z" fill="#284E75" />
  <polygon points="50,88 45,78 55,78" fill="#FCD5B5" />
  <polygon points="50,94 47,88 53,88" fill="#FFFFFF" />
  <!-- Neck -->
  <path d="M43 54 L43 75 L57 75 L57 54 Z" fill="#FCD5B5" />
  <!-- Neck Shadow -->
  <path d="M43 54 L43 64 C48 69 52 69 57 64 L57 54 C53 61 47 61 43 54 Z" fill="#DE9978" />
  <!-- Head / Face -->
  <path d="M35 36 C35 55 42 63 50 63 C58 63 65 55 65 36 C65 22 58 18 50 18 C42 18 35 22 35 36 Z" fill="#FCD5B5" />
  <!-- Styled short hair -->
  <path d="M33 34 C33 22 41 16 50 16 C60 16 67 22 67 34 C64 29 58 24 50 24 C42 24 37 29 33 34 Z" fill="#193354" />
`));

// 16. Woman with Long Curly Cascading Hair in Casual Hoodie
export const AVATAR_16_CURLY_HOODIE = createSvgDataUri(wrapAvatar(`
  <!-- Voluminous long curls cascading in back -->
  <path d="M22 38 C18 60 22 80 28 100 L72 100 C78 80 82 60 78 38 C78 20 65 15 50 15 C35 15 22 20 22 38 Z" fill="#193354" />
  <!-- Shoulders & Hoodie -->
  <path d="M15 100 C17 76 30 72 50 72 C70 72 83 76 85 100 Z" fill="#3B6B9C" />
  <!-- Hoodie inner neckline -->
  <path d="M35 78 C35 94 44 100 50 100 C56 100 65 94 65 78 C61 74 55 73 50 73 C45 73 39 74 35 78 Z" fill="#284E75" />
  <polygon points="50,88 45,78 55,78" fill="#FCD5B5" />
  <polygon points="50,94 47,88 53,88" fill="#FFFFFF" />
  <!-- Neck -->
  <path d="M43 54 L43 76 L57 76 L57 54 Z" fill="#FCD5B5" />
  <!-- Neck Shadow -->
  <path d="M43 54 L43 64 C48 69 52 69 57 64 L57 54 C53 61 47 61 43 54 Z" fill="#DE9978" />
  <!-- Head / Face -->
  <path d="M36 36 C36 54 42 63 50 63 C58 63 64 54 64 36 C64 22 58 18 50 18 C42 18 36 22 36 36 Z" fill="#FCD5B5" />
  <!-- Front wavy curls framing face -->
  <path d="M32 34 C31 46 34 56 36 68 C38 56 39 46 38 34 Z" fill="#193354" />
  <path d="M68 34 C69 46 66 56 64 68 C62 56 61 46 62 34 Z" fill="#193354" />
`));

// Role-based defaults matching the user's demo image archetypes
export const SKETCH_ADMIN = AVATAR_01_ADMIN_MUSTACHE;
export const SKETCH_FACULTY = AVATAR_11_BEARD_FACULTY;
export const SKETCH_STUDENT = AVATAR_09_GLASSES_SCHOLAR;

// Full 16-Avatar Collection representing all profiles from the user's reference image
export const SKETCH_AVATAR_PRESETS = [
  { id: 'avatar_01', label: 'Executive Admin', role: 'Admin', src: AVATAR_01_ADMIN_MUSTACHE },
  { id: 'avatar_02', label: 'Bangs Silhouette', role: 'Student', src: AVATAR_02_BANGS_WOMAN },
  { id: 'avatar_03', label: 'Polo Scholar', role: 'Student', src: AVATAR_03_POLO_STUDENT },
  { id: 'avatar_04', label: 'Faculty Director', role: 'Faculty', src: AVATAR_04_BUN_BLOUSE },
  { id: 'avatar_05', label: 'Swept Back', role: 'Student', src: AVATAR_05_SWEPT_MAN },
  { id: 'avatar_06', label: 'Layered Bob', role: 'Student', src: AVATAR_06_BOB_WOMAN },
  { id: 'avatar_07', label: 'Curly Beard', role: 'Faculty', src: AVATAR_07_CURLY_BEARD },
  { id: 'avatar_08', label: 'Wavy Flare', role: 'Student', src: AVATAR_08_WAVY_WOMAN },
  { id: 'avatar_09', label: 'Glasses Scholar', role: 'Student', src: AVATAR_09_GLASSES_SCHOLAR },
  { id: 'avatar_10', label: 'Straight Part', role: 'Student', src: AVATAR_10_LONG_HAIR_WOMAN },
  { id: 'avatar_11', label: 'Senior Professor', role: 'Faculty', src: AVATAR_11_BEARD_FACULTY },
  { id: 'avatar_12', label: 'Pixie Crop', role: 'Student', src: AVATAR_12_PIXIE_WOMAN },
  { id: 'avatar_13', label: 'Fade Crop', role: 'Student', src: AVATAR_13_FADE_STUDENT },
  { id: 'avatar_14', label: 'Wavy Bob', role: 'Student', src: AVATAR_14_WAVY_BOB },
  { id: 'avatar_15', label: 'Hoodie Scholar', role: 'Student', src: AVATAR_15_HOODIE_STUDENT },
  { id: 'avatar_16', label: 'Curly Hoodie', role: 'Student', src: AVATAR_16_CURLY_HOODIE },
];

export const getSketchAvatar = (role?: string): string => {
  if (role === 'Admin') return AVATAR_01_ADMIN_MUSTACHE;
  if (role === 'Faculty') return AVATAR_11_BEARD_FACULTY;
  return AVATAR_09_GLASSES_SCHOLAR;
};
