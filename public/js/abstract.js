(function(){
'use strict';
        const fileInput = document.getElementById('fileInput');
        const reshuffleButton = document.getElementById('reshuffleButton');
        
        const saveDropdownButton = document.getElementById('saveDropdownButton');
        const saveOptions = document.getElementById('saveOptions');
        const saveJpgButton = document.getElementById('saveJpgButton'); 
        const savePngButton = document.getElementById('savePngButton'); 
        const saveSvgButton = document.getElementById('saveSvgButton');

        const canvasElement = document.getElementById('gpsArtCanvas');
        const canvasWrapper = document.getElementById('canvas-wrapper');
        
        const paletteButton = document.getElementById('paletteButton');
        const paletteDropdown = document.getElementById('paletteDropdown');
        const currentPaletteName = document.getElementById('currentPaletteName');
        const currentPaletteStrip = document.getElementById('currentPaletteStrip');
        const favoritesList = document.getElementById('favoritesList');
        const featuredList = document.getElementById('featuredList');
        const libraryList = document.getElementById('libraryList');
        const libCount = document.getElementById('libCount');
        const surpriseButton = document.getElementById('surpriseButton');
        const dicePaletteButton = document.getElementById('dicePaletteButton');
        const bgColorInput = document.getElementById('bgColorInput');
        const bgResetButton = document.getElementById('bgResetButton');

        const routeList = document.getElementById('routeList');
        const routeCount = document.getElementById('routeCount');
        const routeSearch = document.getElementById('routeSearch');
        const statsCard = document.getElementById('statsCard');
        const statsHeading = document.getElementById('statsHeading');
        const statsTitle = document.getElementById('statsTitle');
        const statsSub = document.getElementById('statsSub');
        const statsGrid = document.getElementById('statsGrid');
        const clearFilesButton = document.getElementById('clearFilesButton');
        const fileInputLabel = document.getElementById('fileInputLabel');

        const editHint = document.getElementById('editHint');
        const strokeWeightSlider = document.getElementById('strokeWeightSlider');
        const strokeWeightValue = document.getElementById('strokeWeightValue');
        const opacitySlider = document.getElementById('opacitySlider');
        const opacityValue = document.getElementById('opacityValue');
        const colorDock = document.getElementById('colorDock');
        const dockModeLabel = document.getElementById('dockModeLabel');
        const ratioSelect = document.getElementById('ratioSelect');
        const orientationButton = document.getElementById('orientationButton');
        const scaleSlider = document.getElementById('scaleSlider');
        const scaleValueDisplay = document.getElementById('scaleValue');
        const rotationSlider = document.getElementById('rotationSlider');
        const rotationValueDisplay = document.getElementById('rotationValue');
        const doneEditingButton = document.getElementById('doneEditingButton');
        const reflectHButton = document.getElementById('reflectHButton');
        const reflectVButton = document.getElementById('reflectVButton');

        let fabricCanvas; 
        const isAdvancedEditingActive = true;  // editing is always on now
        let fileOrderCounter = 0;
        let canvasRatio = { w: 16, h: 9 };
        let isPortrait = false;

        const messageModal = document.getElementById('messageModal');
        const modalMessageText = document.getElementById('modalMessageText');
        const modalCloseButton = document.getElementById('modalCloseButton');

        // ============================================================
        // PALETTE LIBRARY — { n: name, c: [4 hex], f: featured? }
        // 5th complementary color + auto background derived at load.
        // ============================================================
        const PALETTE_LIBRARY = [
            // ---- Favorites (fav: true) — shown first, marked with `fav`. ----
            // Palettes with 5+ colors display 5; extras beyond 5 (and the 9-color
            // set) feed the >5-route extension pool. 4-color sets get a matched 5th.
            { n: 'Misty moorland',  c: ['#818D92','#586A6A','#B9A394','#D4C5C7','#DAD4EF'], fav: true },
            { n: 'Weathered olive', c: ['#2F2504','#594E36','#7E846B','#A5AE9E','#D0DDD7'], fav: true },
            { n: 'Twilight harbor', c: ['#DBC2CF','#9FA2B2','#3C7A89','#2E4756','#16262E'], fav: true },
            { n: 'Ember dusk',      c: ['#202C39','#283845','#B8B08D','#F2D492','#F29559'], fav: true },
            { n: 'Midnight tide',   c: ['#0D1321','#1D2D44','#3E5C76','#748CAB','#F0EBD8'], fav: true },
            { n: 'Terracotta trail',c: ['#7F8267','#8B9EA0','#CD896C','#F3EEE8'],           fav: true },
            { n: 'Forest sage',     c: ['#CAD2C5','#84A98C','#52796F','#354F52','#2F3E46'], fav: true },
            { n: 'Rust and teal',   c: ['#283D3B','#197278','#EDDDD4','#C44536','#772E25'], fav: true },
            { n: 'Arctic harbor',   c: ['#000000','#2F4550','#586F7C','#B8DBD9','#F4F4F9'], fav: true },
            { n: 'Harvest clay',    c: ['#C0CAAD','#9DA9A0','#654C4F','#B26E63','#CEC075'], fav: true },
            { n: 'Sunset spectrum', c: ['#005F73','#94D2BD','#EE9B00','#BB3E03','#9B2226'],
                                    x: ['#0A9396','#E9D8A6','#CA6702','#AE2012'],           fav: true },
            { n: 'Coastal amber',   c: ['#8ECAE6','#219EBC','#023047','#FFB703','#FB8500'], fav: true },
            { n: 'Savanna sunset',  c: ['#264653','#2A9D8F','#E9C46A','#F4A261','#E76F51'], fav: true },
            { n: 'Olive harvest',   c: ['#606C38','#283618','#FEFAE0','#DDA15E','#BC6C25'], fav: true },
            { n: 'Citrus pop',      c: ['#EAF2E3','#61E8E1','#F25757','#F2E863','#F2CD60'], fav: true },
            // ---- Original library ----
            { n: 'Stormy morning', c: ['#6B8AA7','#BEDDFC','#87BDF1','#384959'], f: true },
            { n: 'Mossy hollow', c: ['#636B2F','#B9C096','#D4DE95','#3D4126'] },
            { n: 'Blue eclipse', c: ['#282656','#8685AD','#525080','#0F0E46'] },
            { n: 'Lush forest', c: ['#2D6F3F','#CDFFDC','#68BA7F','#233E2B'], f: true },
            { n: 'Green juice', c: ['#4CBB16','#48872C','#39542B','#2B3324'] },
            { n: 'Chili spice', c: ['#CD1B17','#FEA996','#9B1212','#380009'] },
            { n: 'Chocolate truffle', c: ['#7E4A1A','#C05800','#FDFBD4','#38240D'] },
            { n: 'Ink wash', c: ['#5C5C5C','#CBCBCB','#FFFFE3','#6C8196'] },
            { n: 'Golden taupe', c: ['#D8B84B','#BDB76B','#FDFBD4','#CE8947'] },
            { n: 'Wisteria bloom', c: ['#D8D7FF','#9400D3','#D7BFD7','#EE80E9'] },
            { n: 'Burnt sienna', c: ['#E6644A','#F5F5DD','#F5A361','#A0522C'] },
            { n: 'Blooming romance', c: ['#660032','#E574AC','#46920E','#005208'] },
            { n: 'Desert dusk', c: ['#A4574F','#E68057','#BE7588','#9A3A8C'] },
            { n: 'Lavender fields', c: ['#FEFAD5','#BCB96A','#C1BFFF','#D06DFC'] },
            { n: 'Hydrangea', c: ['#FF8CA1','#FFC3BA','#FE9CE9','#AC56C3'] },
            { n: 'Cactus flower', c: ['#E491A5','#855764','#92E5B9','#8EC67F'] },
            { n: 'Wildflowers', c: ['#A8DCAB','#509753','#DBA9A6','#BD92BE'] },
            { n: 'Country garden', c: ['#FFFFE3','#DBD4FE','#808135','#723380'] },
            { n: 'Lotus garden', c: ['#ADEBB4','#FF867B','#ECAEE7','#6B413D'] },
            { n: 'Iris garden', c: ['#A47DAC','#692477','#81AB7D','#6B6B4F'] },
            { n: 'Fresh peach', c: ['#FFD3AC','#FFB6AD','#E39A7B','#DCB16C'] },
            { n: 'Golden hour', c: ['#FFC519','#CFB53C','#E0AFFE','#EDEDC9'], f: true },
            { n: 'Spiced chai', c: ['#FEFBD8','#D47E30','#8D5A2B','#825E34'] },
            { n: 'Cherry blossom', c: ['#F4CCCC','#FFFFFF','#D5F3D9','#FFB7C5'] },
            { n: 'Evening rose', c: ['#E0AAAA','#9A6565','#8E4585','#4A4A4A'] },
            { n: 'Pastel garden', c: ['#CC6F7F','#F0B8B9','#A1AE9D','#54463B'] },
            { n: 'Tuscan sunset', c: ['#E6644A','#FFD3AC','#9888A2','#8A2B0D'] },
            { n: 'Zesty lemon', c: ['#FFFF68','#FDE664','#D7D58A','#B3B248'] },
            { n: 'California beaches', c: ['#FFBF67','#66F5FE','#65C4FF','#7B99AB'] },
            { n: 'Freshly squeezed', c: ['#FEBF01','#F2CF7F','#FFE643','#FF7800'] },
            { n: 'Pistachio dream', c: ['#7FEF81','#E3F0A2','#B9DBA1','#42D775'] },
            { n: 'Mango popsicle', c: ['#F2BA49','#ECD378','#F1E82A','#F2742F'] },
            { n: 'Guava', c: ['#FF845A','#FFB679','#E55246','#D05277'] },
            { n: 'Glowing horizon', c: ['#FFB345','#42EAFF','#4271FD','#FF7E44'] },
            { n: 'Sunny day', c: ['#FEBF01','#7F7140','#007EFF','#2400FF'] },
            { n: 'Retro sunset', c: ['#C4611B','#FFCE1B','#069594','#B7400F'], f: true },
            { n: 'Bubblegum pop', c: ['#FF78BB','#069594','#FFFFFF','#97F7FD'], f: true },
            { n: 'Cotton candy skies', c: ['#B9A2E9','#B8E3E9','#F5B8D5','#F9BEDE'] },
            { n: 'Electric kiwi', c: ['#D1FF1A','#FFFF02','#DFFE01','#000000'] },
            { n: 'Watermelon splash', c: ['#FC7991','#89F436','#4A4A4A','#ADEBB2'] },
            { n: 'Alchemical reaction', c: ['#9E00FE','#DE801C','#6BFF00','#5C7F3F'] },
            { n: 'Electropop', c: ['#CCFF03','#FF6900','#FA00FE','#5200FF'], f: true },
            { n: 'Cool revival', c: ['#00FFFF','#01AFFF','#00DD92','#00FF53'] },
            { n: 'Neon jungle', c: ['#89F338','#39A710','#F23599','#A936F2'] },
            { n: 'Sharp edge', c: ['#898989','#D9D9D9','#FF4C4D','#4DFFBB'] },
            { n: 'Electric fusion', c: ['#00F0FF','#00FF81','#FFA800','#FF6701'] },
            { n: 'Fireworks', c: ['#EF2101','#E88A38','#970116','#C000AC'] },
            { n: 'Space berries', c: ['#FE3EB5','#FFB7DC','#FC692B','#8B1945'] },
            { n: 'Pop art', c: ['#19F2FE','#FF46A2','#FFFF02','#EE4B2A'] },
            { n: 'Urban graffiti', c: ['#FF3A19','#2BFF06','#00F0FF','#5A5A5A'] },
            { n: 'Neon noir', c: ['#191919','#2BFF06','#BF00FE','#2D2D2D'] },
            { n: 'Tropical punch', c: ['#FF8D56','#FFBFCB','#FBE883','#069594'] },
            { n: 'Cobalt sky', c: ['#1959B3','#010080','#82C8E4','#6C8196'] },
            { n: 'Technicolor dream', c: ['#FF19FE','#00FFFF','#CCFF01','#191971'] },
            { n: 'Jewel box', c: ['#61CE85','#0F53B9','#9966CB','#CFB53C'], f: true },
            { n: 'Salt and pepper', c: ['#FFFFFF','#D4D4D4','#B3B3B3','#2B2B2B'] },
            { n: 'Quite clear', c: ['#CBCBCB','#F2F2F2','#174C38','#4E1617'] },
            { n: 'Gothic noir', c: ['#000000','#D2D0D1','#988686','#5D4F4F'] },
            { n: 'Yacht club', c: ['#F2F1EF','#BBBDBC','#225F72','#713E21'] },
            { n: 'Quiet luxury', c: ['#F5E6C9','#E7D69E','#D9BBB0','#AD9D8D'], f: true },
            { n: 'Night sands', c: ['#CBBE94','#FCE8B3','#81775D','#564A22'] },
            { n: 'Harbor haze', c: ['#919EAE','#5A8DC4','#AC9E91','#726F60'] },
            { n: 'Old photograph', c: ['#FEFAD5','#DAD7B6','#878471','#555233'] },
            { n: 'Cappuccino', c: ['#D8B589','#C7C0B8','#705E47','#432701'] },
            { n: 'Breakfast tea', c: ['#FFD3AC','#CCBEB1','#664C35','#351C08'] },
            { n: 'Cozy campfire', c: ['#89512A','#AE7933','#8A6F28','#680F09'] },
            { n: 'Stone path', c: ['#ADA493','#A5A58D','#969084','#E8E5DE'] },
            { n: 'Desert mirage', c: ['#C7B98C','#E35336','#98A869','#262756'] },
            { n: 'Honeycomb', c: ['#FFC721','#F9DF76','#FFFCCF','#89512A'] },
            { n: 'Urban loft', c: ['#A6A4A5','#A35E47','#000000','#464646'] },
            { n: 'Spiced mocha', c: ['#7E5F4C','#D47E30','#F5F5DD','#6D3B08'] },
            { n: 'Charming seaside', c: ['#B4EBF0','#85D2DC','#B6F1D1','#C9FDF1'] },
            { n: 'Calm blue', c: ['#91D4FF','#58BBFF','#77B2D4','#517992'] },
            { n: 'Beachfront views', c: ['#EDE9D0','#6F642E','#DCD1EF','#ACBEEC'] },
            { n: 'Under the moonlight', c: ['#CACCFD','#A4A3CD','#5D5C98','#282866'] },
            { n: 'Lavender lullaby', c: ['#B7C7E9','#9EF0FE','#A4A5F5','#8E6FCD'] },
            { n: 'Minty fresh', c: ['#99FBCC','#C0FFEC','#80CFA8','#558B71'] },
            { n: 'Retro calm', c: ['#81D8CF','#D99D82','#D6D882','#AE84DA'] },
            { n: 'Siltstone', c: ['#CBBE94','#FFF5B8','#FFB170','#CCA35B'] },
            { n: 'Emerald odyssey', c: ['#006851','#71E6CB','#3EBB9E','#0B3E31'], f: true },
            { n: 'Ocean tide', c: ['#01D2D1','#4152D6','#00ADAE','#005C5C'] },
            { n: 'Peach skyline', c: ['#FFDBB9','#BADCFF','#B9FFF5','#496580'] },
            { n: 'Mountain mist', c: ['#7B8DA1','#B0C4DD','#01796E','#5A5A5A'] },
            { n: 'Morning dew', c: ['#B7EFEE','#ADEBB2','#C4C4C4','#D3D3D3'] },
            { n: 'Frozen lake', c: ['#7B8DA1','#ADD9E6','#FFF9F9','#010080'] },
            { n: 'Olive grove', c: ['#8C8C1A','#228C22','#636B2F','#F1F0EE'] },
            { n: 'Coastal morning', c: ['#9DCC80','#89D0EF','#F5F5DD','#82C8E4'] },
            { n: 'Eucalyptus grove', c: ['#B9B494','#898989','#F1F0EE','#4B6E48'] },
            { n: 'Soft spring', c: ['#6395EC','#90B9D5','#89CFAA','#85DECC'] },
            { n: 'Autumn leaves', c: ['#FFB345','#DB9B3B','#B37E2E','#61441A'] },
            { n: 'Winter chill', c: ['#B7E4EA','#94B1B5','#507D82','#0B2E32'] },
            { n: 'Spring energy', c: ['#89F338','#FFFC30','#4EE1C9','#00BF33'] },
            { n: 'Pumpkin spice season', c: ['#BD5203','#8A4C1D','#544822','#322215'] },
            { n: 'Island oasis', c: ['#CCFF03','#FFF27F','#9DE15A','#FFAE26'] },
            { n: 'Autumn orchard', c: ['#985791','#DAA522','#2D6F3F','#660032'] },
            { n: 'Tropical rainforest', c: ['#61CE85','#7E8B53','#4E7943','#71AA35'] },
            { n: 'Wildflower meadow', c: ['#FBF9EA','#FDB814','#82C8E4','#7BFC01'] },
            { n: 'Harvest moon', c: ['#8C1936','#FFCE1B','#A62A2A','#BF5104'], f: true },
            { n: 'Winter berry', c: ['#9A2235','#2D6F3F','#ADD9E6','#FFFFFF'] },
            { n: 'Summer breeze', c: ['#FFED4D','#F88379','#82C8E4','#E7D8C5'] }
        ];

        // ---------- Color math helpers ----------
        function hexToHsl(hex) {
            hex = hex.replace('#', '');
            const r = parseInt(hex.substring(0, 2), 16) / 255;
            const g = parseInt(hex.substring(2, 4), 16) / 255;
            const b = parseInt(hex.substring(4, 6), 16) / 255;
            const max = Math.max(r, g, b), min = Math.min(r, g, b);
            let h = 0, s = 0;
            const l = (max + min) / 2;
            if (max !== min) {
                const d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch (max) {
                    case r: h = ((g - b) / d + (g < b ? 6 : 0)); break;
                    case g: h = ((b - r) / d + 2); break;
                    case b: h = ((r - g) / d + 4); break;
                }
                h *= 60;
            }
            return { h, s, l };
        }

        function hslToHex(h, s, l) {
            h = ((h % 360) + 360) % 360;
            const c = (1 - Math.abs(2 * l - 1)) * s;
            const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
            const m = l - c / 2;
            let r = 0, g = 0, b = 0;
            if (h < 60)       { r = c; g = x; }
            else if (h < 120) { r = x; g = c; }
            else if (h < 180) { g = c; b = x; }
            else if (h < 240) { g = x; b = c; }
            else if (h < 300) { r = x; b = c; }
            else              { r = c; b = x; }
            const toHex = v => Math.round((v + m) * 255).toString(16).padStart(2, '0');
            return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
        }

        function complementFor(colors) {
            let base = hexToHsl(colors[0]);
            colors.forEach(c => {
                const hsl = hexToHsl(c);
                if (hsl.s > base.s) base = hsl;
            });
            const s = Math.min(Math.max(base.s * 0.7, 0.25), 0.85);
            const l = Math.min(Math.max(base.l < 0.5 ? base.l + 0.15 : base.l - 0.15, 0.3), 0.7);
            return hslToHex(base.h + 180, s, l);
        }

        function deriveBg(colors) {
            // Find the palette's lightest color and tint the paper with its hue.
            let lightest = hexToHsl(colors[0]);
            colors.forEach(c => {
                const hsl = hexToHsl(c);
                if (hsl.l > lightest.l) lightest = hsl;
            });
            // Warm hues get a touch more tint than cool ones so the paper
            // reads as cream rather than gray; lightness pinned near white.
            const isWarm = (lightest.h <= 70 || lightest.h >= 330);
            const sat = Math.min(lightest.s, isWarm ? 0.20 : 0.14);
            return hslToHex(lightest.h, sat, 0.972);
        }

        // Extension colors: shade variations of the 4 base colors. They
        // only enter the rotation when a piece uses MORE than 5 routes,
        // so small pieces stay strictly on-palette.
        function shadeVariant(hex) {
            const { h, s, l } = hexToHsl(hex);
            const nl = l > 0.55 ? Math.max(l - 0.24, 0.16) : Math.min(l + 0.24, 0.86);
            const ns = Math.min(Math.max(s * 0.9, 0.12), 0.9);
            return hslToHex(h, ns, nl);
        }

        // Blend two hexes in RGB — used to grow palettes with tasteful,
        // in-gamut additions that read as belonging to the set.
        function mixHex(a, b, t) {
            const pa = a.replace('#', ''), pb = b.replace('#', '');
            const ra = parseInt(pa.slice(0,2),16), ga = parseInt(pa.slice(2,4),16), ba = parseInt(pa.slice(4,6),16);
            const rb = parseInt(pb.slice(0,2),16), gb = parseInt(pb.slice(2,4),16), bb = parseInt(pb.slice(4,6),16);
            const h = v => Math.round(v).toString(16).padStart(2, '0');
            return ('#' + h(ra+(rb-ra)*t) + h(ga+(gb-ga)*t) + h(ba+(bb-ba)*t)).toUpperCase();
        }

        // Turn a library entry into the runtime palette:
        //   colors   → the 5 swatches shown in the picker & color dock
        //   extended → up to 4 more, entered only when a piece has >5 routes
        // A palette may ship with more than 5 colors (e.g. a 9-color set) or
        // an explicit `x` extension list; those feed the extension pool first.
        // Remaining slots are filled with midpoint blends of adjacent display
        // colors (tasteful, on-palette), then shade variants as a last resort.
        // Palettes shorter than 5 are padded with a derived complement.
        function expandPalette(entry) {
            const display = entry.c.slice(0, 5);
            while (display.length < 5) display.push(complementFor(display));

            const reserve = (entry.x || []).concat(entry.c.slice(5));  // shipped extras
            const extended = [];
            for (const c of reserve) if (extended.length < 4) extended.push(String(c).toUpperCase());
            for (let i = 0; i < display.length - 1 && extended.length < 4; i++) {
                extended.push(mixHex(display[i], display[i + 1], 0.5));
            }
            let k = 0;
            while (extended.length < 4) { extended.push(shadeVariant(display[k % display.length])); k++; }

            return { name: entry.n, colors: display, extended: extended, autoBg: deriveBg(display), fav: !!entry.fav };
        }

        // ---------- Palette + background state ----------
        const EXPANDED_PALETTES = PALETTE_LIBRARY.map(expandPalette);
        let activePalette = EXPANDED_PALETTES[0];
        const CANVAS_DEFAULT_BG = '#FFFFFF';  // blank paper until art exists
        let bgOverride = null;                // user-picked background, if any
        let artGenerated = false;

        // Background rule:
        //   user override (deliberate) > palette auto bg (once art exists) > blank paper
        function resolveBg(palette) {
            palette = palette || activePalette;
            if (bgOverride) return bgOverride;
            return artGenerated ? palette.autoBg : CANVAS_DEFAULT_BG;
        }

        function updateBgControl() {
            bgColorInput.value = resolveBg();
            bgResetButton.style.display = bgOverride ? 'inline-block' : 'none';
        }

        function showModal(message) {
            modalMessageText.textContent = message;
            messageModal.style.display = 'flex';
        }
        modalCloseButton.addEventListener('click', () => { messageModal.style.display = 'none'; });

        // ---------- Debug / error surfacing ----------
        // Nothing is allowed to fail silently. Every pipeline step logs
        // here; any JS error pops the panel open automatically.
        const BUILD = (window.__BUILD__ && window.__BUILD__.html) || 'dev';
        const debugPanel = document.getElementById('debugPanel');
        const debugLog = document.getElementById('debugLog');
        document.getElementById('debugCloseButton').addEventListener('click', () => debugPanel.classList.remove('open'));
        function dbg(msg, isError) {
            const line = document.createElement('div');
            if (isError) line.className = 'dbg-err';
            line.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
            debugLog.appendChild(line);
            debugPanel.scrollTop = debugPanel.scrollHeight;
            (isError ? console.error : console.log)('[GPXS]', msg);
            if (isError) debugPanel.classList.add('open');
        }
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
                e.preventDefault();
                debugPanel.classList.toggle('open');
            }
        });
        window.onerror = function(msg, src, line, col) { dbg(`JS error: ${msg} (line ${line}:${col})`, true); };
        window.addEventListener('unhandledrejection', (e) => {
            dbg(`Unhandled rejection: ${(e.reason && e.reason.message) || e.reason}`, true);
        });

        // ---------- Loaded file management ----------
        // Practical ceiling on how many routes one piece can hold. Beyond
        // this the layout grid subdivides so far that individual routes stop
        // reading as distinct marks.
        const MAX_ROUTES = 35;
        let loadedFiles = [];
        const routeSlotsLeft = () => Math.max(0, MAX_ROUTES - loadedFiles.length);

        // The old "Create Your Art" button is gone — art is generated the
        // moment routes arrive. What's left is a reshuffle, which re-rolls
        // the layout and colour assignment for the routes already loaded.
        function updateGenerateState() {
            const hasFiles = loadedFiles.length > 0;
            // A cold-restored session has the artwork but not the source GPX, so
            // reshuffle can't re-read the files — keep it disabled until re-upload.
            const restoredNoSource = (typeof absRestored !== 'undefined') && absRestored;
            reshuffleButton.disabled = !hasFiles || generating || restoredNoSource;
            reshuffleButton.title = restoredNoSource
                ? 'Re-upload a route to reshuffle — a restored session keeps the artwork but not the original GPX file'
                : (hasFiles ? 'Re-roll the layout for these routes' : 'Load routes to start');
        }
        // kept under the old name so existing call sites keep working
        function updateDrawButtonState() { updateGenerateState(); }

        // ============================================================
        // ROUTES PANEL — an Illustrator-style layer list for loaded routes.
        //
        // Rows link to artboard shapes through a stable per-file `routeUid`
        // rather than the filename. Filenames are not unique (two "Morning
        // Run" exports collide), and the old name-matching silently dropped
        // routes; the uid is minted once when a file is loaded and stamped
        // onto every fabric path generated from it.
        // ============================================================
        let routeUidCounter = 0;

        function ensureRouteUid(file) {
            if (!file.routeUid) file.routeUid = 'rt' + (++routeUidCounter);
            return file.routeUid;
        }
        function fileByUid(uid) {
            return loadedFiles.find(f => f.routeUid === uid) || null;
        }
        function routeLabel(file) {
            return file.displayName || file.name;
        }
        // Every fabric path generated from a given file.
        function shapesForUid(uid) {
            if (!fabricCanvas || !uid) return [];
            return fabricCanvas.getObjects().filter(o => o.isPath && o.routeUid === uid);
        }

        // ---------- Route metadata ----------
        // Strava imports arrive with server-computed stats already attached.
        // Plain GPX uploads get parsed once, in the background, so the list
        // can show a thumbnail and real distance/ascent before the art is
        // ever generated.
        const R_EARTH_M = 6371000;
        function haversineM(a, b) {
            const toRad = d => d * Math.PI / 180;
            const dLat = toRad(b[1] - a[1]);
            const dLon = toRad(b[0] - a[0]);
            const la1 = toRad(a[1]), la2 = toRad(b[1]);
            const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
            return 2 * R_EARTH_M * Math.asin(Math.min(1, Math.sqrt(h)));
        }
        function downsample(points, target) {
            if (points.length <= target) return points;
            const step = Math.ceil(points.length / target);
            const out = points.filter((_, i) => i % step === 0);
            if (out[out.length - 1] !== points[points.length - 1]) out.push(points[points.length - 1]);
            return out;
        }

        // Parse an uploaded GPX once to derive stats + a thumbnail polyline.
        // Failures are non-fatal: the row still renders, just without stats.
        async function hydrateRoute(file) {
            if (file.meta || file.metaPending) return;
            file.metaPending = true;
            try {
                const segments = extractSegments(await parseGpxData(await readFileAsText(file)));
                if (segments.length === 0) throw new Error('no drawable segments');
                const all = segments.flat();
                let distM = 0;
                for (const seg of segments) {
                    for (let i = 1; i < seg.length; i++) distM += haversineM(seg[i - 1], seg[i]);
                }
                file.meta = {
                    thumbPoints: downsample(all, 90),
                    segments: segments.length,
                    points: all.length,
                    distKm: distM / 1000
                };
            } catch (e) {
                file.meta = { error: e.message };
                dbg(`stats unavailable for ${routeLabel(file)}: ${e.message}`);
            } finally {
                file.metaPending = false;
                renderRouteList();
                if (selectedRouteUid === file.routeUid) renderRouteStats();
            }
        }

        // ---------- Row rendering ----------
        const ICON_EYE = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1.5 8S4 3.5 8 3.5 14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8Z"/><circle cx="8" cy="8" r="2"/></svg>';
        const ICON_EYE_OFF = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6.2 4.1A6.7 6.7 0 0 1 8 3.9c4 0 6.5 4.1 6.5 4.1a12 12 0 0 1-2 2.4M3.6 5.6A12 12 0 0 0 1.5 8s2.5 4.1 6.5 4.1c.8 0 1.5-.1 2.2-.4"/><path d="M2.5 2.5l11 11"/></svg>';
        const ICON_X = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg>';

        // Colour the row miniature with the shape's actual fill, so the list
        // stays in sync with whatever the colour dock has done to the art.
        function routeSwatchColor(file) {
            const shapes = shapesForUid(file.routeUid);
            for (const s of shapes) {
                const c = s.fillOn ? (s.fillColor || s.fillBase) : (s.strokeColor || s.strokeBase);
                if (c) return c;
            }
            return 'var(--ink-3)';
        }

        function rowThumbHtml(file) {
            const pts = (file.meta && file.meta.thumbPoints) || file.thumbPoints;
            if (!pts || pts.length < 2) return '';
            const poly = pointsToThumbPolyline(pts, 34, 26, 4);
            return `<svg viewBox="0 0 34 26"><polyline points="${poly}" stroke="${routeSwatchColor(file)}"/></svg>`;
        }

        function rowMetaText(file) {
            if (file.stravaMeta) {
                const m = file.stravaMeta;
                return [m.dist, m.date].filter(Boolean).join(' · ');
            }
            if (file.meta && file.meta.distKm) return `${file.meta.distKm.toFixed(1)} km`;
            if (file.metaPending) return 'reading…';
            if (file.meta && file.meta.error) return 'no route data';
            return file.name.replace(/\.gpx$/i, '');
        }

        function renderRouteList() {
            if (typeof saveAbsSoon === 'function') saveAbsSoon();   // persist add/remove/hide too
            const q = (routeSearch.value || '').trim().toLowerCase();
            routeCount.textContent = `${loadedFiles.length}/${MAX_ROUTES}`;
            routeCount.classList.toggle('full', loadedFiles.length >= MAX_ROUTES);
            routeCount.title = loadedFiles.length >= MAX_ROUTES
                ? `Route limit reached (${MAX_ROUTES})`
                : `${routeSlotsLeft()} more route${routeSlotsLeft() === 1 ? '' : 's'} can be added`;
            fileInputLabel.textContent = loadedFiles.length > 0 ? '+ Add GPX' : 'Upload GPX';
            routeList.innerHTML = '';

            if (loadedFiles.length === 0) {
                routeList.innerHTML = '<div class="routes-empty">No routes yet.<br>Upload a GPX or connect Strava.</div>';
                updateDrawButtonState();
                return;
            }

            const shown = q
                ? loadedFiles.filter(f => routeLabel(f).toLowerCase().includes(q))
                : loadedFiles;

            if (shown.length === 0) {
                routeList.innerHTML = `<div class="routes-empty">Nothing matches &ldquo;${escapeXml(q)}&rdquo;.</div>`;
                updateDrawButtonState();
                return;
            }

            shown.forEach(file => {
                const uid = ensureRouteUid(file);
                const label = routeLabel(file);
                const hidden = file.routeHidden === true;

                const row = document.createElement('div');
                row.className = 'route-row'
                    + (selectedRouteUid === uid ? ' selected' : '')
                    + (hidden ? ' route-hidden' : '');
                row.dataset.uid = uid;
                row.setAttribute('role', 'button');
                row.setAttribute('tabindex', '0');
                row.title = label;

                const thumb = rowThumbHtml(file);
                row.innerHTML =
                    `<span class="row-thumb">${thumb}</span>
                     <span class="row-text">
                        <span class="row-name"></span>
                        <span class="row-meta">
                            ${file.gpxSource === 'strava' ? '<span class="row-src-dot" title="From Strava"></span>' : ''}
                            <span class="row-meta-text"></span>
                        </span>
                     </span>
                     <span class="row-actions">
                        <button class="icon-btn act-eye${hidden ? ' pinned' : ''}" title="${hidden ? 'Show on artboard' : 'Hide on artboard'}">${hidden ? ICON_EYE_OFF : ICON_EYE}</button>
                        <button class="icon-btn act-remove" title="Remove route">${ICON_X}</button>
                     </span>`;
                // textContent (not innerHTML) so activity names can't inject markup
                row.querySelector('.row-name').textContent = label;
                row.querySelector('.row-meta-text').textContent = rowMetaText(file);

                row.addEventListener('click', (e) => {
                    if (e.target.closest('.icon-btn')) return;
                    selectRouteByUid(selectedRouteUid === uid ? null : uid);
                });
                row.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); row.click(); }
                });
                row.querySelector('.act-eye').addEventListener('click', () => toggleRouteVisibility(file));
                row.querySelector('.act-remove').addEventListener('click', () => removeRoute(file));

                routeList.appendChild(row);
            });

            updateDrawButtonState();
        }

        // Kept as an alias so every existing call site still works.
        function renderFileChips() { renderRouteList(); }

        // Palette changes fire on every hover-preview, so recolouring the row
        // miniatures repaints the existing polylines in place rather than
        // rebuilding the list (which would flicker and drop hover state).
        function refreshRouteSwatches() {
            routeList.querySelectorAll('.route-row').forEach(row => {
                const file = fileByUid(row.dataset.uid);
                const line = row.querySelector('.row-thumb polyline');
                if (file && line) line.setAttribute('stroke', routeSwatchColor(file));
            });
        }

        routeSearch.addEventListener('input', renderRouteList);

        function toggleRouteVisibility(file) {
            file.routeHidden = !file.routeHidden;
            const shapes = shapesForUid(file.routeUid);
            shapes.forEach(o => {
                o.visible = !file.routeHidden;
                o.selectable = !file.routeHidden && isAdvancedEditingActive;
                o.evented = !file.routeHidden && isAdvancedEditingActive;
            });
            if (file.routeHidden && selectedRouteUid === file.routeUid) selectRouteByUid(null);
            if (fabricCanvas) fabricCanvas.renderAll();
            renderRouteList();
        }

        function removeRoute(file) {
            const idx = loadedFiles.indexOf(file);
            if (idx !== -1) loadedFiles.splice(idx, 1);
            if (selectedRouteUid === file.routeUid) selectRouteByUid(null);
            removeShapesForFile(file);
            renderRouteList();
            refreshDashSelectionState();
        }

        // ---------- Selection: list row <-> artboard shape ----------
        let selectedRouteUid = null;
        let syncingSelection = false;   // guards the two-way binding from looping

        function selectRouteByUid(uid) {
            if (syncingSelection) return;
            selectedRouteUid = uid;

            if (fabricCanvas) {
                syncingSelection = true;
                try {
                    if (!uid) {
                        fabricCanvas.discardActiveObject();
                    } else {
                        const shapes = shapesForUid(uid).filter(o => o.visible !== false);
                        if (shapes.length === 1) {
                            fabricCanvas.setActiveObject(shapes[0]);
                        } else if (shapes.length > 1) {
                            // one GPX file can hold several tracks/segments —
                            // selecting the name selects all of its shapes
                            fabricCanvas.setActiveObject(new fabric.ActiveSelection(shapes, { canvas: fabricCanvas }));
                        } else {
                            fabricCanvas.discardActiveObject();
                        }
                    }
                    fabricCanvas.requestRenderAll();
                } finally {
                    syncingSelection = false;
                }
            }

            highlightSelectedRow();
            renderRouteStats();
            // single shape -> per-route sliders + colour dock follow along
            const active = fabricCanvas && fabricCanvas.getActiveObject();
            updateControlsForObject(active && active.isPath ? active : null);
            syncGlobalToggles();   // Fill/Outline buttons reflect the selected route
        }

        // Called from fabric's own selection events, so clicking a shape on
        // the artboard lights up its row in the list.
        function syncSelectionFromCanvas(objs) {
            if (syncingSelection) return;
            const uids = new Set((objs || []).filter(o => o && o.isPath).map(o => o.routeUid).filter(Boolean));
            selectedRouteUid = uids.size === 1 ? [...uids][0] : null;
            highlightSelectedRow();
            renderRouteStats();
            syncGlobalToggles();   // Fill/Outline buttons reflect the clicked route
        }

        function highlightSelectedRow() {
            routeList.querySelectorAll('.route-row').forEach(row => {
                const on = row.dataset.uid === selectedRouteUid;
                row.classList.toggle('selected', on);
                if (on) row.scrollIntoView({ block: 'nearest' });
            });
        }

        // ---------- Selected-route stats ----------
        function statCell(k, v, u) {
            return `<div class="stat"><div class="k">${k}</div><div class="v">${v}${u ? `<span class="u">${u}</span>` : ''}</div></div>`;
        }

        function renderRouteStats() {
            const file = selectedRouteUid ? fileByUid(selectedRouteUid) : null;
            if (!file) { statsCard.classList.remove('show'); return; }
            statsCard.classList.add('show');

            statsHeading.textContent = 'Activity';
            statsTitle.textContent = routeLabel(file);

            const sm = file.stravaMeta;
            const meta = file.meta || {};

            statsSub.textContent = sm
                ? [sm.type, sm.date].filter(Boolean).join(' · ')
                : (meta.error ? 'GPX · unreadable' : 'GPX upload');

            const cells = [];
            if (sm) {
                // Strava's own numbers win — they account for pauses and
                // barometric elevation, which raw lat/lon can't reproduce.
                if (sm.dist) cells.push(statCell('Distance', sm.dist.replace(/\s*km$/, ''), 'km'));
                if (sm.elev) cells.push(statCell('Ascent', sm.elev.replace(/\s*m$/, ''), 'm'));
                if (sm.time) cells.push(statCell('Time', sm.time, ''));
            } else if (meta.distKm) {
                cells.push(statCell('Distance', meta.distKm.toFixed(1), 'km'));
            }
            if (meta.points) cells.push(statCell('Points', meta.points.toLocaleString(), ''));
            if (meta.segments > 1) cells.push(statCell('Tracks', meta.segments, ''));
            const onCanvas = shapesForUid(file.routeUid).length;
            if (onCanvas) cells.push(statCell('Shapes', onCanvas, ''));

            statsGrid.innerHTML = cells.length
                ? cells.join('')
                : `<div class="stats-pending">${file.metaPending ? 'Reading route…' : 'No stats available'}</div>`;
        }

        fileInput.addEventListener('change', () => {
            // A restored session has no source GPX, so it can't be extended with
            // new routes — a fresh upload starts a new composition.
            if (typeof absRestored !== 'undefined' && absRestored) {
                loadedFiles = [];
                if (fabricCanvas) { fabricCanvas.getObjects().filter(o => o.isPath).forEach(o => fabricCanvas.remove(o)); fabricCanvas.renderAll(); }
                absRestored = false; clearAbs();
            }
            const newFiles = Array.from(fileInput.files);
            let addedCount = 0, noRoom = 0;
            newFiles.forEach(file => {
                const isDupe = loadedFiles.some(f => f.name === file.name && f.size === file.size);
                if (isDupe) return;
                if (loadedFiles.length >= MAX_ROUTES) { noRoom++; return; }
                ensureRouteUid(file);
                loadedFiles.push(file);
                hydrateRoute(file);
                addedCount++;
            });
            fileInput.value = '';
            renderRouteList();
            if (noRoom > 0) {
                showModal(`${MAX_ROUTES} routes is the limit for one piece, so ${noRoom} file${noRoom === 1 ? ' was' : 's were'} left out. Remove a route to make room.`);
            }
            // No separate "create" step any more — uploading is the action.
            if (addedCount > 0) addRoutesToArt('gpx upload');
        });

        clearFilesButton.addEventListener('click', () => {
            loadedFiles = [];
            if (fabricCanvas) {
                fabricCanvas.getObjects().filter(o => o.isPath).forEach(o => fabricCanvas.remove(o));
                fabricCanvas.renderAll();
            }
            if (typeof absRestored !== 'undefined') absRestored = false;
            if (typeof clearAbs === 'function') clearAbs();   // wipe the saved session
            artGenerated = false;
            selectRouteByUid(null);
            clearSelection();
            renderRouteList();
            refreshDashSelectionState();
        });

        // deleting a route also deletes its shapes off the artboard
        function removeShapesForFile(file) {
            if (!fabricCanvas) return;
            const doomed = shapesForUid(file.routeUid);
            if (doomed.length === 0) return;
            const active = fabricCanvas.getActiveObject();
            if (active && doomed.includes(active)) clearSelection();
            doomed.forEach(o => fabricCanvas.remove(o));
            fabricCanvas.renderAll();
            dbg(`removed ${doomed.length} shape(s) for ${routeLabel(file)}`);
        }

        // ---------- Palette picker UI ----------
        function renderStrip(container, colors) {
            container.innerHTML = '';
            colors.forEach(c => {
                const span = document.createElement('span');
                span.style.backgroundColor = c;
                span.title = c;
                container.appendChild(span);
            });
        }

        function updatePaletteButton() {
            currentPaletteName.textContent = activePalette.name;
            renderStrip(currentPaletteStrip, activePalette.colors);
        }

        function buildPaletteRow(palette) {
            const row = document.createElement('div');
            row.className = 'palette-row';
            const name = document.createElement('div');
            name.className = 'palette-name';
            name.textContent = palette.name;
            const strip = document.createElement('div');
            strip.className = 'palette-strip';
            renderStrip(strip, palette.colors);
            row.appendChild(name);
            row.appendChild(strip);
            row.addEventListener('mouseenter', () => previewPalette(palette));
            row.addEventListener('click', () => commitPalette(palette));
            return row;
        }

        function populatePalettePicker() {
            // Favorites stay pinned at the top; EVERY other palette goes under
            // "Featured" so the whole library is browsable by scrolling (like Topo).
            favoritesList.innerHTML = '';
            featuredList.innerHTML = '';
            EXPANDED_PALETTES.forEach((palette, i) => {
                const meta = PALETTE_LIBRARY[i];
                if (meta.fav) favoritesList.appendChild(buildPaletteRow(palette));
                else          featuredList.appendChild(buildPaletteRow(palette));
            });
            updatePaletteButton();
        }

        function paintPalette(palette) {
            if (!fabricCanvas) return;
            fabricCanvas.backgroundColor = resolveBg(palette);

            const pathsOnCanvas = fabricCanvas.getObjects().filter(obj => obj.isPath);
            pathsOnCanvas.sort((a, b) => (a.originalFileOrder || 0) - (b.originalFileOrder || 0));

            const distinctFiles = new Set(pathsOnCanvas.map(p => p.originalFileOrder)).size;
            const pool = distinctFiles > palette.colors.length
                ? palette.colors.concat(palette.extended)
                : palette.colors;

            let colorIdx = 0;
            const fileOrderToColorMap = {};
            const fileOrderToIdx = {};
            pathsOnCanvas.forEach(pathObj => {
                let color, idx;
                if (typeof pathObj.originalFileOrder !== 'undefined') {
                    if (!(pathObj.originalFileOrder in fileOrderToColorMap)) {
                        fileOrderToColorMap[pathObj.originalFileOrder] = pool[colorIdx % pool.length];
                        fileOrderToIdx[pathObj.originalFileOrder] = colorIdx % pool.length;
                        colorIdx++;
                    }
                    color = fileOrderToColorMap[pathObj.originalFileOrder];
                    idx = fileOrderToIdx[pathObj.originalFileOrder];
                } else {
                    color = pool[colorIdx % pool.length];
                    idx = colorIdx % pool.length;
                    colorIdx++;
                }
                ensureAppearance(pathObj);
                pathObj.paletteIndex = idx;
                pathObj.paletteBase = color;
                pathObj.paletteP = 0.5;
                if (pathObj.fillOn)   { pathObj.fillColor = color; pathObj.fillBase = color; pathObj.fillP = 0.5; }
                if (pathObj.strokeOn) {
                    // When both channels are on, keep the outline distinct from the fill.
                    const sc = pathObj.fillOn ? pickDistinctColor(color) : color;
                    pathObj.strokeColor = sc; pathObj.strokeBase = sc; pathObj.strokeP = 0.5;
                }
                // safety: if a path somehow has no active channel, fill it
                if (!pathObj.fillOn && !pathObj.strokeOn) { pathObj.fillOn = true; pathObj.fillColor = color; pathObj.fillBase = color; pathObj.fillP = 0.5; }
                applyAppearance(pathObj);
            });
            fabricCanvas.renderAll();
            if (dockMode === 'palette') renderDock('palette'); // keep the band in sync
            refreshRouteSwatches();                            // and the row miniatures
        }

        function previewPalette(palette) {
            paintPalette(palette);
            if (!bgOverride) bgColorInput.value = resolveBg(palette);
        }

        function commitPalette(palette) {
            activePalette = palette;
            paintPalette(palette);
            updatePaletteButton();
            updateBgControl();
            paletteDropdown.classList.remove('show-dropdown');
            pushHistory();
        }

        // Opening the app on the same palette every time makes it feel static.
        // Start on a random favourite instead; falls back to the whole library
        // if nothing is flagged `fav`.
        function randomFavoritePalette() {
            const favs = EXPANDED_PALETTES.filter(p => p.fav);
            const pool = favs.length ? favs : EXPANDED_PALETTES;
            return pool[Math.floor(Math.random() * pool.length)];
        }

        function surpriseRandomPalette() {
            const random = EXPANDED_PALETTES[Math.floor(Math.random() * EXPANDED_PALETTES.length)];
            commitPalette(random);
        }

        paletteButton.addEventListener('click', (event) => {
            event.stopPropagation();
            paletteDropdown.classList.toggle('show-dropdown');
        });
        paletteDropdown.addEventListener('mouseleave', () => {
            paintPalette(activePalette);
            updateBgControl();
        });
        surpriseButton.addEventListener('click', (event) => {
            event.stopPropagation();
            surpriseRandomPalette();
        });
        dicePaletteButton.addEventListener('click', (event) => {
            event.stopPropagation();
            surpriseRandomPalette();
        });

        // ---------- Background controls ----------
        bgColorInput.addEventListener('input', () => {
            bgOverride = bgColorInput.value;
            bgResetButton.style.display = 'inline-block';
            if (fabricCanvas) {
                fabricCanvas.backgroundColor = bgOverride;
                fabricCanvas.renderAll();
            }
        });

        bgResetButton.addEventListener('click', () => {
            bgOverride = null;
            updateBgControl();
            if (fabricCanvas) {
                fabricCanvas.backgroundColor = resolveBg();
                fabricCanvas.renderAll();
            }
        });

        // ============================================================
        //  APPEARANCE MODEL  (Illustrator-style, per route object)
        //  Each path carries its own appearance:
        //    fillOn   (bool) + fillColor
        //    strokeOn (bool) + strokeColor + strokeW (base px weight)
        //    opacity  (0..1, fabric-native)
        //  applyAppearance() is the single source of truth that renders
        //  those props onto the fabric object. Stroke weight is divided
        //  by the object's scale so it stays visually constant when the
        //  shape is scaled or rotated.
        // ============================================================
        const SPAWN_SCALE = 1.5;   // routes generate 1.5x their fit-to-slot size
        const MAX_REL_SCALE = 4;   // scale slider ceiling (400%)
        const DEFAULT_STROKE_W = 2;

        // ============================================================
        //  UNDO / REDO  (Phase 2)
        //  A capped stack of serialized canvas snapshots. Custom
        //  appearance props are serialized alongside the fabric state so
        //  fill/stroke/weight/opacity survive an undo. Debounced variant
        //  collapses rapid slider drags into a single history entry.
        // ============================================================
        const HISTORY_MAX = 30;
        const HISTORY_PROPS = ['isPath', 'fillOn', 'strokeOn', 'fillColor',
            'strokeColor', 'strokeW', 'opacity', 'originalFileOrder',
            'fileOrigin', 'id', 'baseScale', '_appInit', 'selectable', 'evented',
            'fillBase', 'fillP', 'strokeBase', 'strokeP',
            'paletteIndex', 'paletteBase', 'paletteP',
            // routeUid links each shape back to its row in the Routes panel;
            // omitting it here would sever that link on the first undo.
            'routeUid', 'visible'];
        let historyStack = [];
        let historyIndex = -1;
        let historyDebounceTimer = null;
        let suppressHistory = false; // guard so restores don't re-record

        let pushHistory = function () {
            if (!fabricCanvas || suppressHistory) return;
            // Snapshot the art AND the canvas geometry/orientation so undo/redo
            // stays consistent across orientation flips and ratio changes.
            const snap = JSON.stringify({
                portrait: isPortrait,
                w: fabricCanvas.width,
                h: fabricCanvas.height,
                canvas: fabricCanvas.toJSON(HISTORY_PROPS)
            });
            if (historyStack[historyIndex] === snap) return; // no-op change
            historyStack = historyStack.slice(0, historyIndex + 1); // drop redo tail
            historyStack.push(snap);
            if (historyStack.length > HISTORY_MAX) historyStack.shift();
            historyIndex = historyStack.length - 1;
            if(window._updateAbsHistBar) window._updateAbsHistBar();
            if(typeof saveAbsSoon === 'function') saveAbsSoon();   // autosave the session
        };
        let pushHistoryDebounced = function () {
            clearTimeout(historyDebounceTimer);
            historyDebounceTimer = setTimeout(() => pushHistory(), 350);
        };
        function resetHistory() {
            historyStack = [];
            historyIndex = -1;
            pushHistory(); // seed with current state
        }
        function restoreHistory(snap) {
            if (!fabricCanvas || snap == null) return;
            let state;
            try { state = JSON.parse(snap); } catch (e) { return; }
            suppressHistory = true;
            // restore orientation + internal dimensions before loading art
            if (typeof state.portrait === 'boolean') isPortrait = state.portrait;
            if (state.w && state.h) {
                fabricCanvas.setDimensions({ width: state.w, height: state.h }, { backstoreOnly: true });
            }
            fabricCanvas.loadFromJSON(state.canvas, () => {
                fabricCanvas.getObjects().forEach(o => {
                    if (o.isPath) {
                        const interactive = o.visible !== false && isAdvancedEditingActive;
                        o.selectable = interactive;
                        o.evented = interactive;
                        o.set({
                            borderColor: fabric.Object.prototype.borderColor,
                            borderDashArray: null,
                            cornerColor: fabric.Object.prototype.cornerColor,
                            cornerSize: fabric.Object.prototype.cornerSize,
                            transparentCorners: true
                        });
                        o.setCoords();
                    }
                });
                fitCanvasToViewport(); // re-fit display in case dimensions changed
                fabricCanvas.calcOffset();
                fabricCanvas.renderAll();
                updateControlsForObject(null);
                selectedRouteUid = null;
                renderRouteList();   // thumbnails re-read colours from the restored shapes
                renderRouteStats();
                suppressHistory = false;
            });
        }
        function undo() {
            if (historyIndex > 0) {
                historyIndex--;
                restoreHistory(historyStack[historyIndex]);
                dbg(`undo -> state ${historyIndex + 1}/${historyStack.length}`);
                updateAbsHistBar();
            }
        }
        function redo() {
            if (historyIndex < historyStack.length - 1) {
                historyIndex++;
                restoreHistory(historyStack[historyIndex]);
                dbg(`redo -> state ${historyIndex + 1}/${historyStack.length}`);
                updateAbsHistBar();
            }
        }
        // Expose for the floating undo bar
        window._absUndo = undo;
        window._absRedo = redo;
        function updateAbsHistBar(){
         const u=document.getElementById('absUndoBtn'), r=document.getElementById('absRedoBtn');
         if(u) u.disabled = historyIndex <= 0;
         if(r) r.disabled = historyIndex >= historyStack.length - 1;
         const bar=document.getElementById('absHistBar');
         if(bar) bar.classList.toggle('on', historyStack.length > 1);
        }
        window._updateAbsHistBar = updateAbsHistBar;
        // Keyboard: Cmd/Ctrl+Z = undo, Cmd/Ctrl+Shift+Z or Cmd/Ctrl+Y = redo.
        // Ignored while typing in a field so it never hijacks text input.
        document.addEventListener('keydown', (e) => {
            const t = e.target;
            if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
            if (!(e.ctrlKey || e.metaKey)) return;
            const k = e.key.toLowerCase();
            if (k === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
            else if ((k === 'z' && e.shiftKey) || k === 'y') { e.preventDefault(); redo(); }
        });

        function applyAppearance(obj) {
            if (!obj) return;
            const scale = obj.scaleX || 1;
            const sw = obj.strokeOn ? (obj.strokeW || DEFAULT_STROKE_W) : 0;
            obj.set({
                fill: obj.fillOn ? (obj.fillColor || '#000000') : '',
                stroke: obj.strokeOn ? (obj.strokeColor || '#000000') : '',
                strokeWidth: sw / scale,
                opacity: (obj.opacity == null ? 1 : obj.opacity)
            });
        }

        // Give any path the appearance model, migrating older objects
        // (which used fillMode + a single stroke color) on first touch.
        function ensureAppearance(obj) {
            if (!obj || obj._appInit) return;
            if (typeof obj.fillOn === 'undefined') {
                const wasOutline = obj.fillMode === 'outline';
                const c = (/^#[0-9a-f]{6}$/i.test(obj.stroke || '')) ? obj.stroke
                        : (/^#[0-9a-f]{6}$/i.test(obj.fill || '')) ? obj.fill : '#1B1D1C';
                obj.fillOn = !wasOutline;
                obj.strokeOn = wasOutline;
                obj.fillColor = c;
                obj.strokeColor = c;
                obj.strokeW = DEFAULT_STROKE_W;
                if (obj.opacity == null) obj.opacity = 1;
            }
            // per-channel base hue + shade position for the color dock, so a
            // dragged shade can always slide back to the pure color.
            if (typeof obj.fillBase === 'undefined')   { obj.fillBase = obj.fillColor || '#1B1D1C'; obj.fillP = 0.5; }
            if (typeof obj.strokeBase === 'undefined') { obj.strokeBase = obj.strokeColor || '#1B1D1C'; obj.strokeP = 0.5; }
            obj._appInit = true;
        }

        // ============================================================
        //  GLOBAL FILL / OUTLINE TOGGLES (toolbar)
        //  Turn fill and/or outline on for ALL routes at once. When a
        //  channel is switched on, its colour is auto-picked from the
        //  active palette and is guaranteed to differ from the other
        //  channel (fill never matches outline). Per-route fine-tuning
        //  still happens in the colour dock; these are the shortcut.
        // ============================================================
        let gFillOn = true, gOutlineOn = false;
        function absPaths() { return fabricCanvas ? fabricCanvas.getObjects().filter(o => o.isPath) : []; }
        /* Read-only snapshot of the drawn routes — for support + headless tests. */
        window.__absPaths = () => absPaths().map(o => ({
            routeUid: o.routeUid, fillColor: o.fillColor, strokeColor: o.strokeColor,
            fillOn: o.fillOn, strokeOn: o.strokeOn, paletteIndex: o.paletteIndex,
            angle: Math.round(o.angle || 0), left: Math.round(o.left || 0), top: Math.round(o.top || 0)
        }));
        function paletteColorList() {
            return (activePalette && activePalette.colors)
                ? activePalette.colors.concat(activePalette.extended || [])
                : ['#1B1D1C', '#888888'];
        }
        function pickDistinctColor(avoidHex) {
            const list = paletteColorList(), a = (avoidHex || '').toLowerCase();
            return list.find(c => (c || '').toLowerCase() !== a) || list[0] || '#888888';
        }
        function syncGlobalToggles() {
            const all = absPaths();
            // gFillOn/gOutlineOn track the whole-canvas intent (used to seed newly
            // added routes); the BUTTON state reflects the SELECTED route when one
            // is selected, so the toggles read as "this route" not "everything".
            if (all.length) { gFillOn = all.some(o => o.fillOn); gOutlineOn = all.some(o => o.strokeOn); }
            const sel = (typeof selectedRouteUid !== 'undefined' && selectedRouteUid) ? shapesForUid(selectedRouteUid) : [];
            const scope = sel.length ? sel : all;
            const fb = document.getElementById('toggleFillBtn'), ob = document.getElementById('toggleOutlineBtn');
            if (fb) fb.setAttribute('aria-pressed', scope.some(o => o.fillOn) ? 'true' : 'false');
            if (ob) ob.setAttribute('aria-pressed', scope.some(o => o.strokeOn) ? 'true' : 'false');
        }
        function setGlobalChannel(ch, on) {
            // Apply to the SELECTED route only; fall back to all routes when nothing
            // is selected (so the button still does something with no selection).
            const sel = selectedRouteUid ? shapesForUid(selectedRouteUid) : [];
            const scoped = sel.length > 0;
            const targets = scoped ? sel : absPaths();
            if (!targets.length) { syncGlobalToggles(); return; }
            // Never let both channels go off for a target — that would hide it.
            if (!on) { const anyOther = targets.some(o => ch === 'fill' ? o.strokeOn : o.fillOn); if (!anyOther) { syncGlobalToggles(); return; } }
            if (!scoped) { if (ch === 'fill') gFillOn = on; else gOutlineOn = on; }
            targets.forEach(o => {
                ensureAppearance(o);
                if (ch === 'fill') {
                    o.fillOn = on;
                    if (on && (!o.fillColor || (o.strokeOn && (o.fillColor || '').toLowerCase() === (o.strokeColor || '').toLowerCase()))) {
                        const c = pickDistinctColor(o.strokeColor); o.fillColor = c; o.fillBase = c; o.fillP = 0.5;
                    }
                } else {
                    o.strokeOn = on;
                    if (on) {
                        if (!o.strokeColor || (o.strokeColor || '').toLowerCase() === (o.fillColor || '').toLowerCase()) {
                            const c = pickDistinctColor(o.fillColor || o.paletteBase); o.strokeColor = c; o.strokeBase = c; o.strokeP = 0.5;
                        }
                        if (!o.strokeW) o.strokeW = DEFAULT_STROKE_W;
                    }
                }
                if (!o.fillOn && !o.strokeOn) { o.fillOn = true; }   // safety
                applyAppearance(o);
            });
            if (fabricCanvas) fabricCanvas.renderAll();
            refreshRouteSwatches();
            if (typeof renderDock === 'function') renderDock(dockMode, dockShapeObj, dockPickChannel);
            syncGlobalToggles();
            pushHistory();
        }
        // Enforce the current global fill/outline intent on freshly generated art.
        function applyGlobalChannels() {
            const paths = absPaths(); if (!paths.length) { syncGlobalToggles(); return; }
            paths.forEach(o => {
                ensureAppearance(o);
                if (gOutlineOn && !o.strokeOn) {
                    const c = pickDistinctColor(o.fillColor || o.paletteBase);
                    o.strokeColor = c; o.strokeBase = c; o.strokeP = 0.5; if (!o.strokeW) o.strokeW = DEFAULT_STROKE_W; o.strokeOn = true;
                }
                if (!gFillOn && o.fillOn) o.fillOn = false;
                if (!o.fillOn && !o.strokeOn) o.fillOn = true;   // safety
                applyAppearance(o);
            });
            if (fabricCanvas) fabricCanvas.renderAll();
            syncGlobalToggles();
        }
        {
            const fb = document.getElementById('toggleFillBtn'), ob = document.getElementById('toggleOutlineBtn');
            if (fb) fb.addEventListener('click', () => setGlobalChannel('fill', fb.getAttribute('aria-pressed') !== 'true'));
            if (ob) ob.addEventListener('click', () => setGlobalChannel('stroke', ob.getAttribute('aria-pressed') !== 'true'));
        }

        // ============================================================
        //  SESSION MEMORY — persist the Abstract artwork across reloads
        //  (parity with Topo). We save the rendered canvas (the art itself),
        //  the palette, background, fill/outline state, geometry, and the
        //  Routes-panel metadata. The original uploaded GPX File can't survive
        //  a reload, so a cold-restored session keeps the artwork + editing +
        //  recolour + export, but Reshuffle is disabled until a new upload.
        //  Best-effort: wrapped in try/catch (private mode / quota just skip).
        // ============================================================
        const LS_ABS = 'gpxsketch_abs_session_v1';
        let absSaveTimer = null;
        let absRestored = false;
        function absFileMeta() {
            return loadedFiles.map(f => ({
                routeUid: f.routeUid, name: f.name, displayName: f.displayName,
                gpxSource: f.gpxSource, routeHidden: f.routeHidden === true,
                originalFileOrder: f.originalFileOrder, meta: f.meta || null
            }));
        }
        function saveAbs() {
            try {
                if (!fabricCanvas || !artGenerated) return;
                const art = JSON.stringify({ portrait: isPortrait, w: fabricCanvas.width, h: fabricCanvas.height, canvas: fabricCanvas.toJSON(HISTORY_PROPS) });
                localStorage.setItem(LS_ABS, JSON.stringify({
                    v: 1, art, paletteName: activePalette && activePalette.name, bgOverride,
                    gFillOn, gOutlineOn, ratio: canvasRatio, portrait: isPortrait, files: absFileMeta()
                }));
            } catch (e) { /* best-effort */ }
        }
        function saveAbsSoon() { clearTimeout(absSaveTimer); absSaveTimer = setTimeout(saveAbs, 600); }
        function clearAbs() { try { localStorage.removeItem(LS_ABS); } catch (e) {} }
        function restoreAbs() {
            let raw; try { raw = localStorage.getItem(LS_ABS); } catch (e) { return false; }
            if (!raw) return false;
            let d; try { d = JSON.parse(raw); } catch (e) { return false; }
            if (!d || d.v !== 1 || !d.art) return false;
            let art; try { art = JSON.parse(d.art); } catch (e) { return false; }
            try {
                if (d.paletteName) { const p = EXPANDED_PALETTES.find(x => x.name === d.paletteName); if (p) activePalette = p; }
                bgOverride = d.bgOverride || null;
                if (d.ratio && d.ratio.w && d.ratio.h) canvasRatio = d.ratio;
                if (typeof d.portrait === 'boolean') isPortrait = d.portrait;
                if (typeof d.gFillOn === 'boolean') gFillOn = d.gFillOn;
                if (typeof d.gOutlineOn === 'boolean') gOutlineOn = d.gOutlineOn;
                loadedFiles = (d.files || []).map(f => ({ ...f }));
                let maxN = 0; loadedFiles.forEach(f => { const m = /^rt(\d+)$/.exec(f.routeUid || ''); if (m) maxN = Math.max(maxN, +m[1]); });
                routeUidCounter = Math.max(routeUidCounter, maxN);
                absRestored = loadedFiles.length > 0;
                suppressHistory = true;
                if (art.w && art.h) fabricCanvas.setDimensions({ width: art.w, height: art.h }, { backstoreOnly: true });
                fabricCanvas.loadFromJSON(art.canvas, () => {
                    fabricCanvas.getObjects().forEach(o => {
                        if (o.isPath) { const it = o.visible !== false && isAdvancedEditingActive; o.selectable = it; o.evented = it; o.setCoords(); }
                    });
                    artGenerated = true;
                    fitCanvasToViewport(); fabricCanvas.calcOffset(); fabricCanvas.renderAll();
                    updatePaletteButton(); updateBgControl(); syncGlobalToggles();
                    updateControlsForObject(null); selectedRouteUid = null;
                    renderRouteList(); renderRouteStats();
                    if (typeof renderDock === 'function') renderDock('palette');
                    if (absRestored && reshuffleButton) {
                        reshuffleButton.disabled = true;
                        reshuffleButton.title = 'Re-upload a route to reshuffle — a restored session keeps the artwork but not the original GPX file';
                    }
                    suppressHistory = false;
                    resetHistory();
                });
                return true;
            } catch (e) { console.warn('[ABS] restore failed:', e.message); suppressHistory = false; return false; }
        }

        function updateControlsForObject(obj) {
            const has = !!(obj && obj.isPath);
            editHint.style.display = has ? 'none' : 'block';
            scaleSlider.disabled = !has;
            rotationSlider.disabled = !has;
            strokeWeightSlider.disabled = !has;
            opacitySlider.disabled = !has;
            reflectHButton.disabled = !has;
            reflectVButton.disabled = !has;
            doneEditingButton.style.display = has ? 'block' : 'none';
            if (has) {
                ensureAppearance(obj);
                if (!obj.baseScale) obj.baseScale = obj.scaleX || 1;
                const relScale = (obj.scaleX || 1) / obj.baseScale;
                scaleSlider.value = Math.min(Math.max(relScale, 0.5), MAX_REL_SCALE);
                scaleValueDisplay.textContent = `${Math.round(relScale * 100)}%`;
                rotationSlider.value = obj.angle || 0;
                rotationValueDisplay.textContent = `${Math.round(obj.angle || 0)}°`;
                const w = obj.strokeW || DEFAULT_STROKE_W;
                strokeWeightSlider.value = Math.min(Math.max(w, 0.5), 12);
                strokeWeightValue.textContent = `${w.toFixed(1)} px`;
                const op = obj.opacity == null ? 1 : obj.opacity;
                opacitySlider.value = Math.round(op * 100);
                opacityValue.textContent = `${Math.round(op * 100)}%`;
                renderDock('shape', obj);   // color band switches to this route
            } else {
                scaleSlider.value = 1;
                scaleValueDisplay.textContent = '100%';
                rotationSlider.value = 0;
                rotationValueDisplay.textContent = '0°';
                strokeWeightSlider.value = 2;
                strokeWeightValue.textContent = '2.0 px';
                opacitySlider.value = 100;
                opacityValue.textContent = '100%';
                renderDock('palette');      // back to the palette
            }
        }

        function clearSelection() {
            if (fabricCanvas && fabricCanvas.getActiveObject()) {
                fabricCanvas.discardActiveObject();
                fabricCanvas.renderAll();
            }
            updateControlsForObject(null);
        }

        // ---------- Reflect ----------
        // Mirrors the selected route instead of rotating it, so a shape can be
        // flipped without changing its orientation on the artboard. Each path
        // flips about its own centre (originX/originY are 'center'), which is
        // what you want here — segments live in independent layout slots, so
        // flipping the bounding box of a multi-shape selection would scatter
        // them rather than mirror each mark.
        // flipX/flipY are standard fabric properties, so they already
        // round-trip through the history serializer.
        function reflectSelection(axis) {
            if (!fabricCanvas) return;
            const active = fabricCanvas.getActiveObject();
            if (!active) return;
            const targets = active.type === 'activeSelection' ? active.getObjects() : [active];
            const paths = targets.filter(o => o.isPath);
            if (paths.length === 0) return;
            const key = axis === 'x' ? 'flipX' : 'flipY';
            paths.forEach(o => { o.set(key, !o[key]); o.setCoords(); });
            fabricCanvas.renderAll();
            pushHistory();
            dbg(`reflected ${paths.length} shape(s) ${axis === 'x' ? 'horizontally' : 'vertically'}`);
        }

        reflectHButton.addEventListener('click', () => reflectSelection('x'));
        reflectVButton.addEventListener('click', () => reflectSelection('y'));

        // ---------- Per-route weight + opacity (color lives in the dock) ----------
        function withActivePath(fn) {
            const obj = fabricCanvas && fabricCanvas.getActiveObject();
            if (obj && obj.isPath) { ensureAppearance(obj); fn(obj); }
        }
        function commitAppearance(obj, record) {
            applyAppearance(obj);
            fabricCanvas.renderAll();
            if (record) pushHistoryDebounced();
        }
        strokeWeightSlider.addEventListener('input', () => withActivePath(obj => {
            obj.strokeW = parseFloat(strokeWeightSlider.value);
            strokeWeightValue.textContent = `${obj.strokeW.toFixed(1)} px`;
            commitAppearance(obj, true);
        }));
        opacitySlider.addEventListener('input', () => withActivePath(obj => {
            obj.opacity = parseInt(opacitySlider.value, 10) / 100;
            opacityValue.textContent = `${Math.round(obj.opacity * 100)}%`;
            commitAppearance(obj, true);
        }));

        // ============================================================
        //  COLOR DOCK — the single color surface
        //  Palette mode: the active palette's colors as one touching bar;
        //    drag a color to shade it (recolors the routes using it),
        //    double-click to change its hue.
        //  Shape mode: the selected route's Fill + Outline, same gestures,
        //    each with an on/off toggle.
        //  The shade is the invisible black -> color -> white line; the base
        //  hue is preserved so p=0.5 always returns the pure color.
        // ============================================================
        let dockMode = 'palette';
        let dockSlots = [];        // palette mode: [{ baseHex, p, routes:[] }]
        let dockShapeObj = null;
        let dockPickChannel = null;   // 'fill' | 'stroke' while the picker row is open

        function rampHex(baseHex, p) {
            if (!/^#[0-9a-f]{6}$/i.test(baseHex || '')) baseHex = '#888888';
            const h = baseHex.replace('#', '');
            const r = parseInt(h.slice(0,2),16), g = parseInt(h.slice(2,4),16), b = parseInt(h.slice(4,6),16);
            const c = v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2,'0');
            if (p <= 0.5) { const t = p / 0.5; return '#' + c(r*t) + c(g*t) + c(b*t); }
            const t = (p - 0.5) / 0.5;
            return '#' + c(r+(255-r)*t) + c(g+(255-g)*t) + c(b+(255-b)*t);
        }
        function isLightHex(hex) {
            if (!/^#[0-9a-f]{6}$/i.test(hex || '')) return true;
            const h = hex.replace('#',''); const r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16);
            return (0.299*r + 0.587*g + 0.114*b) > 150;
        }

        // Group the current routes into palette slots by their palette index.
        function buildPaletteSlots() {
            dockSlots = [];
            const routes = fabricCanvas ? fabricCanvas.getObjects().filter(o => o.isPath) : [];
            if (routes.length) {
                const byIndex = new Map();
                routes.forEach(o => {
                    ensureAppearance(o);
                    const idx = (typeof o.paletteIndex === 'number') ? o.paletteIndex : 0;
                    if (!byIndex.has(idx)) {
                        byIndex.set(idx, { baseHex: o.paletteBase || o.fillColor || o.strokeColor || '#888888', p: (o.paletteP == null ? 0.5 : o.paletteP), routes: [] });
                    }
                    byIndex.get(idx).routes.push(o);
                });
                [...byIndex.keys()].sort((a,b) => a-b).forEach(k => dockSlots.push(byIndex.get(k)));
            } else if (activePalette && activePalette.colors) {
                // no art yet — show the active palette as a live preview
                activePalette.colors.forEach(hex => dockSlots.push({ baseHex: hex, p: 0.5, routes: [] }));
            }
        }

        function paintSlotColor(slot) {
            const col = rampHex(slot.baseHex, slot.p);
            slot.routes.forEach(o => {
                o.paletteBase = slot.baseHex; o.paletteP = slot.p;
                if (o.fillOn)   { o.fillColor = col; o.fillBase = slot.baseHex; o.fillP = slot.p; }
                if (o.strokeOn) { o.strokeColor = col; o.strokeBase = slot.baseHex; o.strokeP = slot.p; }
                if (!o.fillOn && !o.strokeOn) { o.fillOn = true; o.fillColor = col; o.fillBase = slot.baseHex; o.fillP = slot.p; }
                applyAppearance(o);
            });
            if (fabricCanvas) fabricCanvas.renderAll();
        }

        // Generic touching swatch driven by accessor callbacks.
        function makeCdSwatch(cfg) {
            const el = document.createElement('div');
            el.className = 'cd-sw';
            el.tabIndex = 0;
            const hx = document.createElement('span'); hx.className = 'cd-hx'; el.appendChild(hx);
            const cue = document.createElement('span'); cue.className = 'cd-cue';
            cue.innerHTML = cfg.cue || 'drag to shade <span class="ar r">&#8646;</span>';
            el.appendChild(cue);
            if (cfg.label) { const l = document.createElement('span'); l.className = 'cd-lbl'; l.textContent = cfg.label; el.appendChild(l); }
            let toggleBtn = null;
            if (cfg.canToggle) {
                toggleBtn = document.createElement('button');
                toggleBtn.className = 'cd-toggle';
                toggleBtn.title = 'Turn this color on / off';
                toggleBtn.addEventListener('pointerdown', e => e.stopPropagation());
                toggleBtn.addEventListener('click', e => { e.stopPropagation(); cfg.toggle(); });
                el.appendChild(toggleBtn);
            }
            function paint() {
                const on = cfg.isOn ? cfg.isOn() : true;
                const col = cfg.getColor();
                el.style.background = on ? col
                    : 'repeating-linear-gradient(45deg, #ECECE9, #ECECE9 7px, #F6F6F4 7px, #F6F6F4 14px)';
                const light = on ? isLightHex(col) : true;
                const txt = light ? 'var(--ink)' : '#fff';
                const bg = light ? 'rgba(27,29,28,0.08)' : 'rgba(255,255,255,0.18)';
                hx.textContent = on ? col.toUpperCase() : 'OFF';
                hx.style.color = txt; hx.style.background = bg;
                cue.style.color = txt; cue.style.background = bg;
                const lbl = el.querySelector('.cd-lbl'); if (lbl) lbl.style.color = txt;
                if (toggleBtn) toggleBtn.classList.toggle('on', on);
            }
            el._paint = paint;
            paint();

            let startX = 0, startP = 0, dragging = false;
            el.addEventListener('pointerdown', e => {
                el.setPointerCapture(e.pointerId);
                startX = e.clientX; startP = cfg.getP(); dragging = false;
                el.classList.add('active', 'pressed');
            });
            el.addEventListener('pointermove', e => {
                if (!el.hasPointerCapture(e.pointerId)) return;
                const dx = e.clientX - startX;
                if (!dragging && Math.abs(dx) < 3) return;
                dragging = true;
                let p = startP + dx / 300;
                p = Math.max(0, Math.min(1, p));
                if (Math.abs(p - 0.5) < 0.025) p = 0.5; // detent on the pure color
                cfg.setP(p);
                if (cfg.onCommit) cfg.onCommit();
                paint();
            });
            el.addEventListener('pointerup', e => {
                el.classList.remove('active', 'pressed');
                try { el.releasePointerCapture(e.pointerId); } catch (_) {}
                // A drag tints. A click (no movement) opens the palette row for
                // this channel — the two gestures share the same swatch.
                if (dragging) pushHistory();
                else if (cfg.onClick) cfg.onClick();
            });
            el.addEventListener('keydown', e => {
                const step = e.shiftKey ? 0.1 : 0.03;
                if (e.key === 'ArrowLeft')  { cfg.setP(Math.max(0, cfg.getP() - step)); if (cfg.onCommit) cfg.onCommit(); paint(); pushHistoryDebounced(); e.preventDefault(); }
                if (e.key === 'ArrowRight') { cfg.setP(Math.min(1, cfg.getP() + step)); if (cfg.onCommit) cfg.onCommit(); paint(); pushHistoryDebounced(); e.preventDefault(); }
            });
            return el;
        }

        function makePaletteSwatch(slot) {
            return makeCdSwatch({
                getBase: () => slot.baseHex,
                setBase: (hex) => { slot.baseHex = hex; },
                getP: () => slot.p,
                setP: (p) => { slot.p = p; },
                getColor: () => rampHex(slot.baseHex, slot.p),
                onCommit: () => paintSlotColor(slot)
            });
        }

        function makeShapeSwatch(obj, ch, label) {
            const baseKey = ch === 'fill' ? 'fillBase' : 'strokeBase';
            const pKey    = ch === 'fill' ? 'fillP'    : 'strokeP';
            const onKey   = ch === 'fill' ? 'fillOn'   : 'strokeOn';
            const colKey  = ch === 'fill' ? 'fillColor': 'strokeColor';
            const applyCh = () => {
                obj[colKey] = rampHex(obj[baseKey], obj[pKey] == null ? 0.5 : obj[pKey]);
                applyAppearance(obj); fabricCanvas.renderAll();
            };
            return makeCdSwatch({
                label,
                canToggle: true,
                cue: 'click for colors<span class="cd-dot">&bull;</span>'
                   + '<span class="grp"><span class="ar l">&larr;</span>drag to tint<span class="ar r">&rarr;</span></span>',
                onClick: () => renderDock('pick', obj, ch),
                isOn: () => !!obj[onKey],
                toggle: () => {
                    // Never allow both channels off — the path would vanish.
                    if (obj[onKey] && !otherChannelOn(obj, ch)) { warnLastChannel(ch); return; }
                    obj[onKey] = !obj[onKey];
                    applyAppearance(obj); fabricCanvas.renderAll();
                    renderDock('shape', obj); refreshRouteSwatches(); pushHistory();
                },
                getBase: () => obj[baseKey] || obj[colKey] || '#888888',
                setBase: (hex) => { obj[baseKey] = hex; obj[onKey] = true; },
                getP: () => (obj[pKey] == null ? 0.5 : obj[pKey]),
                setP: (p) => { obj[pKey] = p; obj[onKey] = true; },
                getColor: () => rampHex(obj[baseKey] || obj[colKey] || '#888888', obj[pKey] == null ? 0.5 : obj[pKey]),
                onCommit: applyCh
            });
        }

        // ============================================================
        // CHANNEL COLOR PICKER
        // Clicking Fill or Outline swaps the dock for a row of the palette's
        // colors, so recoloring one channel is a single click rather than a
        // hunt for a hidden control.
        // ============================================================
        function otherChannelOn(obj, ch) {
            return ch === 'fill' ? !!obj.strokeOn : !!obj.fillOn;
        }
        function warnLastChannel(ch) {
            const other = ch === 'fill' ? 'outline' : 'fill';
            showModal(`That's the only visible channel left — turning it off would make the route disappear. Give it a ${other} first, then remove this one.`);
        }

        function applyChannelColor(obj, ch, hex) {
            const baseKey = ch === 'fill' ? 'fillBase'  : 'strokeBase';
            const pKey    = ch === 'fill' ? 'fillP'     : 'strokeP';
            const onKey   = ch === 'fill' ? 'fillOn'    : 'strokeOn';
            const colKey  = ch === 'fill' ? 'fillColor' : 'strokeColor';
            obj[baseKey] = hex;
            obj[pKey] = 0.5;              // land on the pure color; tint from there
            obj[onKey] = true;            // picking a color implies turning it on
            obj[colKey] = rampHex(hex, 0.5);
            applyAppearance(obj);
            fabricCanvas.renderAll();
        }

        function makePickCell(cls, title, onActivate, opts) {
            const el = document.createElement('button');
            el.type = 'button';
            el.className = 'cd-pick ' + cls + ((opts && opts.current) ? ' current' : '');
            el.title = title;
            if (opts && opts.disabled) el.disabled = true;
            if (opts && opts.bg) el.style.background = opts.bg;
            if (opts && opts.label) {
                const l = document.createElement('span');
                l.className = 'cd-lbl';
                l.textContent = opts.label;
                l.style.color = opts.labelDark ? 'var(--ink)' : '#fff';
                el.appendChild(l);
            }
            if (opts && opts.hex) {
                const hx = document.createElement('span');
                hx.className = 'cd-hx';
                hx.textContent = opts.hex.toUpperCase();
                const light = isLightHex(opts.hex);
                hx.style.color = light ? 'var(--ink)' : '#fff';
                hx.style.background = light ? 'rgba(27,29,28,0.08)' : 'rgba(255,255,255,0.18)';
                el.appendChild(hx);
            }
            if (!(opts && opts.disabled)) el.addEventListener('click', onActivate);
            return el;
        }

        function renderChannelPicker(obj, ch) {
            const baseKey = ch === 'fill' ? 'fillBase' : 'strokeBase';
            const onKey   = ch === 'fill' ? 'fillOn'   : 'strokeOn';
            const chName  = ch === 'fill' ? 'Fill' : 'Outline';
            const canClear = otherChannelOn(obj, ch);
            const currentBase = (obj[baseKey] || '').toLowerCase();

            dockModeLabel.textContent = `${chName} color`;

            const done = () => {
                refreshRouteSwatches();
                renderDock('shape', obj);
                pushHistory();
            };

            // "none" — guarded so a route can never lose both channels
            colorDock.appendChild(makePickCell('cd-none',
                canClear ? `No ${chName.toLowerCase()}`
                         : `Can't remove the ${chName.toLowerCase()} — it's the only thing making this route visible`,
                () => { obj[onKey] = false; applyAppearance(obj); fabricCanvas.renderAll(); done(); },
                { disabled: !canClear, label: 'None', labelDark: true }));

            // every color in the active palette, primaries then extended shades
            const seen = new Set();
            const pool = (activePalette.colors || []).concat(activePalette.extended || []);
            pool.forEach(hex => {
                if (!/^#[0-9a-f]{6}$/i.test(hex) || seen.has(hex.toLowerCase())) return;
                seen.add(hex.toLowerCase());
                colorDock.appendChild(makePickCell('', hex,
                    () => { applyChannelColor(obj, ch, hex); done(); },
                    { bg: hex, hex, current: obj[onKey] && hex.toLowerCase() === currentBase }));
            });

            // custom hue — replaces the old double-click, which can no longer
            // fire on a swatch whose single click re-renders the dock
            colorDock.appendChild(buildCustomCell(obj, ch));
        }

        // ============================================================
        // CUSTOM COLOR — hover-expanding palette field
        //
        // Horizontal axis interpolates across the active palette; vertical
        // axis is the same light/dark ramp that the tint drag uses. So the
        // field is "every shade of this palette" rather than a generic
        // spectrum. The CSS gradient and the JS sampling use identical maths,
        // which is what keeps the preview ring honest about what you'll get.
        // "More colors" swaps in a conventional picker for the rare case
        // where the palette genuinely doesn't contain what you need.
        // ============================================================
        function customPool() {
            const pool = (activePalette.colors || [])
                .concat(activePalette.extended || [])
                .filter(h => /^#[0-9a-f]{6}$/i.test(h));
            return pool.length ? pool : ['#888888'];
        }
        function lerpHex(a, b, t) {
            const pa = a.replace('#',''), pb = b.replace('#','');
            const c = i => {
                const va = parseInt(pa.substr(i*2,2),16), vb = parseInt(pb.substr(i*2,2),16);
                return Math.round(va + (vb - va) * t).toString(16).padStart(2,'0');
            };
            return '#' + c(0) + c(1) + c(2);
        }
        function poolColorAt(pool, x) {
            if (pool.length === 1) return pool[0];
            const f = Math.min(1, Math.max(0, x)) * (pool.length - 1);
            const i = Math.min(pool.length - 2, Math.floor(f));
            return lerpHex(pool[i], pool[i + 1], f - i);
        }
        // Polar sampling across the box. (x,y) are 0..1 over its width/height.
        //   angle  -> position through the palette, clockwise from 12 o'clock
        //   radius -> white at the centre, pure colour from the mid-edge out
        // r clamps at 1, which is what the CSS does too once the white overlay
        // has already reached zero — that keeps the corners pure rather than
        // over-shooting into the dark half of the ramp.
        function fieldColorAt(pool, x, y) {
            const dx = x - 0.5, dy = y - 0.5;
            const r = Math.min(1, Math.hypot(dx, dy) / 0.5);
            // atan2(dx, -dy) puts 0 at the top and increases clockwise, which
            // is what `conic-gradient(from 0deg)` does.
            const a = ((Math.atan2(dx, -dy) / (Math.PI * 2)) + 1) % 1;
            return rampHex(poolColorAt(wheelPool(pool), a), 1 - r * 0.5);
        }

        // The wheel wraps back to the first colour so there's no seam at 12 o'clock.
        function wheelPool(pool) { return pool.length === 1 ? pool : pool.concat([pool[0]]); }

        function fieldGradientCss(pool) {
            // Mirrors fieldColorAt exactly: a white core fading to nothing by
            // the mid-edge, over a conic sweep through the palette. There is no
            // dark stop — on the rim it swallowed most of the box, because area
            // grows as r². Darkening lives on the tint drag and full picker.
            const ring = wheelPool(pool);
            const sweep = ring.length === 1
                ? `conic-gradient(${ring[0]}, ${ring[0]})`
                : `conic-gradient(from 0deg, ${ring.join(', ')})`;
            return 'radial-gradient(ellipse 50% 50% at 50% 50%, #fff 0%, rgba(255,255,255,0) 100%), '
                 + sweep;
        }

        function hsvToHex(h, s, v) {
            const i = Math.floor(h * 6), f = h * 6 - i;
            const p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s);
            let r, g, b;
            switch (i % 6) {
                case 0: r = v; g = t; b = p; break;
                case 1: r = q; g = v; b = p; break;
                case 2: r = p; g = v; b = t; break;
                case 3: r = p; g = q; b = v; break;
                case 4: r = t; g = p; b = v; break;
                default: r = v; g = p; b = q;
            }
            const c = n => Math.round(n * 255).toString(16).padStart(2, '0');
            return '#' + c(r) + c(g) + c(b);
        }
        function hexToHsv(hex) {
            if (!/^#[0-9a-f]{6}$/i.test(hex || '')) hex = '#888888';
            const n = hex.replace('#', '');
            const r = parseInt(n.slice(0,2),16)/255, g = parseInt(n.slice(2,4),16)/255, b = parseInt(n.slice(4,6),16)/255;
            const max = Math.max(r,g,b), min = Math.min(r,g,b), d = max - min;
            let h = 0;
            if (d) {
                if (max === r)      h = ((g - b) / d) % 6;
                else if (max === g) h = (b - r) / d + 2;
                else                h = (r - g) / d + 4;
                h /= 6; if (h < 0) h += 1;
            }
            return { h, s: max ? d / max : 0, v: max };
        }

        // Tracks a pointer across an element, clamped to 0..1 on both axes.
        function trackField(el, onMove, onEnd) {
            const at = e => {
                const r = el.getBoundingClientRect();
                return [Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)),
                        Math.min(1, Math.max(0, (e.clientY - r.top) / r.height))];
            };
            el.addEventListener('pointerdown', e => {
                el.setPointerCapture(e.pointerId);
                el.dataset.dragging = '1';
                onMove(...at(e), true);
                e.preventDefault(); e.stopPropagation();
            });
            el.addEventListener('pointermove', e => {
                onMove(...at(e), el.dataset.dragging === '1');
            });
            el.addEventListener('pointerup', e => {
                try { el.releasePointerCapture(e.pointerId); } catch (_) {}
                delete el.dataset.dragging;
                if (onEnd) onEnd();
            });
        }

        function buildCustomCell(obj, ch) {
            const baseKey = ch === 'fill' ? 'fillBase' : 'strokeBase';
            const pool = customPool();

            const cell = document.createElement('div');
            cell.className = 'cd-pick cd-custom';
            cell.title = 'Custom color';
            cell.style.background = fieldGradientCss(pool);   // same art, cell-sized

            const lbl = document.createElement('span');
            lbl.className = 'cd-lbl';
            lbl.textContent = 'Custom';
            cell.appendChild(lbl);

            const panel = document.createElement('div');
            panel.className = 'cdc-panel';
            panel.innerHTML =
                '<div class="cdc-view" data-view="grad">' +
                    '<button type="button" class="cdc-bar cdc-more">Click for even more colors</button>' +
                    '<div class="cdc-field"><div class="cdc-wheel"><span class="cdc-ring"></span></div></div>' +
                '</div>' +
                '<div class="cdc-view" data-view="full" hidden>' +
                    '<div class="cdc-bar static">' +
                        '<button type="button" class="cdc-back" title="Back to palette colors">&larr;</button>' +
                        '<span>Full picker</span>' +
                    '</div>' +
                    '<div class="cdc-sv"><span class="cdc-knob"></span></div>' +
                    '<div class="cdc-hue"><span class="cdc-knob"></span></div>' +
                    '<div class="cdc-foot"><span class="cdc-hex">#888888</span>' +
                        '<button type="button" class="cdc-use">Use</button></div>' +
                '</div>';
            cell.appendChild(panel);

            const gradView = panel.querySelector('[data-view="grad"]');
            const fullView = panel.querySelector('[data-view="full"]');
            const wheel    = panel.querySelector('.cdc-wheel');
            const ring     = panel.querySelector('.cdc-ring');
            const sv       = panel.querySelector('.cdc-sv');
            const svKnob   = sv.querySelector('.cdc-knob');
            const hue      = panel.querySelector('.cdc-hue');
            const hueKnob  = hue.querySelector('.cdc-knob');
            const hexOut   = panel.querySelector('.cdc-hex');

            wheel.style.background = fieldGradientCss(pool);

            const commit = (hex) => {
                applyChannelColor(obj, ch, hex);
                refreshRouteSwatches();
                pushHistory();
            };

            // ---- palette wheel ----
            // The whole box is live now, so coordinates only need clamping to
            // the edges rather than testing against a circle.
            const wheelAt = (e) => {
                const b = wheel.getBoundingClientRect();
                return [Math.min(1, Math.max(0, (e.clientX - b.left) / b.width)),
                        Math.min(1, Math.max(0, (e.clientY - b.top) / b.height))];
            };
            wheel.addEventListener('pointermove', (e) => {
                const [x, y] = wheelAt(e);
                ring.style.left = (x * 100) + '%';
                ring.style.top  = (y * 100) + '%';
                ring.style.background = fieldColorAt(pool, x, y);
            });
            wheel.addEventListener('click', (e) => {
                const [x, y] = wheelAt(e);
                commit(fieldColorAt(pool, x, y));
            });

            // ---- full picker (same bounding box) ----
            let H = 0, S = 1, V = 1;
            const paintFull = (live) => {
                const pure = hsvToHex(H, 1, 1);
                sv.style.background =
                    'linear-gradient(to top, #000, rgba(0,0,0,0)), linear-gradient(to right, #fff, ' + pure + ')';
                svKnob.style.left = (S * 100) + '%';
                svKnob.style.top  = ((1 - V) * 100) + '%';
                hueKnob.style.left = (H * 100) + '%';
                hueKnob.style.background = pure;
                const hex = hsvToHex(H, S, V);
                svKnob.style.background = hex;
                hexOut.textContent = hex.toUpperCase();
                if (live) { applyChannelColor(obj, ch, hex); refreshRouteSwatches(); }
                return hex;
            };
            // keep the panel open while dragging outside its bounds
            const stay = on => panel.classList.toggle('stay', on);
            trackField(sv, (x, y, down) => {
                if (!down) return;
                S = x; V = 1 - y; stay(true); paintFull(true);
            }, () => { stay(false); pushHistory(); });
            trackField(hue, (x, _y, down) => {
                if (!down) return;
                H = x; stay(true); paintFull(true);
            }, () => { stay(false); pushHistory(); });
            panel.querySelector('.cdc-use').addEventListener('click', () => commit(paintFull(false)));

            const show = (which) => {
                gradView.hidden = which !== 'grad';
                fullView.hidden = which !== 'full';
                if (which === 'full') {
                    const hsv = hexToHsv(obj[baseKey]);
                    H = hsv.h; S = hsv.s; V = hsv.v;
                    paintFull(false);
                }
            };
            panel.querySelector('.cdc-more').addEventListener('click', () => show('full'));
            panel.querySelector('.cdc-back').addEventListener('click', () => show('grad'));

            // fade the dock hint out from under the expanded panel
            const wrap = document.getElementById('colorDockWrap');
            cell.addEventListener('pointerenter', () => wrap.classList.add('custom-open'));
            cell.addEventListener('pointerleave', () => {
                if (!panel.classList.contains('stay')) {
                    wrap.classList.remove('custom-open');
                    show('grad');   // always reopen on the palette field
                }
            });

            return cell;
        }

        function renderDock(mode, obj, channel) {
            if (!colorDock) return;
            if (mode === 'pick' && channel) dockPickChannel = channel;
            dockMode = (mode === 'shape' || mode === 'pick') && obj ? mode : 'palette';
            dockShapeObj = (dockMode === 'shape' || dockMode === 'pick') ? obj : null;
            colorDock.innerHTML = '';
            if (dockMode === 'pick') {
                ensureAppearance(obj);
                renderChannelPicker(obj, dockPickChannel);
                return;
            }
            if (dockMode === 'shape') {
                ensureAppearance(obj);
                dockModeLabel.textContent = 'Selected route — Fill & Outline';
                colorDock.appendChild(makeShapeSwatch(obj, 'fill', 'Fill'));
                colorDock.appendChild(makeShapeSwatch(obj, 'stroke', 'Outline'));
            } else {
                dockModeLabel.textContent = 'Palette';
                buildPaletteSlots();
                if (dockSlots.length) {
                    dockSlots.forEach(slot => colorDock.appendChild(makePaletteSwatch(slot)));
                } else {
                    const hint = document.createElement('div');
                    hint.style.cssText = 'flex:1;display:flex;align-items:center;justify-content:center;color:var(--ink-3);font-family:var(--font-mono);font-size:.7em;letter-spacing:.08em;text-transform:uppercase;';
                    hint.textContent = 'Generate art to color it';
                    colorDock.appendChild(hint);
                }
            }
        }

        // Internal canvas resolution is FIXED (long edge = BASE_LONG_EDGE)
        // and depends only on the chosen aspect ratio + orientation — never
        // on the on-screen size. The canvas is then scaled to fit the
        // viewport purely via CSS (fitCanvasToViewport). This is what keeps
        // art coordinates stable across window resizes and orientation flips
        // so nothing shrinks or drifts.
        const BASE_LONG_EDGE = 1600;
        function computeCanvasDims() {
            // width / height for the current ratio + orientation
            const aspect = isPortrait
                ? canvasRatio.h / canvasRatio.w
                : canvasRatio.w / canvasRatio.h;
            let w, h;
            if (aspect >= 1) {            // landscape / square: width is the long edge
                w = BASE_LONG_EDGE;
                h = Math.round(BASE_LONG_EDGE / aspect);
            } else {                       // portrait: height is the long edge
                h = BASE_LONG_EDGE;
                w = Math.round(BASE_LONG_EDGE * aspect);
            }
            if (!isFinite(w) || !isFinite(h) || w <= 0 || h <= 0) {
                return { w: 1600, h: 900 };
            }
            return { w, h };
        }

        // Scale the on-screen (CSS) size of the canvas to fit the available
        // space while preserving aspect ratio. Backstore resolution is left
        // untouched, so this never moves or rescales the art itself.
        function fitCanvasToViewport() {
            if (!fabricCanvas) return;
            const wrapperW = canvasWrapper.clientWidth;
            const wrapperH = canvasWrapper.clientHeight;
            const promptElement = document.getElementById('canvas-prompt');
            let promptHeight = 0;
            if (promptElement) {
                const promptStyle = getComputedStyle(promptElement);
                promptHeight = promptElement.offsetHeight
                    + (parseInt(promptStyle.marginTop) || 0)
                    + (parseInt(promptStyle.marginBottom) || 0);
            }
            const availableW = Math.max(wrapperW - 4, 80);
            const availableH = Math.max(wrapperH - promptHeight - 4, 150);
            const iw = fabricCanvas.width || BASE_LONG_EDGE;
            const ih = fabricCanvas.height || BASE_LONG_EDGE;
            const scale = Math.min(availableW / iw, availableH / ih) * 0.99;
            const dispW = Math.max(Math.round(iw * scale), 1);
            const dispH = Math.max(Math.round(ih * scale), 1);
            // cssOnly => sets the display size on all fabric canvas layers
            // without changing the backstore (internal) resolution.
            fabricCanvas.setDimensions({ width: dispW + 'px', height: dispH + 'px' }, { cssOnly: true });
            fabricCanvas.calcOffset();
        }

        function initCanvas() {
            const dims = computeCanvasDims();   // fixed internal resolution
            const iw = dims.w;
            const ih = dims.h;

            canvasElement.width = iw; 
            canvasElement.height = ih; 

            if (fabricCanvas) {
                fabricCanvas.dispose(); 
                fabricCanvas = null; 
            }

            try {
                fabricCanvas = new fabric.Canvas('gpsArtCanvas', {
                    width: iw, 
                    height: ih, 
                    backgroundColor: resolveBg(), 
                    selectionColor: 'rgba(252, 82, 0, 0.12)', 
                    selectionBorderColor: 'rgba(252, 82, 0, 0.6)',
                    selectionLineWidth: 1,
                    perPixelTargetFind: true, 
                    targetFindTolerance: 5,
                    // keep the backstore exactly at our internal resolution;
                    // display scaling is handled by CSS in fitCanvasToViewport
                    enableRetinaScaling: false
                });
                // backstore (internal) resolution — the coordinate space art lives in
                fabricCanvas.setDimensions({ width: iw, height: ih }, { backstoreOnly: true });
                setupCanvasEvents(); 
            } catch (e) {
                console.error("Error during Fabric.js initialization:", e);
                showModal("Error initializing drawing canvas: " + e.message);
                return; 
            }
            fitCanvasToViewport();  // set the on-screen (CSS) size to fit
            fabricCanvas.calcOffset(); 
            fabricCanvas.renderAll(); 
            clearSelection(); 
            dbg(`canvas initialized at ${iw}x${ih} (internal), fit to viewport`);
        }

        function setupCanvasEvents() {
            if (!fabricCanvas) return;
            
            const selectStyle = {
                borderColor: '#FC5200',
                borderDashArray: [5, 5],
                cornerColor: '#FC5200',
                cornerSize: 10,
                transparentCorners: false,
                borderOpacityWhenMoving: 1
            };

            // Selecting on the artboard lights up the matching row, and vice
            // versa. `syncSelectionFromCanvas` is a no-op while the list is
            // driving the canvas, which keeps the binding from ping-ponging.
            const onSelect = (e) => {
                if (isAdvancedEditingActive && e.selected && e.selected.length === 1 && e.selected[0].isPath) {
                    const obj = e.selected[0];
                    fabricCanvas.bringToFront(obj);
                    obj.set(selectStyle);
                    updateControlsForObject(obj);
                } else if (!isAdvancedEditingActive && e.selected) {
                    fabricCanvas.discardActiveObject();
                }
                const active = fabricCanvas.getActiveObject();
                syncSelectionFromCanvas(
                    active && active.type === 'activeSelection' ? active.getObjects()
                        : active ? [active] : []
                );
                fabricCanvas.renderAll();
            };

            fabricCanvas.on('selection:created', onSelect);
            fabricCanvas.on('selection:updated', onSelect);

            fabricCanvas.on('selection:cleared', (e) => {
                if (e.deselected && e.deselected.length > 0) {
                     e.deselected.forEach(obj => {
                        if (obj.isPath) {
                            obj.set({ 
                                borderColor: fabric.Object.prototype.borderColor, 
                                borderDashArray: null,
                                cornerColor: fabric.Object.prototype.cornerColor,
                                cornerSize: fabric.Object.prototype.cornerSize,
                                transparentCorners: true
                            });
                        }
                     });
                }
                updateControlsForObject(null);
                syncSelectionFromCanvas([]);
                 fabricCanvas.renderAll();
            });

             fabricCanvas.on('object:modified', (e) => { 
                if (isAdvancedEditingActive && e.target && e.target.isPath) {
                    updateControlsForObject(e.target); 
                    pushHistory();
                }
            });
        }
        
        scaleSlider.addEventListener('input', (e) => {
            const activeObject = fabricCanvas.getActiveObject();
            if (activeObject && activeObject.isPath) {
                ensureAppearance(activeObject);
                if (!activeObject.baseScale) activeObject.baseScale = activeObject.scaleX || 1;
                const relScale = parseFloat(e.target.value);
                activeObject.scale(activeObject.baseScale * relScale); 
                applyAppearance(activeObject); // keep stroke weight visually constant under scale
                activeObject.setCoords();
                fabricCanvas.requestRenderAll(); 
                scaleValueDisplay.textContent = `${Math.round(relScale * 100)}%`;
                pushHistoryDebounced();
            }
        });

        rotationSlider.addEventListener('input', (e) => {
            const activeObject = fabricCanvas.getActiveObject();
            if (activeObject && activeObject.isPath) {
                const angle = parseInt(e.target.value, 10);
                activeObject.set('angle', angle).setCoords();
                fabricCanvas.requestRenderAll();
                rotationValueDisplay.textContent = `${angle}°`;
                pushHistoryDebounced();
            }
        });
        
        doneEditingButton.addEventListener('click', () => {
            if (fabricCanvas) {
                const activeObj = fabricCanvas.getActiveObject();
                if (activeObj && activeObj.isPath) {
                     activeObj.set({ 
                        borderColor: fabric.Object.prototype.borderColor, 
                        borderDashArray: null,
                        cornerColor: fabric.Object.prototype.cornerColor,
                        cornerSize: fabric.Object.prototype.cornerSize,
                        transparentCorners: true
                    });
                }
                fabricCanvas.discardActiveObject();
                fabricCanvas.renderAll();
            }
            updateControlsForObject(null); 
        });

        window.addEventListener('load', async () => {
            dbg(`GPX Sketch ${BUILD} loaded — d3 ${typeof d3 !== 'undefined' ? d3.version : 'MISSING'} · fabric ${typeof fabric !== 'undefined' ? fabric.version : 'MISSING'}`);
            const missing = [];
            if (typeof d3 === 'undefined') missing.push('d3');
            if (typeof fabric === 'undefined') missing.push('fabric.js');
            if (missing.length) {
                dbg('Missing libraries: ' + missing.join(', '), true);
                showModal('Critical libraries failed to load: ' + missing.join(', ') + '. Drawing cannot work in this state.');
                return;
            }
            activePalette = randomFavoritePalette();   // fresh favourite each visit
            initCanvas();
            populatePalettePicker();
            updatePaletteButton();
            updateBgControl();
            updateControlsForObject(null);
            renderRouteList();
            // Bring back the last session's artwork if one was saved (parity with Topo).
            try { restoreAbs(); } catch (e) { /* fall through to empty state */ }
            // Awaited so the query-param handling below knows whether the
            // sign-in actually took before deciding to reopen the picker.
            await detectRealStrava();

            // Handle what the OAuth callback hands back: ?strava_error=... on
            // failure, ?strava=connected on success.
            try {
                const params = new URLSearchParams(window.location.search);
                const err = params.get('strava_error');
                const justConnected = params.get('strava') === 'connected';

                if (err) {
                    dbg('strava_error from callback: ' + err, true);
                    showModal('Strava connection failed: ' + err);
                }

                // Returning from a successful sign-in used to land on a closed
                // overlay, so the user had to click Strava again to get to the
                // thing they'd just authorised. Go straight to the picker — in
                // the mode matching whichever tab the user connected from.
                if (justConnected) {
                    // Which tab did they start from? Saved before the OAuth redirect.
                    let fromTab = 'abstract';
                    try { fromTab = localStorage.getItem('gpxsketch_tab') || document.body.dataset.app || 'abstract'; } catch(e) {}
                    try { localStorage.removeItem('gpxsketch_tab'); } catch(e) {}
                    dbg('returned from Strava sign-in — opening picker in ' + fromTab + ' mode');
                    // openStravaOverlay now checks the SERVER for connection state,
                    // so it works even though the local stravaConnected flag may
                    // not be set yet on this first load.
                    openStravaOverlay(fromTab);
                }

                if (err || justConnected) {
                    params.delete('strava_error');
                    params.delete('strava');
                    const clean = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
                    window.history.replaceState({}, '', clean);
                }
            } catch (e) { /* ignore */ }
        });

        // Window resize now only rescales the ON-SCREEN size (CSS). The
        // internal resolution and all art coordinates stay fixed, so
        // resizing can never move, shrink, or distort the artwork.
        let resizeTimer = null;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(handleResize, 150);
        });
        function handleResize() {
            if (!fabricCanvas) { initCanvas(); return; }
            fitCanvasToViewport();
            fabricCanvas.renderAll();
        }

        // Re-fit the artwork into the canvas based on the art's own bounding
        // box (scaled to ~90% of the canvas, centered). Because the fit is
        // computed from the art itself rather than the previous canvas size,
        // flipping orientation back and forth is stable and reversible — it
        // no longer compounds into an ever-shrinking piece.
        function refitArtToCanvas() {
            const objs = fabricCanvas.getObjects().filter(o => o.isPath);
            if (!objs.length) return;
            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
            objs.forEach(o => {
                const r = o.getBoundingRect(true, true); // absolute, includes scale/rotation
                minX = Math.min(minX, r.left);
                minY = Math.min(minY, r.top);
                maxX = Math.max(maxX, r.left + r.width);
                maxY = Math.max(maxY, r.top + r.height);
            });
            const bw = maxX - minX, bh = maxY - minY;
            if (!(bw > 0) || !(bh > 0)) return;
            const cw = fabricCanvas.width, ch = fabricCanvas.height;
            const target = 0.9;
            const f = Math.min((cw * target) / bw, (ch * target) / bh);
            const bcx = minX + bw / 2, bcy = minY + bh / 2;
            const ccx = cw / 2, ccy = ch / 2;
            objs.forEach(o => {
                o.left = ccx + (o.left - bcx) * f;
                o.top  = ccy + (o.top  - bcy) * f;
                o.scaleX = (o.scaleX || 1) * f;
                o.scaleY = (o.scaleY || 1) * f;
                if (o.baseScale) o.baseScale *= f;
                applyAppearance(o); // keep stroke weight visually constant
                o.setCoords();
            });
        }

        // Change the canvas SHAPE (aspect ratio or orientation). Swaps the
        // internal dimensions, re-fits the art, then re-fits the display.
        function changeCanvasShape() {
            if (!fabricCanvas) { initCanvas(); return; }
            const dims = computeCanvasDims();
            fabricCanvas.setDimensions({ width: dims.w, height: dims.h }, { backstoreOnly: true });
            refitArtToCanvas();
            fitCanvasToViewport();
            fabricCanvas.calcOffset();
            fabricCanvas.renderAll();
            pushHistory();
        }

        ratioSelect.addEventListener('change', () => {
            const parts = ratioSelect.value.split(':');
            canvasRatio = { w: parseInt(parts[0], 10), h: parseInt(parts[1], 10) };
            changeCanvasShape();
            dbg(`canvas ratio -> ${ratioSelect.value}${isPortrait ? ' portrait' : ''}`);
        });
        orientationButton.addEventListener('click', () => {
            isPortrait = !isPortrait;
            changeCanvasShape();
            dbg(`orientation -> ${isPortrait ? 'portrait' : 'landscape'}`);
        });

        // ============================================================
        // GENERATION PIPELINE
        // ============================================================
        reshuffleButton.addEventListener('click', () => generateArt('reshuffle'));

        // Art is generated automatically whenever the route set changes, so
        // this can be re-entered by a fast import. Guard it.
        let generating = false;

        async function generateArt(reason) {
            const files = loadedFiles;
            if (files.length === 0) return;
            if (generating) { dbg('generate already in progress — skipped'); return; }
            generating = true;
            try {
            
            if (!fabricCanvas) { 
                initCanvas(); 
                if (!fabricCanvas) {
                    showModal("Canvas not ready. Please reload.");
                    return;
                }
            }
            
            artGenerated = true;  // background now auto-matches the palette
            fabricCanvas.clear();
            fabricCanvas.backgroundColor = resolveBg(); 
            updateBgControl();
            
            fileOrderCounter = 0;
            
            const drawItems = [];
            for (const file of files) {
                try {
                    const gpxString = await readFileAsText(file); 
                    const parsedData = await parseGpxData(gpxString); 
                    
                    const segments = extractSegments(parsedData);
                    dbg(`${file.name}: ${segments.length} segment(s), ${segments.reduce((s, x) => s + x.length, 0)} points`);
                    if (segments.length === 0) {
                        console.warn(`No drawable tracks or routes found in ${file.name}. Skipping.`);
                        continue;
                    }

                    const fileOrder = fileOrderCounter++;
                    segments.forEach((points, segIdx) => {
                        drawItems.push({
                            points: points,
                            fileName: file.name,
                            routeUid: ensureRouteUid(file),
                            fileOrder: fileOrder,
                            id: `file-${fileOrder}-seg-${segIdx}`
                        });
                    });
                } catch (error) { 
                    dbg(`error processing ${file.name}: ${error.message}`, true);
                    showModal(`Error processing file ${file.name}: ${error.message}`);
                }
            }

            if (drawItems.length === 0) {
                showModal('No paths were drawn. Check console for warnings.');
                clearSelection();
                return;
            }

            // color assignment: 5 primary colors first; the 4 extension
            // shades only join the pool when the piece has >5 routes
            const pool = fileOrderCounter > activePalette.colors.length
                ? activePalette.colors.concat(activePalette.extended)
                : activePalette.colors;
            const startIdx = Math.floor(Math.random() * pool.length);
            drawItems.forEach(item => {
                item.color = pool[(startIdx + item.fileOrder) % pool.length];
            });

            const slots = computeLayoutSlots(drawItems.length, fabricCanvas.width, fabricCanvas.height);
            const flowAngle = Math.random() * 360;

            let drawErrors = 0;
            drawItems.forEach((item, i) => {
                try {
                    createPathInSlot(item, slots[i], flowAngle);
                } catch (e) {
                    drawErrors++;
                    dbg(`draw failed for ${item.id}: ${e.message}`, true);
                }
            });
            
            paintPalette(activePalette);   // assign palette slots so the color dock maps cleanly
            applyGlobalChannels();         // honour the toolbar Fill/Outline toggles on fresh art
            fabricCanvas.renderAll();
            clearSelection();
            selectedRouteUid = null;
            renderRouteList();             // row miniatures pick up the assigned colours
            renderRouteStats();
            resetHistory(); // baseline snapshot so undo can't go past the fresh art

            // Select the first route straight away. Without this the artboard
            // looks inert and there's nothing signalling that the shapes are
            // clickable — this lights up a row, the stats card and the colour
            // dock all at once.
            if (loadedFiles.length) selectRouteByUid(ensureRouteUid(loadedFiles[0]));

            const pathCount = fabricCanvas.getObjects().filter(o => o.isPath).length;
            dbg(`generation complete (${reason || 'manual'}): ${pathCount}/${drawItems.length} paths drawn on ${fabricCanvas.width}x${fabricCanvas.height}${drawErrors ? ` — ${drawErrors} ERRORS` : ''}`, drawErrors > 0);
            if (pathCount === 0) {
                showModal('Generation ran but nothing was drawn. Press Ctrl+D (Cmd+D on Mac) to open the debug log and send me what it says.');
            }
            } finally {
                generating = false;
                updateGenerateState();
            }
        }

        // ADD (append) newly-uploaded/imported routes to the EXISTING art without
        // rebuilding it. Only the new files get shapes; every existing route keeps
        // its position, colour, fill/outline and all per-route styling. Used by the
        // GPX-upload and Strava-import paths. Reshuffle still calls generateArt()
        // for a full, deliberate rebuild.
        async function addRoutesToArt(reason) {
            if (loadedFiles.length === 0) return;
            // Nothing drawn yet → this is just a normal first generation.
            if (!fabricCanvas || !artGenerated || !fabricCanvas.getObjects().some(o => o.isPath)) {
                return generateArt(reason);
            }
            if (generating) { dbg('generate already in progress — skipped'); return; }
            generating = true;
            try {
                const existingPaths = fabricCanvas.getObjects().filter(o => o.isPath);
                const existingUids = new Set(existingPaths.map(o => o.routeUid));
                const newFiles = loadedFiles.filter(f => !existingUids.has(ensureRouteUid(f)));
                if (newFiles.length === 0) { dbg('append: no new routes to draw'); return; }

                // Continue the file-order sequence past the existing routes.
                const baseOrder = existingPaths.reduce((m, o) => Math.max(m, o.originalFileOrder || 0), -1) + 1;
                let order = baseOrder;
                const drawItems = [];
                for (const file of newFiles) {
                    try {
                        const segments = extractSegments(await parseGpxData(await readFileAsText(file)));
                        if (segments.length === 0) { console.warn(`No drawable tracks or routes found in ${file.name}. Skipping.`); continue; }
                        const fileOrder = order++;
                        segments.forEach((points, segIdx) => drawItems.push({
                            points, fileName: file.name, routeUid: ensureRouteUid(file),
                            fileOrder, id: `file-${fileOrder}-seg-${segIdx}`
                        }));
                    } catch (error) {
                        dbg(`error processing ${file.name}: ${error.message}`, true);
                        showModal(`Error processing file ${file.name}: ${error.message}`);
                    }
                }
                if (drawItems.length === 0) return;

                // Colour: continue past the palette slots the existing routes use, so
                // a new route gets a fresh colour. Segments of one file share it.
                const distinctExisting = new Set(existingPaths.map(o => o.originalFileOrder)).size;
                const distinctTotal = distinctExisting + new Set(drawItems.map(d => d.fileOrder)).size;
                const pool = distinctTotal > activePalette.colors.length
                    ? activePalette.colors.concat(activePalette.extended)
                    : activePalette.colors;
                drawItems.forEach(item => { item.color = pool[(distinctExisting + (item.fileOrder - baseOrder)) % pool.length]; });

                // Layout: size a grid for the whole collage, drop the new route(s)
                // into the tail cells, and leave every existing shape untouched.
                const allSlots = computeLayoutSlots(existingPaths.length + drawItems.length, fabricCanvas.width, fabricCanvas.height);
                const slots = allSlots.slice(allSlots.length - drawItems.length);
                const flowAngle = Math.random() * 360;

                let drawErrors = 0;
                drawItems.forEach((item, i) => {
                    try { createPathInSlot(item, slots[i], flowAngle); }
                    catch (e) { drawErrors++; dbg(`draw failed for ${item.id}: ${e.message}`, true); }
                });

                // Palette metadata + the global Fill/Outline toggles — applied to the
                // NEW shapes ONLY, so existing routes' styling is never re-touched.
                const newUids = new Set(drawItems.map(d => d.routeUid));
                fabricCanvas.getObjects().filter(o => o.isPath && newUids.has(o.routeUid)).forEach(o => {
                    ensureAppearance(o);
                    o.paletteBase = o.fillBase || o.fillColor; o.paletteP = 0.5;
                    let pi = pool.indexOf(o.paletteBase); if (pi < 0) pi = (o.originalFileOrder || 0) % pool.length;
                    o.paletteIndex = pi;
                    if (gOutlineOn && !o.strokeOn) {
                        const c = pickDistinctColor(o.fillColor || o.paletteBase);
                        o.strokeColor = c; o.strokeBase = c; o.strokeP = 0.5; if (!o.strokeW) o.strokeW = DEFAULT_STROKE_W; o.strokeOn = true;
                    }
                    if (!gFillOn && o.fillOn) o.fillOn = false;
                    if (!o.fillOn && !o.strokeOn) o.fillOn = true;   // safety
                    applyAppearance(o);
                });

                fabricCanvas.renderAll();
                renderRouteList();
                renderRouteStats();
                selectRouteByUid(drawItems[0].routeUid);   // spotlight the route just added
                pushHistory();                             // record the add; keep the undo stack

                const pathCount = fabricCanvas.getObjects().filter(o => o.isPath).length;
                dbg(`append complete (${reason || 'manual'}): +${drawItems.length} path(s), ${pathCount} total${drawErrors ? ` — ${drawErrors} ERRORS` : ''}`, drawErrors > 0);
            } finally {
                generating = false;
                updateGenerateState();
            }
        }

        function extractSegments(gpxData) {
            const segments = [];
            if (gpxData.tracks) {
                gpxData.tracks.forEach(track => {
                    track.segments.forEach(segmentArray => { 
                        const validPoints = (segmentArray || []).filter(p => p && typeof p.lat === 'number' && typeof p.lon === 'number');
                        if (validPoints.length >= 2) {
                            segments.push(validPoints.map(p => [p.lon, p.lat]));
                        }
                    });
                });
            }
            if (gpxData.routes) { 
                gpxData.routes.forEach(route => {
                    const validPoints = (route.points || []).filter(p => p && typeof p.lat === 'number' && typeof p.lon === 'number');
                    if (validPoints.length >= 2) {
                        segments.push(validPoints.map(p => [p.lon, p.lat]));
                    }
                });
            }
            return segments;
        }

        function shuffleArray(arr) {
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            return arr;
        }

        function computeLayoutSlots(n, canvasW, canvasH) {
            const margin = Math.min(canvasW, canvasH) * 0.06;
            const usableW = canvasW - 2 * margin;
            const usableH = canvasH - 2 * margin;

            const cols = Math.max(1, Math.ceil(Math.sqrt(n * usableW / usableH)));
            const rows = Math.max(1, Math.ceil(n / cols));
            const cellW = usableW / cols;
            const cellH = usableH / rows;

            const cells = [];
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    cells.push({
                        cx: margin + cellW * (c + 0.5),
                        cy: margin + cellH * (r + 0.5)
                    });
                }
            }
            shuffleArray(cells);

            return cells.slice(0, n).map(cell => {
                const jitterX = (Math.random() - 0.5) * cellW * 0.35;
                const jitterY = (Math.random() - 0.5) * cellH * 0.35;
                const cx = Math.min(Math.max(cell.cx + jitterX, margin), canvasW - margin);
                const cy = Math.min(Math.max(cell.cy + jitterY, margin), canvasH - margin);
                return {
                    cx: cx,
                    cy: cy,
                    maxDim: Math.min(cellW, cellH) * (1.05 + Math.random() * 0.35)
                };
            });
        }

        function createPathInSlot(item, slot, flowAngle) {
            const projection = d3.geoMercator();
            const feature = {
                type: "Feature",
                geometry: { type: "LineString", coordinates: item.points }
            };
            projection.fitSize([500, 500], feature);
            const pathGenerator = d3.geoPath().projection(projection);
            const svgPathData = pathGenerator(feature);

            if (!svgPathData || svgPathData.length === 0 || svgPathData === "M0,0Z" || svgPathData === "M,Z") {
                console.warn(`Path generation produced no drawable geometry for ${item.id}`);
                return;
            }

            // New routes start filled. Fill vs. outline is now a per-route
            // choice made in the color dock, so there's no global default to read.
            const fillOn = true;
            const strokeOn = false;
            const fabricPath = new fabric.Path(svgPathData, {
                strokeLineCap: 'round',
                strokeLineJoin: 'round',
                selectable: isAdvancedEditingActive, 
                evented: isAdvancedEditingActive,   
                hasControls: true, 
                fileOrigin: item.fileName, 
                routeUid: item.routeUid,
                id: item.id,
                originX: 'center', 
                originY: 'center',
                isPath: true,
                originalFileOrder: item.fileOrder,
                // ----- appearance model -----
                fillOn: fillOn,
                strokeOn: strokeOn,
                fillColor: item.color,
                strokeColor: item.color,
                fillBase: item.color,
                fillP: 0.5,
                strokeBase: item.color,
                strokeP: 0.5,
                strokeW: DEFAULT_STROKE_W,
                opacity: 1,
                _appInit: true
            });

            const maxSide = Math.max(fabricPath.width || 1, fabricPath.height || 1);
            // SPAWN_SCALE fattens routes past a strict fit-to-slot so the
            // collage reads denser out of the box. baseScale takes the same
            // value, so 100% on the slider still means "as generated".
            const scale = (slot.maxDim / maxSide) * SPAWN_SCALE;
            fabricPath.set({
                scaleX: scale,
                scaleY: scale,
                angle: normalizeAngle(flowAngle + (Math.random() - 0.5) * 50),
                left: slot.cx,
                top: slot.cy
            });
            fabricPath.baseScale = scale;
            applyAppearance(fabricPath); // render fill/stroke/weight/opacity from the model
            fabricPath.setCoords();
            fabricCanvas.add(fabricPath);
        }

        function normalizeAngle(a) {
            return ((a % 360) + 360) % 360;
        }


        saveDropdownButton.addEventListener('click', (event) => {
            event.stopPropagation(); 
            saveOptions.classList.toggle('show-dropdown');
        });

        window.onclick = function(event) {
          if (!event.target.matches('#saveDropdownButton') && !saveOptions.contains(event.target)) {
            if (saveOptions.classList.contains('show-dropdown')) {
                saveOptions.classList.remove('show-dropdown');
            }
          }
          if (!paletteButton.contains(event.target) && !paletteDropdown.contains(event.target)) {
            if (paletteDropdown.classList.contains('show-dropdown')) {
                paletteDropdown.classList.remove('show-dropdown');
                paintPalette(activePalette);
                updateBgControl();
            }
          }
        }

        function saveCanvas(format = 'jpeg') {
            if (!fabricCanvas || fabricCanvas.getObjects().length === 0) {
                showModal("Canvas is empty or not ready to save.");
                return;
            }

            const activeObject = fabricCanvas.getActiveObject();
            if (activeObject) { 
                if (activeObject.isPath) {
                    activeObject.set({ 
                        borderColor: fabric.Object.prototype.borderColor, 
                        borderDashArray: null,
                        cornerColor: fabric.Object.prototype.cornerColor,
                        cornerSize: fabric.Object.prototype.cornerSize,
                        transparentCorners: true
                    });
                }
                fabricCanvas.discardActiveObject();
                fabricCanvas.renderAll();
            }

            // Export at ~4K (long edge ≈ 3840px) via toDataURL's multiplier,
            // which renders at high resolution WITHOUT touching the backstore
            // or on-screen size — so the live canvas display is never disturbed.
            const TARGET_LONG_EDGE = 3840;
            const longEdge = Math.max(fabricCanvas.width, fabricCanvas.height) || BASE_LONG_EDGE;
            const exportMultiplier = TARGET_LONG_EDGE / longEdge;

            try {
                const filename = `GPX_Sketch.${format === 'jpeg' ? 'jpg' : format}`; 
                let dataURL;

                if (format === 'svg') {
                    dataURL = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(fabricCanvas.toSVG());
                } else {
                    const dataURLOptions = { format: format, multiplier: exportMultiplier };
                    if (format === 'jpeg') dataURLOptions.quality = 1.0; 
                    dataURL = fabricCanvas.toDataURL(dataURLOptions);
                }
                
                const link = document.createElement('a');
                link.download = filename;
                link.href = dataURL;
                document.body.appendChild(link); 
                link.click();
                document.body.removeChild(link);
                showModal(`Canvas saved as ${filename}!`);

            } catch (e) {
                console.error(`Error saving canvas to ${format.toUpperCase()}:`, e);
                showModal(`Could not save canvas: ${e.message}`);
            } finally {
                if (activeObject) { 
                    fabricCanvas.setActiveObject(activeObject);
                    if (activeObject.isPath) {
                         activeObject.set({
                            borderColor: '#FC5200',
                            borderDashArray: [5, 5],
                            cornerColor: '#FC5200',
                            cornerSize: 10,
                            transparentCorners: false
                        });
                    }
                    fabricCanvas.renderAll();
                }
            }
        }

        saveJpgButton.addEventListener('click', () => saveCanvas('jpeg'));
        savePngButton.addEventListener('click', () => saveCanvas('png'));
        saveSvgButton.addEventListener('click', () => saveCanvas('svg'));

        function readFileAsText(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.onerror = (e) => reject(new Error(`File could not be read: ${e.target.error.name}`));
                reader.readAsText(file);
            });
        }

        /* GPX reader — uses the browser's built-in XML parser (same approach as Topo's
           parseGpx). Replaces the 418 KB inlined gpx-parse bundle (removed v0.45.0).
           Returns the shape extractSegments() expects:
             { tracks:[{segments:[[{lat,lon},…],…]}], routes:[{points:[{lat,lon},…]}] } */
        function parseGpxData(gpxString) {
            return new Promise((resolve, reject) => {
                try {
                    if (!gpxString || !gpxString.trim()) return reject(new Error('GPX parsing failed: The GPX file content appears to be empty.'));
                    const xml = new DOMParser().parseFromString(gpxString, 'application/xml');
                    if (xml.getElementsByTagName('parsererror').length) return reject(new Error('GPX parsing failed: The file is not valid GPX/XML.'));
                    const pt = el => ({ lat: parseFloat(el.getAttribute('lat')), lon: parseFloat(el.getAttribute('lon')) });
                    const ok = p => isFinite(p.lat) && isFinite(p.lon);
                    const pts = (root, tag) => Array.from(root.getElementsByTagName(tag)).map(pt).filter(ok);
                    const tracks = Array.from(xml.getElementsByTagName('trk')).map(trk => {
                        const segs = Array.from(trk.getElementsByTagName('trkseg')).map(seg => pts(seg, 'trkpt'));
                        return { segments: segs.length ? segs : [pts(trk, 'trkpt')] };
                    });
                    const routes = Array.from(xml.getElementsByTagName('rte')).map(rte => ({ points: pts(rte, 'rtept') }));
                    // Waypoint-only files: treat the waypoints as one route (matches Topo).
                    const hasLine = tracks.some(t => t.segments.some(s => s.length >= 2)) || routes.some(r => r.points.length >= 2);
                    if (!hasLine) { const w = pts(xml, 'wpt'); if (w.length >= 2) routes.push({ points: w }); }
                    resolve({ tracks, routes });
                } catch (e) {
                    reject(new Error(`Exception in GPX parser: ${e.message || "A synchronous error occurred."}`));
                }
            });
        }

        // ============================================================
        // STRAVA CONNECTOR (real OAuth)
        // The app hands off to Strava's own site for sign-in/authorization
        // via the server's /auth/login endpoint; the server exchanges the
        // code for a token and exposes /api/status + /api/activities.
        // ============================================================
        const stravaOverlay = document.getElementById('stravaOverlay');
        const stravaWindow = document.getElementById('stravaWindow');
        const stravaConnectButton = document.getElementById('stravaConnectButton');
        const stravaConnectLabel = document.getElementById('stravaConnectLabel');
        const stravaCloseButton = document.getElementById('stravaCloseButton');
        const stravaViews = {
            connect: document.getElementById('stravaViewConnect'),
            loading: document.getElementById('stravaViewLoading'),
            dash: document.getElementById('stravaViewDash')
        };
        const stravaConnectStartButton = document.getElementById('stravaConnectStartButton');
        const stravaConnectNote = document.getElementById('stravaConnectNote');
        const stravaDisconnectButton = document.getElementById('stravaDisconnectButton');
        const dashList = document.getElementById('dashList');
        const dashFilterNote = document.getElementById('dashFilterNote');
        const dashCount = document.getElementById('dashCount');
        const dashSelectAll = document.getElementById('dashSelectAll');
        const stravaImportButton = document.getElementById('stravaImportButton');

        let stravaConnected = false;
        let selectedActivityIds = new Set();

        // Stephen's profile photo (small crop, embedded so the app stays a single file)
        // ---------- REAL STRAVA MODE (auto-detected) ----------
        // When this file is served by server/server.js, /api/status
        // responds and the whole flow switches from demo to real OAuth.
        // Opened as a plain file, fetch fails silently -> demo mode.
        let stravaReal = false;
        let dashActivities = null;
        let dashHiddenCount = 0;
        // Dashboard pagination — reveal activities in batches of 10.
        const DASH_BATCH = 10;
        let dashVisibleCount = DASH_BATCH;
        let dashNextPage = 2;          // next Strava page the server should resume from
        let dashServerExhausted = false;
        async function detectRealStrava() {
            try {
                dbg('detectRealStrava: fetching ' + window.BACKEND_URL + '/api/status');
                const res = await fetch(`${window.BACKEND_URL}/api/status`);
                dbg('detectRealStrava: response status ' + res.status);
                if (!res.ok) { dbg('detectRealStrava: non-200, aborting'); return; }
                const status = await res.json();
                stravaReal = true;
                dbg('real Strava backend detected' + (status.connected ? ` — connected as ${status.athlete.firstname}` : ' (not connected yet)'));
                if (status.connected) {
                    stravaConnected = true;
                    stravaConnectButton.classList.add('connected');
                    stravaConnectButton.querySelector('.strava-mark').style.display = 'none';
                    const avatar = status.athlete.profile
                        ? '<img class="toolbar-avatar" src="' + status.athlete.profile + '" alt=""> '
                        : '';
                    stravaConnectLabel.innerHTML = avatar + 'Strava &middot; ' + (status.athlete.firstname || 'Connected');
                    document.querySelector('#stravaViewDash .dash-name').textContent = `${status.athlete.firstname || ''} ${status.athlete.lastname || ''}`.trim() || 'Strava athlete';
                    document.querySelector('#stravaViewDash .dash-loc').textContent = status.athlete.location || '';
                    if (status.athlete.profile) document.getElementById('dashAvatarImg').src = status.athlete.profile;
                }
            } catch (e) { dbg('detectRealStrava failed: ' + e.message, true); }
        }

        // A 401 from our own backend means the server is holding no Strava
        // token — nearly always a restart that dropped the session, not the
        // user signing out. Drop back to the Connect view and say so, rather
        // than reporting a bare "HTTP 401" once per failed request.
        function handleAuthLoss(context) {
            stravaConnected = false;
            selectedActivityIds.clear();
            dashActivities = null;
            stravaConnectButton.classList.remove('connected');
            const mark = stravaConnectButton.querySelector('.strava-mark');
            if (mark) mark.style.display = '';
            stravaConnectLabel.textContent = 'Connect with Strava';
            if (window._setTopoStravaUI) window._setTopoStravaUI(false);   // keep Topo's button in sync
            dbg(`Strava session lost during ${context} — the server is no longer signed in`, true);
            stravaOverlay.classList.add('open');
            stravaConnectNote.style.display = 'none';
            showStravaView('connect');
        }

        async function loadRealActivities() {
            try {
                const res = await fetch(`${window.BACKEND_URL}/api/activities`);
                if (res.status === 401) { handleAuthLoss('activity load'); return; }
                if (!res.ok) throw new Error('HTTP ' + res.status);
                const data = await res.json();
                dashActivities = data.activities || [];
                dashHiddenCount = data.hiddenCount || 0;
                dashVisibleCount = DASH_BATCH;
                dashNextPage = data.nextPage || 2;
                dashServerExhausted = data.hasMore === false;
                dbg(`strava: ${dashActivities.length} activities with GPS, ${dashHiddenCount} hidden`);
                buildDashboard();
                showStravaView('dash');
            } catch (e) {
                dbg('strava activities failed: ' + e.message, true);
                showModal('Could not load Strava activities: ' + e.message);
                closeStravaOverlay();
            }
        }

        function demoActivities() {
            return FAKE_ACTIVITIES.filter(a => a.hasGps).map(a => Object.assign({}, a, { thumbPoints: a.points }));
        }

        document.getElementById('dashAvatarImg').src =
            'data:image/svg+xml;utf8,' + encodeURIComponent(
                '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="#E9E9EE"/><circle cx="20" cy="15" r="7" fill="#C9C9D2"/><path d="M6 38c0-8 6-13 14-13s14 5 14 13z" fill="#C9C9D2"/></svg>');

        // ---- Deterministic pseudo-random (stable thumbnails) ----
        function mulberry32(seed) {
            return function() {
                seed |= 0; seed = seed + 0x6D2B79F5 | 0;
                let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
                t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
                return ((t ^ t >>> 14) >>> 0) / 4294967296;
            };
        }

        // ---- Parametric route shape generators → [[lon,lat],...] ----
        function genRoutePoints(shape, seed) {
            const rnd = mulberry32(seed * 7919 + 13);
            const lat0 = 40.0 + (rnd() - 0.5) * 0.1;
            const lon0 = -105.27 + (rnd() - 0.5) * 0.1;
            const pts = [];
            const N = 160;

            if (shape === 'loop') {
                const rx = 0.008 + rnd() * 0.004, ry = 0.006 + rnd() * 0.004;
                const lobes = 3 + Math.floor(rnd() * 4);
                for (let i = 0; i <= N; i++) {
                    const t = i / N * 2 * Math.PI;
                    const w = 1 + 0.18 * Math.sin(lobes * t + rnd());
                    pts.push([lon0 + rx * w * Math.cos(t), lat0 + ry * w * Math.sin(t)]);
                }
            } else if (shape === 'track') {
                // running track: rounded rectangle laps with slight drift
                const w = 0.004, h = 0.0018;
                for (let lap = 0; lap < 3; lap++) {
                    for (let i = 0; i <= 60; i++) {
                        const t = i / 60 * 2 * Math.PI;
                        const drift = lap * 0.00004;
                        pts.push([
                            lon0 + w * Math.cos(t) + drift,
                            lat0 + h * Math.sin(t) * (Math.abs(Math.sin(t)) > 0.4 ? 1 : 1.4) + drift
                        ]);
                    }
                }
            } else if (shape === 'grid') {
                let lon = lon0, lat = lat0, heading = 0;
                for (let i = 0; i < N; i++) {
                    if (rnd() < 0.09) heading += (rnd() < 0.5 ? -90 : 90);
                    const rad = heading * Math.PI / 180;
                    lon += 0.00035 * Math.sin(rad);
                    lat += 0.00028 * Math.cos(rad);
                    pts.push([lon, lat]);
                }
            } else if (shape === 'river') {
                let lon = lon0, lat = lat0;
                const bend = 6 + rnd() * 5;
                for (let i = 0; i < N; i++) {
                    lon += 0.00030 + rnd() * 0.00006;
                    lat += 0.00045 * Math.sin(i / bend) + (rnd() - 0.5) * 0.00006;
                    pts.push([lon, lat]);
                }
            } else if (shape === 'switchback') {
                let lon = lon0, lat = lat0;
                const half = Math.floor(N / 2);
                for (let i = 0; i < half; i++) {
                    lat += 0.00016 + (rnd() - 0.5) * 0.00003;
                    lon += 0.0009 * Math.sin(i / 5.5);
                    pts.push([lon, lat]);
                }
                for (let i = pts.length - 2; i >= 0; i--) {
                    pts.push([pts[i][0] + 0.00006, pts[i][1] + 0.00002]);
                }
            } else if (shape === 'figure8') {
                const r = 0.006 + rnd() * 0.003;
                for (let i = 0; i <= N; i++) {
                    const t = i / N * 2 * Math.PI;
                    pts.push([
                        lon0 + r * Math.sin(t) * 1.2,
                        lat0 + r * Math.sin(t) * Math.cos(t)
                    ]);
                }
            } else { // outback
                let lon = lon0, lat = lat0;
                const half = Math.floor(N / 2);
                for (let i = 0; i < half; i++) {
                    lon += 0.00040 + (rnd() - 0.5) * 0.00008;
                    lat += 0.00022 * Math.sin(i / 9) + (rnd() - 0.5) * 0.00005;
                    pts.push([lon, lat]);
                }
                for (let i = pts.length - 2; i >= 0; i--) {
                    pts.push([pts[i][0], pts[i][1] + 0.00003]);
                }
            }
            return pts;
        }

        function escapeXml(s) {
            return String(s)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&apos;');
        }

        function pointsToGpx(points, name) {
            const trkpts = points.map(p =>
                `      <trkpt lat="${p[1].toFixed(6)}" lon="${p[0].toFixed(6)}"></trkpt>`
            ).join('\n');
            return `<?xml version="1.0" encoding="UTF-8"?>\n<gpx version="1.1" creator="GPX-Sketch-demo" xmlns="http://www.topografix.com/GPX/1/1">\n  <trk><name>${escapeXml(name)}</name><trkseg>\n${trkpts}\n  </trkseg></trk>\n</gpx>`;
        }

        function pointsToThumbPolyline(points, w, h, pad) {
            let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
            points.forEach(p => {
                minX = Math.min(minX, p[0]); maxX = Math.max(maxX, p[0]);
                minY = Math.min(minY, p[1]); maxY = Math.max(maxY, p[1]);
            });
            const spanX = Math.max(maxX - minX, 1e-9);
            const spanY = Math.max(maxY - minY, 1e-9);
            const scale = Math.min((w - 2 * pad) / spanX, (h - 2 * pad) / spanY);
            const offX = (w - spanX * scale) / 2;
            const offY = (h - spanY * scale) / 2;
            return points.map(p => {
                const x = offX + (p[0] - minX) * scale;
                const y = h - (offY + (p[1] - minY) * scale); // invert lat → y
                return `${x.toFixed(1)},${y.toFixed(1)}`;
            }).join(' ');
        }

        // ---- Fake activity data for "Stephen" ----
        const FAKE_ACTIVITIES = [
            { id: 'a1',  name: 'Sunrise Loop',            type: 'Run',          date: 'Jul 14, 2026', dist: '6.2 km',  time: '32:10',   elev: '48 m',  shape: 'loop',       seed: 11, hasGps: true },
            { id: 'a2',  name: 'Boulder Creek Path',      type: 'Ride',         date: 'Jul 12, 2026', dist: '24.8 km', time: '58:22',   elev: '112 m', shape: 'river',      seed: 22, hasGps: true },
            { id: 'a3',  name: 'Lunch Grid Miles',        type: 'Run',          date: 'Jul 10, 2026', dist: '8.4 km',  time: '44:05',   elev: '31 m',  shape: 'grid',       seed: 33, hasGps: true },
            { id: 'a4',  name: 'Flagstaff Switchbacks',   type: 'Hike',         date: 'Jul 6, 2026',  dist: '9.1 km',  time: '2:12:40', elev: '540 m', shape: 'switchback', seed: 44, hasGps: true },
            { id: 'a5',  name: 'Figure-Eight Tempo',      type: 'Run',          date: 'Jul 3, 2026',  dist: '10.0 km', time: '47:51',   elev: '55 m',  shape: 'figure8',    seed: 55, hasGps: true },
            { id: 'a6',  name: 'Reservoir Out & Back',    type: 'Ride',         date: 'Jun 29, 2026', dist: '31.5 km', time: '1:14:09', elev: '96 m',  shape: 'outback',    seed: 66, hasGps: true },
            { id: 'a7',  name: 'Neighborhood Shakeout',   type: 'Run',          date: 'Jun 27, 2026', dist: '4.1 km',  time: '22:36',   elev: '18 m',  shape: 'loop',       seed: 77, hasGps: true },
            { id: 'a8',  name: 'Gravel Grinder 40',       type: 'Gravel Ride',  date: 'Jun 21, 2026', dist: '41.7 km', time: '1:52:33', elev: '388 m', shape: 'river',      seed: 88, hasGps: true },
            { id: 'a9',  name: 'Track Tuesday',           type: 'Run',          date: 'Jun 17, 2026', dist: '7.2 km',  time: '31:44',   elev: '4 m',   shape: 'track',      seed: 99, hasGps: true },
            { id: 'a10', name: 'Evening Trainer Spin',    type: 'Virtual Ride', date: 'Jun 15, 2026', dist: '20.0 km', time: '40:00',   elev: '—',     hasGps: false },
            { id: 'a11', name: 'Hotel Treadmill 5K',      type: 'Run',          date: 'Jun 12, 2026', dist: '5.0 km',  time: '26:30',   elev: '—',     hasGps: false }
        ];
        // Pre-generate route points once so thumbnails and GPX match
        FAKE_ACTIVITIES.forEach(a => {
            if (a.hasGps) a.points = genRoutePoints(a.shape, a.seed);
        });

        // ---- Overlay / view management ----
        function showStravaView(name) {
            Object.values(stravaViews).forEach(v => v.classList.remove('active'));
            if (stravaViews[name]) stravaViews[name].classList.add('active');
            stravaWindow.classList.toggle('wide', name === 'dash');
        }

        // Shared overlay: 'abstract' = multi-select + Add to canvas,
        // 'topo' = single-select, loads straight onto the Topo canvas.
        let stravaOverlayMode = 'abstract';
        async function openStravaOverlay(mode) {
            stravaOverlayMode = (mode === 'topo') ? 'topo' : 'abstract';
            console.log('[ABS] openStravaOverlay mode:', stravaOverlayMode, 'local stravaConnected:', stravaConnected);
            // Footer (multi-select + import) only makes sense in Abstract mode
            const footer = document.getElementById('dashFooter');
            if (footer) footer.style.display = stravaOverlayMode === 'topo' ? 'none' : 'flex';
            selectedActivityIds.clear();
            stravaOverlay.classList.add('open');
            showStravaView('loading');
            // Ask the SERVER whether we're connected — don't trust the local flag,
            // which may be stale if the user connected from the other tab.
            try {
                const res = await fetch(`${window.BACKEND_URL}/api/status`, { cache: 'no-store' });
                const s = await res.json();
                console.log('[ABS] server status:', s);
                if (s.connected) {
                    stravaConnected = true;
                    stravaReal = true;
                    loadRealActivities();
                    return;
                }
            } catch (e) { console.warn('[ABS] status check failed:', e.message); }
            // not connected → show the real Connect launcher
            stravaConnected = false;
            stravaConnectNote.style.display = stravaReal ? 'none' : 'block';
            showStravaView('connect');
        }
        window._openStravaOverlay = openStravaOverlay;
        function closeStravaOverlay() {
            stravaOverlay.classList.remove('open');
        }

        // Kick off the real Strava OAuth handshake. The browser is sent to
        // the server's /auth/login, which redirects to Strava's own sign-in
        // and authorization page; Strava returns to the server callback,
        // which exchanges the code for a token. The app never sees the
        // user's Strava credentials.
        function startStravaOAuth() {
            if (!stravaReal) {
                stravaConnectNote.style.display = 'block';
                dbg('Strava connect requested, but no backend detected — the server is required for OAuth', true);
                return;
            }
            showStravaView('loading');
            try{ localStorage.setItem('gpxsketch_tab', document.body.dataset.app || 'abstract'); }catch(e){}
            window.location.href = `${window.BACKEND_URL}/auth/login`;
        }

        stravaConnectButton.addEventListener('click', openStravaOverlay);
        stravaConnectStartButton.addEventListener('click', startStravaOAuth);
        stravaCloseButton.addEventListener('click', closeStravaOverlay);
        stravaOverlay.addEventListener('click', (e) => {
            if (e.target === stravaOverlay) closeStravaOverlay();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key !== 'Escape') return;
            // The channel picker row has no Back cell — Escape is the way out.
            if (dockMode === 'pick' && dockShapeObj) { renderDock('shape', dockShapeObj); return; }
            if (stravaOverlay.classList.contains('open')) closeStravaOverlay();
        });

        stravaDisconnectButton.addEventListener('click', () => {
            console.log('[ABS] disconnect clicked. mode:', stravaOverlayMode, '_setTopoStravaUI exists:', !!window._setTopoStravaUI);
            if (stravaReal) { fetch(`${window.BACKEND_URL}/auth/logout`).catch(() => {}); }
            stravaConnected = false;
            selectedActivityIds.clear();
            stravaConnectButton.classList.remove('connected');
            stravaConnectButton.querySelector('.strava-mark').style.display = '';
            stravaConnectLabel.textContent = 'Connect with Strava';
            // Keep the Topo sidebar button in sync (shared connection)
            if (window._setTopoStravaUI) window._setTopoStravaUI(false);
            if (stravaOverlayMode === 'topo') { closeStravaOverlay(); return; }
            showStravaView('connect');
        });

        // ---- Dashboard ----
        // Include the unique Strava id in the filename. Activity titles are
        // heavily duplicated ("Morning Run", "Lunch Ride"), so a title-only
        // slug made distinct rides collide and silently dedupe each other away.
        function activityFileName(a) {
            const slug = String(a.name || 'activity').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
            return 'strava_' + a.id + (slug ? '_' + slug : '') + '.gpx';
        }

        function isActivityImported(a) {
            return loadedFiles.some(f => f.gpxSource === 'strava' && f.stravaId === a.id);
        }

        // subtle contour lines + a little "peak" ring, drawn behind every route
        const TOPO_CONTOURS =
            '<g class="topo">' +
            '<path d="M-4 46 C 12 38, 24 44, 36 40 S 62 32, 90 38"/>' +
            '<path d="M-4 53 C 14 46, 30 52, 46 47 S 72 42, 90 47"/>' +
            '<path d="M-4 20 C 10 14, 22 19, 34 15 S 60 9, 90 15"/>' +
            '<path d="M56 26 C 53 20, 60 15, 67 16 C 74 17, 76 23, 71 26 C 66 29, 58 30, 56 26 Z"/>' +
            '<path d="M61 24 C 59.5 21, 63 18.5, 66.5 19 C 70 19.5, 71 22.5, 68.5 24 C 66 25.5, 62 26, 61 24 Z"/>' +
            '</g>';

        function buildDashboard() {
            dashList.innerHTML = '';
            const withGps = dashActivities || [];
            const withoutGps = dashHiddenCount;
            const shown = Math.min(dashVisibleCount, withGps.length);
            dashFilterNote.textContent =
                `Showing ${shown} of ${withGps.length} activities with GPS data` +
                (withoutGps > 0 ? ` · ${withoutGps} indoor ${withoutGps === 1 ? 'activity' : 'activities'} hidden (no route to draw)` : '');

            withGps.slice(0, shown).forEach(a => {
                const card = document.createElement('div');
                card.className = 'activity-card';
                card.dataset.id = a.id;

                const thumb = document.createElement('div');
                thumb.className = 'activity-thumb';
                const poly = pointsToThumbPolyline(a.thumbPoints || a.points, 86, 60, 7);
                const startPt = poly.split(' ')[0].split(',');
                thumb.innerHTML =
                    `<svg viewBox="0 0 86 60">${TOPO_CONTOURS}<polyline points="${poly}"/><circle class="thumb-start" cx="${startPt[0]}" cy="${startPt[1]}" r="2"/></svg>`;

                const info = document.createElement('div');
                info.className = 'activity-info';
                info.innerHTML =
                    `<div class="activity-title">${a.name}</div>
                     <div class="activity-meta">
                        <span class="m">${a.type}</span>
                        <span class="m">${a.date}</span>
                        <span class="m">${a.dist}</span>
                        <span class="m">${a.time}</span>
                        <span class="m">↑ ${a.elev}</span>
                     </div>`;

                const badge = document.createElement('span');
                badge.className = 'selected-badge';
                badge.textContent = 'Selected';

                const onTag = document.createElement('span');
                onTag.className = 'oncanvas-tag';
                onTag.textContent = 'Added ✓';
                onTag.style.display = isActivityImported(a) ? 'block' : 'none';

                card.appendChild(thumb);
                card.appendChild(info);
                card.appendChild(badge);
                card.appendChild(onTag);

                if (selectedActivityIds.has(a.id)) card.classList.add('selected');

                card.addEventListener('click', async () => {
                    console.log('[ABS] card clicked. mode:', stravaOverlayMode, 'activity:', a.id, a.name);
                    if (stravaOverlayMode === 'topo') {
                        // Single-select: load straight onto the Topo canvas and close
                        console.log('[ABS] TOPO branch — calling _loadTopoStravaRoute');
                        closeStravaOverlay();
                        if (window._loadTopoStravaRoute) await window._loadTopoStravaRoute(a.id, a.name);
                        else console.error('[ABS] _loadTopoStravaRoute is MISSING');
                        return;
                    }
                    console.log('[ABS] ABSTRACT branch — multi-select');
                    if (selectedActivityIds.has(a.id)) {
                        selectedActivityIds.delete(a.id);
                        card.classList.remove('selected');
                    } else {
                        selectedActivityIds.add(a.id);
                        card.classList.add('selected');
                    }
                    updateDashFooter();
                });

                dashList.appendChild(card);
            });
            appendLoadMoreButton(shown, withGps.length);
            updateDashFooter();
        }

        // "Load More" reveals the next batch of already-loaded activities;
        // once those are exhausted, in real mode it tries to pull another
        // page from the Strava backend (batches of 10). Demo mode has the
        // full list up front, so it only ever reveals locally.
        function appendLoadMoreButton(shown, total) {
            const moreOnClient = shown < total;
            const canFetchMore = stravaReal && !dashServerExhausted;
            if (!moreOnClient && !canFetchMore) return;
            const wrap = document.createElement('div');
            wrap.className = 'dash-loadmore-wrap';
            const btn = document.createElement('button');
            btn.className = 'dash-loadmore';
            const remaining = total - shown;
            btn.textContent = moreOnClient
                ? `Load ${Math.min(DASH_BATCH, remaining)} more`
                : 'Load more from Strava';
            btn.addEventListener('click', () => onLoadMore(btn));
            wrap.appendChild(btn);
            dashList.appendChild(wrap);
        }

        async function onLoadMore(btn) {
            const total = (dashActivities || []).length;
            if (dashVisibleCount < total) {
                dashVisibleCount = Math.min(dashVisibleCount + DASH_BATCH, total);
                buildDashboard();
                return;
            }
            if (stravaReal && !dashServerExhausted) {
                btn.disabled = true;
                btn.textContent = 'Loading…';
                const before = (dashActivities || []).length;
                await fetchMoreRealActivities();
                const after = (dashActivities || []).length;
                if (after > before) {
                    // reveal just the next batch; the rest stays buffered
                    dashVisibleCount = Math.min(dashVisibleCount + DASH_BATCH, after);
                }
                // if this page was all-indoor (no new GPS) but the server says
                // there's more, the button stays so the user can keep pulling
                buildDashboard();
            }
        }

        async function fetchMoreRealActivities() {
            try {
                const res = await fetch(`${window.BACKEND_URL}/api/activities?page=${dashNextPage}`);
                // Don't let a dropped session masquerade as "no more activities"
                if (res.status === 401) { handleAuthLoss('load more'); return; }
                if (!res.ok) { dashServerExhausted = true; return; }
                const data = await res.json();
                const incoming = data.activities || [];
                if (data.hiddenCount) dashHiddenCount += data.hiddenCount;
                const existing = new Set((dashActivities || []).map(a => a.id));
                const fresh = incoming.filter(a => !existing.has(a.id));
                if (fresh.length) dashActivities = (dashActivities || []).concat(fresh);
                if (typeof data.nextPage === 'number') dashNextPage = data.nextPage;
                if (data.hasMore === false) dashServerExhausted = true;
                dbg(`strava: +${fresh.length} (nextPage ${dashNextPage}, more=${data.hasMore !== false}), total ${(dashActivities || []).length}`);
            } catch (e) {
                dbg('load more failed: ' + e.message, true);
                dashServerExhausted = true;
            }
        }

        function updateDashFooter() {
            const n = selectedActivityIds.size;
            const room = routeSlotsLeft();
            // Say up front how many will actually land, rather than importing
            // a pile and reporting the shortfall afterwards.
            const willFit = Math.min(n, room);
            dashCount.textContent = room === 0
                ? `Canvas full — ${MAX_ROUTES}/${MAX_ROUTES} routes`
                : `${n} selected · room for ${room}`;
            stravaImportButton.disabled = n === 0 || room === 0;
            stravaImportButton.textContent = n === 0
                ? 'Add to canvas'
                : (n > room ? `Add ${willFit} of ${n}` : `Add ${n} to canvas`);
            dashSelectAll.textContent = (n === (dashActivities || []).length && n > 0) ? 'Clear selection' : 'Select all';
        }

        function refreshDashSelectionState() {
            // keep "Added" tags accurate if user removes chips while dash is open
            if (stravaConnected) buildDashboard();
        }

        dashSelectAll.addEventListener('click', () => {
            const withGps = dashActivities || [];
            if (selectedActivityIds.size === withGps.length) {
                selectedActivityIds.clear();
            } else {
                withGps.forEach(a => selectedActivityIds.add(a.id));
            }
            buildDashboard();
        });

        stravaImportButton.addEventListener('click', async () => {
            const toImport = (dashActivities || []).filter(a => selectedActivityIds.has(a.id));
            stravaImportButton.disabled = true;
            stravaImportButton.textContent = 'Importing…';
            let added = 0, skipped = 0, failed = 0, noRoom = 0, authLost = false;
            for (const a of toImport) {
                const fname = activityFileName(a);
                // Dedup on the unique Strava id, not the (often duplicated) title.
                if (loadedFiles.some(f => f.gpxSource === 'strava' && f.stravaId === a.id)) { skipped++; continue; }
                // Stop at the ceiling rather than importing routes that can't be drawn.
                if (loadedFiles.length >= MAX_ROUTES) { noRoom++; continue; }
                try {
                    let points = a.points;
                    if (stravaReal) {
                        const res = await fetch(`${window.BACKEND_URL}/api/streams/` + a.id);
                        // One 401 means every remaining request will 401 too,
                        // so stop rather than grinding through the whole batch.
                        if (res.status === 401) { authLost = true; break; }
                        if (!res.ok) throw new Error('HTTP ' + res.status);
                        points = (await res.json()).points;
                    }
                    if (!points || points.length < 2) throw new Error('no GPS points in this activity');
                    const gpx = pointsToGpx(points, a.name);
                    const file = new File([gpx], fname, { type: 'application/gpx+xml' });
                    file.gpxSource = 'strava';
                    file.stravaId = a.id;
                    file.displayName = a.name;
                    // Strava's own stats: pointsToGpx writes lat/lon only, so
                    // elevation and moving time can't be recovered from the
                    // GPX later. Keep them here or they're lost on import.
                    file.stravaMeta = {
                        type: a.type, date: a.date,
                        dist: a.dist, time: a.time, elev: a.elev
                    };
                    file.thumbPoints = a.thumbPoints || downsample(points, 90);
                    ensureRouteUid(file);
                    file.meta = {
                        thumbPoints: file.thumbPoints,
                        segments: 1,
                        points: points.length
                    };
                    loadedFiles.push(file);
                    added++;
                } catch (e) {
                    failed++;
                    dbg(`import failed for ${a.name}: ${e.message}`, true);
                }
            }
            renderRouteList();

            if (authLost) {
                stravaImportButton.disabled = false;
                stravaImportButton.textContent = 'Add to canvas';
                handleAuthLoss('import');
                if (added > 0) showModal(`${added} added before the Strava session dropped. Reconnect to import the rest.`);
                else showModal('The Strava session dropped before importing. Reconnect and try again.');
                return;
            }

            selectedActivityIds.clear();
            closeStravaOverlay();
            dbg(`strava import: ${added} added, ${skipped} already loaded, ${noRoom} over limit, ${failed} failed (${loadedFiles.length}/${MAX_ROUTES} routes)`);
            // "Add to canvas" means exactly that — draw it, don't ask again.
            if (added > 0) {
                await addRoutesToArt('strava import');
                if (noRoom > 0) {
                    showModal(`Added ${added}, but ${MAX_ROUTES} routes is the limit for one piece so ${noRoom} didn't fit. Remove a route to make room.`);
                }
            } else if (noRoom > 0) {
                showModal(`You're at the ${MAX_ROUTES}-route limit. Remove a route from the Routes panel to add more.`);
            } else if (failed > 0) {
                showModal('None of those activities could be imported. Press Ctrl+D (Cmd+D on Mac) for the debug log.');
            }
        });

})();
