export type DiagnosticSeverity = 'error' | 'warning' | 'success';

export interface CodeDiagnostic {
  id: string;
  severity: DiagnosticSeverity;
  code: string;
  title: string;
  explanation: string;
  fix?: string;
  line?: number;
  column?: number;
}

const locationOf = (source: string, search: string): { line: number; column: number } | undefined => {
  const index = source.indexOf(search);
  if (index < 0) return undefined;
  const before = source.slice(0, index).split('\n');
  return { line: before.length, column: before.at(-1)!.length + 1 };
};

const diagnostic = (partial: Omit<CodeDiagnostic, 'id'>): CodeDiagnostic => ({
  ...partial,
  id: `${partial.code}-${partial.line ?? 0}-${partial.title}`,
});

const required = (
  source: string,
  pattern: RegExp,
  code: string,
  title: string,
  explanation: string,
  fix: string,
  locationSearch?: string,
): CodeDiagnostic => diagnostic({
  severity: pattern.test(source) ? 'success' : 'error', code, title, explanation, fix,
  ...(locationSearch ? locationOf(source, locationSearch) : undefined),
});

function structuralDiagnostics(source: string): CodeDiagnostic[] {
  const results: CodeDiagnostic[] = [];
  const pairs: Record<string, string> = { ')': '(', ']': '[', '}': '{' };
  const stack: { char: string; index: number }[] = [];
  let inString = false;
  let escaped = false;

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (char === '"' && !escaped) inString = !inString;
    escaped = char === '\\' && !escaped;
    if (char !== '\\') escaped = false;
    if (inString) continue;
    if ('({['.includes(char)) stack.push({ char, index });
    if (')}]'.includes(char)) {
      const open = stack.pop();
      if (!open || open.char !== pairs[char]) {
        const loc = locationOf(source, source.slice(index, index + 1));
        results.push(diagnostic({ severity: 'error', code: 'CS1513', title: 'Parantez dengesi bozuk', explanation: `\`${char}\` karakterinin karşılığı doğru yerde bulunamadı.`, fix: 'Açılan her parantezi doğru sırada kapat.', ...loc }));
        break;
      }
    }
  }

  if (inString) results.push(diagnostic({ severity: 'error', code: 'CS1010', title: 'Metin kapanmamış', explanation: 'Çift tırnak ile başlayan metin aynı satırda kapanmıyor.', fix: 'Metnin sonuna bir çift tırnak ekle.' }));
  if (stack.length) {
    const open = stack.at(-1)!;
    const before = source.slice(0, open.index).split('\n');
    results.push(diagnostic({ severity: 'error', code: 'CS1513', title: 'Kapanış parantezi eksik', explanation: `\`${open.char}\` ile açılan blok kapanmamış.`, fix: open.char === '{' ? 'Bloğun sonuna `}` ekle.' : 'Açılan parantezi kapat.', line: before.length, column: before.at(-1)!.length + 1 }));
  }

  source.split('\n').forEach((rawLine, index) => {
    const line = rawLine.replace(/\/\/.*$/, '').trim();
    const declarationWithoutSemicolon = /^(?:\[SerializeField\]\s*)?(?:(?:public|private|protected|internal|static|readonly)\s+)*(?:bool|int|float|string|Rigidbody|Collider|Transform)\s+[A-Za-z_]\w*\s*=?.+/.test(line) && !/[;{}]$/.test(line);
    const logWithoutSemicolon = /\bDebug\.Log\s*\([^;]+\)$/.test(line);
    if (declarationWithoutSemicolon || logWithoutSemicolon) {
      results.push(diagnostic({ severity: 'error', code: 'CS1002', title: 'Noktalı virgül bekleniyor', explanation: 'C# bu ifadeyi bitmiş bir komut olarak okuyabilmek için satır sonunda `;` bekler.', fix: 'İfadenin sonuna `;` ekle.', line: index + 1, column: rawLine.length + 1 }));
    }
  });
  return results;
}

function identifierDiagnostics(source: string, expectedIdentifiers: string[]): CodeDiagnostic[] {
  const declarations = [...source.matchAll(/\b(?:bool|int|float|string|Rigidbody|Collider|Transform)\s+([A-Za-z_]\w*)\b/g)].map((match) => match[1]);
  const logReferences = [...source.matchAll(/\bDebug\.Log\s*\(\s*([A-Za-z_]\w*)(?:\.\w+)?\s*\)/g)];
  const results: CodeDiagnostic[] = [];

  const duplicates = declarations.filter((name, index) => declarations.indexOf(name) !== index);
  [...new Set(duplicates)].forEach((name) => {
    const loc = locationOf(source, name);
    results.push(diagnostic({ severity: 'error', code: 'CS0102', title: `\`${name}\` birden fazla tanımlanmış`, explanation: 'Aynı scope içinde aynı ada sahip ikinci bir sembol oluşturulamaz.', fix: 'Tekrarlanan tanımı kaldır veya farklı sorumluluğu olan değişkene açıklayıcı başka bir ad ver.', ...loc }));
  });

  for (const match of logReferences) {
    const used = match[1];
    if (declarations.includes(used) || used === 'this') continue;
    const casingMatch = declarations.find((name) => name.toLowerCase() === used.toLowerCase());
    const loc = locationOf(source, used);
    if (casingMatch) {
      const canonical = expectedIdentifiers.find((name) => name.toLowerCase() === used.toLowerCase());
      const declarationHasWrongCase = canonical === used && casingMatch !== canonical;
      results.push(diagnostic({
        severity: 'error', code: 'CS0103', title: `\`${used}\` adı bulunamadı`,
        explanation: `C# büyük/küçük harfe duyarlıdır. Değişken \`${casingMatch}\` olarak tanımlanmış, fakat burada \`${used}\` yazılmış. Bunlar iki farklı semboldür.`,
        fix: declarationHasWrongCase
          ? `Yanlış yazılmış \`${casingMatch}\` tanımını ve ona ait bütün kullanımları \`${canonical}\` olarak yeniden adlandır.`
          : `Bu kullanımı tanımdaki doğru ad olan \`${canonical ?? casingMatch}\` biçimine getir.`, ...loc,
      }));
    } else {
      results.push(diagnostic({ severity: 'error', code: 'CS0103', title: `\`${used}\` geçerli bağlamda yok`, explanation: 'Kullanılan isim için erişilebilir bir değişken veya parametre tanımı bulunamadı.', fix: `Önce \`${used}\` değişkenini tanımla veya doğru değişken adını kullan.`, ...loc }));
    }
  }

  const wrongDebugCase = source.match(/\bdebug\.log\b/i)?.[0];
  if (wrongDebugCase && wrongDebugCase !== 'Debug.Log') {
    const loc = locationOf(source, wrongDebugCase);
    results.push(diagnostic({ severity: 'error', code: 'CS0103', title: `\`${wrongDebugCase}\` geçerli bir Unity çağrısı değil`, explanation: 'Tür ve metod adları da case-sensitive çalışır. Doğru API adı `Debug.Log` biçimindedir.', fix: `\`${wrongDebugCase}\` ifadesini \`Debug.Log\` olarak değiştir.`, ...loc }));
  }
  return results;
}

export function validateLessonCode(lessonId: string, source: string): CodeDiagnostic[] {
  const expectedIdentifiers: Record<string, string[]> = {
    'lesson-2': ['packageCount', 'isGameActive', 'playerName'],
    'lesson-3': ['lives'],
    'lesson-5': ['playerRigidbody', 'other'],
  };
  const common = [...structuralDiagnostics(source), ...identifierDiagnostics(source, expectedIdentifiers[lessonId] ?? [])];
  const checks: Record<string, CodeDiagnostic[]> = {
    'lesson-1': [
      required(source, /public\s+class\s+FirstScript\s*:\s*MonoBehaviour/, 'ULP1001', '`FirstScript` sınıfı hazır', 'Dosyadaki ana sınıf Unity Component davranışını `MonoBehaviour` üzerinden alır.', '`public class FirstScript : MonoBehaviour` yaz.'),
      required(source, /void\s+Start\s*\(\s*\)\s*{[\s\S]*?Debug\.Log\s*\(\s*"[^"\n]+"\s*\)\s*;[\s\S]*?}/, 'ULP1002', '`Start` içinde Console çıktısı var', '`Debug.Log` çağrısı `Start` metodunun gövdesinde ve geçerli bir metin alıyor.', '`Start` içine `Debug.Log("Unity hazır");` ekle.', 'Start'),
    ],
    'lesson-2': [
      required(source, /\bint\s+packageCount\s*=\s*\d+\s*;/, 'ULP2001', '`packageCount` bir `int`', 'Adet bilgisi tam sayı türünde ve camelCase adıyla tanımlanmış.', '`int packageCount = 0;` biçimini kullan.', 'packageCount'),
      required(source, /\bbool\s+isGameActive\s*=\s*(?:true|false)\s*;/, 'ULP2002', '`isGameActive` bir `bool`', 'İki durumlu oyun bilgisi `bool` olarak tanımlanmış.', '`bool isGameActive = true;` biçimini kullan.', 'isGameActive'),
      required(source, /\bstring\s+playerName\s*=\s*"[^"\n]+"\s*;/, 'ULP2003', '`playerName` bir `string`', 'Metin değeri çift tırnak içinde saklanıyor.', '`string playerName = "Player";` biçimini kullan.', 'playerName'),
      required(source, /\bDebug\.Log\s*\(\s*packageCount\s*\)\s*;/, 'ULP2004', 'Doğru değişken Console’a gönderiliyor', 'Kullanılan ad tanımdaki `packageCount` sembolüyle birebir eşleşiyor.', '`Debug.Log(packageCount);` yaz.', 'Debug.Log'),
    ],
    'lesson-3': [
      required(source, /\bint\s+lives\s*=\s*-?\d+\s*;/, 'ULP3001', '`lives` tam sayı olarak tanımlı', 'Can adedi bir `int` değerinde tutuluyor.', '`private int lives = 3;` biçimini kullan.', 'lives'),
      required(source, /if\s*\(\s*lives\s*>\s*0\s*\)\s*{[\s\S]*?Debug\.Log[\s\S]*?}/, 'ULP3002', 'Pozitif can koşulu var', '`lives > 0` sonucu `true` olduğunda ilgili blok çalışır.', '`if (lives > 0) { Debug.Log("Devam"); }` yaz.', 'if'),
      required(source, /else\s*{[\s\S]*?Debug\.Log[\s\S]*?}/, 'ULP3003', 'Alternatif yol kapsanmış', 'Koşul `false` olduğunda `else` bloğu gözlemlenebilir çıktı üretir.', '`else { Debug.Log("Oyun bitti"); }` ekle.', 'else'),
    ],
    'lesson-4': ['Awake', 'OnEnable', 'Start'].map((method, index) => required(source, new RegExp(`void\\s+${method}\\s*\\(\\s*\\)\\s*{[\\s\\S]*?Debug\\.Log\\s*\\(\\s*"[^"\\n]*${method}[^"\\n]*"\\s*\\)\\s*;[\\s\\S]*?}`), `ULP40${index + 1}`, `\`${method}\` gözlemlenebilir`, `Unity \`${method}\` metodunu çağırdığında Console’da ayırt edilebilir bir mesaj oluşur.`, `\`void ${method}()\` oluştur ve içine \`Debug.Log("${method}");\` ekle.`, method)),
    'lesson-5': [
      required(source, /\[SerializeField\]\s*private\s+Rigidbody\s+playerRigidbody\s*;/, 'ULP5001', 'Rigidbody alanı kapsüllenmiş', 'Referans Inspector’da görünürken dış sınıflara açık değildir.', '`[SerializeField] private Rigidbody playerRigidbody;` yaz.', 'playerRigidbody'),
      required(source, /void\s+OnTriggerEnter\s*\(\s*Collider\s+other\s*\)\s*{[\s\S]*?Debug\.Log\s*\(\s*other\.name\s*\)\s*;[\s\S]*?}/, 'ULP5002', 'Trigger callback’i doğru imzaya sahip', 'Unity callback imzası, parametre adı ve kullanım aynı sembolü gösteriyor.', '`void OnTriggerEnter(Collider other)` içine `Debug.Log(other.name);` yaz.', 'OnTriggerEnter'),
    ],
  };

  const lessonChecks = checks[lessonId] ?? [];
  const hasBlockingCommonError = common.some((item) => item.severity === 'error');
  return [...common, ...lessonChecks.map((item) => hasBlockingCommonError && item.severity === 'success' ? { ...item, severity: 'warning' as const, explanation: `${item.explanation} Ancak yukarıdaki derleme hatası çözülmeden bu bölüm çalıştırılamaz.` } : item)];
}
