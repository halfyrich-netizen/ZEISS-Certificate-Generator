/**
 * Utility to manage loading local ZEISS Frutiger Next fonts from user's computer:
 * 1. Automatic local(...) font-face definitions for installed system fonts
 * 2. Chromium Local Font Access API (window.queryLocalFonts)
 * 3. Drag-and-drop or file picker for local .otf / .ttf / .woff font files
 * 4. Persistent caching in IndexedDB so uploaded fonts remain active across sessions
 */

const DB_NAME = 'zeiss_certificate_fonts';
const STORE_NAME = 'fonts';

interface StoredFont {
  name: string;
  family: string;
  weight: string;
  style: string;
  buffer: ArrayBuffer;
}

function openFontDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'name' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveFontToDb(font: StoredFont): Promise<void> {
  const db = await openFontDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(font);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getFontsFromDb(): Promise<StoredFont[]> {
  try {
    const db = await openFontDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

export async function clearFontsFromDb(): Promise<void> {
  const db = await openFontDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Determine font metadata from filename or font name
 */
export function inferFontFamily(filenameOrPostscript: string): {
  family: string;
  weight: string;
  style: string;
} {
  const lower = filenameOrPostscript.toLowerCase();

  let family = 'ZEISS Frutiger Next W1G';
  let weight = '400';
  let style = 'normal';

  if (lower.includes('bold') && (lower.includes('cond') || lower.includes('cn'))) {
    family = 'ZEISS Frutiger Next W1G Bold Condensed';
    weight = '700';
  } else if (lower.includes('light') || lower.includes('ltcn') || lower.includes('lt')) {
    family = 'ZEISS Frutiger Next W1G Light Condensed';
    weight = '300';
  } else if (lower.includes('med') || lower.includes('mdcn') || lower.includes('md')) {
    family = 'ZEISS Frutiger Next W1G Medium Condensed';
    weight = '500';
  } else if (lower.includes('bold')) {
    family = 'ZEISS Frutiger Next W1G Bold Condensed';
    weight = '700';
  } else if (lower.includes('reg') || lower.includes('regular')) {
    family = 'ZEISS Frutiger Next W1G Regular';
    weight = '400';
  }

  if (lower.includes('italic') || lower.includes('it')) {
    style = 'italic';
  }

  return { family, weight, style };
}

/**
 * Register a font buffer into document.fonts
 */
export async function registerFontFace(
  family: string,
  buffer: ArrayBuffer,
  weight: string = 'normal',
  style: string = 'normal'
): Promise<FontFace> {
  const fontFace = new FontFace(family, buffer, { weight, style });
  const loaded = await fontFace.load();
  document.fonts.add(loaded);
  return loaded;
}

/**
 * Initialize cached fonts from IndexedDB on startup
 */
export async function loadCachedFonts(): Promise<number> {
  try {
    const cached = await getFontsFromDb();
    let loadedCount = 0;
    for (const item of cached) {
      try {
        await registerFontFace(item.family, item.buffer, item.weight, item.style);
        loadedCount++;
      } catch (e) {
        console.warn('Failed to load cached font:', item.name, e);
      }
    }
    return loadedCount;
  } catch (err) {
    console.warn('IndexedDB font loading error:', err);
    return 0;
  }
}

/**
 * Query local system fonts using Chromium Local Font Access API
 */
export async function queryAndLoadLocalZeissFonts(): Promise<{
  success: boolean;
  count: number;
  message: string;
}> {
  if (!('queryLocalFonts' in window)) {
    return {
      success: false,
      count: 0,
      message: 'Local Font Access API is not supported in this browser. Please use the file upload option below.',
    };
  }

  try {
    const localFonts = await (window as any).queryLocalFonts();
    const zeissFonts = localFonts.filter((f: any) => {
      const fam = (f.family || '').toLowerCase();
      const full = (f.fullName || '').toLowerCase();
      const ps = (f.postscriptName || '').toLowerCase();
      return (
        fam.includes('zeiss') ||
        full.includes('zeiss') ||
        ps.includes('zeiss') ||
        fam.includes('frutiger next') ||
        ps.includes('frutigernext')
      );
    });

    if (zeissFonts.length === 0) {
      return {
        success: false,
        count: 0,
        message: 'No fonts containing "ZEISS" or "Frutiger Next" were found on your local computer.',
      };
    }

    let loadedCount = 0;
    for (const fontData of zeissFonts) {
      try {
        const blob = await fontData.blob();
        const buffer = await blob.arrayBuffer();
        const info = inferFontFamily(fontData.postscriptName || fontData.fullName || fontData.family);
        
        await registerFontFace(info.family, buffer, info.weight, info.style);
        await saveFontToDb({
          name: fontData.postscriptName || fontData.fullName,
          family: info.family,
          weight: info.weight,
          style: info.style,
          buffer,
        });
        loadedCount++;
      } catch (err) {
        console.warn('Error reading font blob:', fontData, err);
      }
    }

    return {
      success: loadedCount > 0,
      count: loadedCount,
      message: `Successfully loaded ${loadedCount} ZEISS font(s) from your local computer.`,
    };
  } catch (err: any) {
    return {
      success: false,
      count: 0,
      message: err.message || 'Permission denied or unable to access local fonts.',
    };
  }
}

/**
 * Load font files selected by user
 */
export async function loadFontFiles(files: FileList | File[]): Promise<{
  count: number;
  names: string[];
}> {
  const loadedNames: string[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const buffer = await file.arrayBuffer();
    const info = inferFontFamily(file.name);

    await registerFontFace(info.family, buffer, info.weight, info.style);
    await saveFontToDb({
      name: file.name,
      family: info.family,
      weight: info.weight,
      style: info.style,
      buffer,
    });
    loadedNames.push(file.name);
  }

  return {
    count: loadedNames.length,
    names: loadedNames,
  };
}

/**
 * Check if ZEISS fonts are active in document.fonts
 */
export function checkZeissFontStatus(): boolean {
  if (typeof document === 'undefined' || !document.fonts) return false;
  return (
    document.fonts.check('16px "ZEISS Frutiger Next W1G Light Condensed"') ||
    document.fonts.check('30px "ZEISS Frutiger Next W1G Bold Condensed"') ||
    document.fonts.check('24px "ZEISS Frutiger Next W1G Regular"')
  );
}
