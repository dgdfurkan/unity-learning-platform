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
  fileName?: string;
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

const maskCommentsAndStrings = (source: string): string => source
  .replace(/\/\/[^\n]*/g, (value) => ' '.repeat(value.length))
  .replace(/"(?:\\.|[^"\\])*"/g, (value) => ' '.repeat(value.length));

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
  let inLineComment = false;

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];
    if (char === '\n') inLineComment = false;
    if (!inString && char === '/' && next === '/') inLineComment = true;
    if (inLineComment) continue;
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
    const declarationWithoutSemicolon = /^(?:\[SerializeField\]\s*)?(?:(?:public|private|protected|internal|static|readonly)\s+)*(?:bool|int|float|string|Rigidbody|Collider|Transform|List<[^>]+>|[A-Za-z_]\w*\[\])\s+[A-Za-z_]\w*\s*=?.+/.test(line) && !/[;{}]$/.test(line);
    const logWithoutSemicolon = /\bDebug\.Log\s*\([^;]+\)$/.test(line);
    if (declarationWithoutSemicolon || logWithoutSemicolon) {
      results.push(diagnostic({ severity: 'error', code: 'CS1002', title: 'Noktalı virgül bekleniyor', explanation: 'C# bu ifadeyi bitmiş bir komut olarak okuyabilmek için satır sonunda `;` bekler.', fix: 'İfadenin sonuna `;` ekle.', line: index + 1, column: rawLine.length + 1 }));
    }
    const withoutStrings = line.replace(/"(?:\\.|[^"\\])*"/g, '""');
    const looksLikePlainSentence = /^[A-Za-zÇĞİÖŞÜçğıöşü]+\s+.+[.!?]$/.test(withoutStrings)
      && !/^(?:return|throw|new)\b/.test(withoutStrings);
    if (looksLikePlainSentence) {
      results.push(diagnostic({ severity: 'error', code: 'CS1525', title: 'Kod bloğuna düz metin yazılmış', explanation: `\`${line}\` C# komutu değildir. Açıklama yazmak istiyorsan satırı \`//\` ile comment yapmalı; Console’a mesaj göndermek istiyorsan metni \`Debug.Log("...");\` içine almalısın.`, fix: `Comment için \`// ${line}\` veya çıktı için \`Debug.Log("${line.replace(/"/g, '')}");\` kullan.`, line: index + 1, column: rawLine.search(/\S/) + 1 }));
    }
  });
  return results;
}

function identifierDiagnostics(source: string, expectedIdentifiers: string[]): CodeDiagnostic[] {
  const codeOnly = maskCommentsAndStrings(source);
  const declarations = [...codeOnly.matchAll(/\b(?:bool|int|float|string|Rigidbody|Collider|Transform)\s+([A-Za-z_]\w*)\b/g)].map((match) => match[1]);
  const logReferences = [...codeOnly.matchAll(/\bDebug\.Log\s*\(\s*([A-Za-z_]\w*)(?:\.\w+)?\s*\)/g)];
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

  const wrongDebugCase = codeOnly.match(/\bdebug\.log\b/i)?.[0];
  if (wrongDebugCase && wrongDebugCase !== 'Debug.Log') {
    const loc = locationOf(source, wrongDebugCase);
    results.push(diagnostic({ severity: 'error', code: 'CS0103', title: `\`${wrongDebugCase}\` geçerli bir Unity çağrısı değil`, explanation: 'Tür ve metod adları da case-sensitive çalışır. Doğru API adı `Debug.Log` biçimindedir.', fix: `\`${wrongDebugCase}\` ifadesini \`Debug.Log\` olarak değiştir.`, ...loc }));
  }
  return results;
}

function unityConventionDiagnostics(source: string, fileName?: string): CodeDiagnostic[] {
  const results: CodeDiagnostic[] = [];
  const codeOnly = maskCommentsAndStrings(source);
  const callbacks = ['Awake', 'OnEnable', 'Start', 'Update', 'FixedUpdate', 'LateUpdate', 'OnTriggerEnter', 'OnCollisionEnter'];
  const methodMatches = [...codeOnly.matchAll(/\bvoid\s+([A-Za-z_]\w*)\s*\(/g)];

  for (const match of methodMatches) {
    const written = match[1];
    const canonical = callbacks.find((callback) => callback.toLowerCase() === written.toLowerCase());
    if (canonical && canonical !== written) {
      const loc = locationOf(source, written);
      results.push(diagnostic({ severity: 'warning', code: 'UNITY1002', title: `\`${written}\` Unity callback’i olarak çağrılmaz`, explanation: `C# bu metodu derleyebilir; ancak Unity callback adlarını büyük/küçük harf dâhil birebir arar. Doğru ad \`${canonical}\` olmalıdır.`, fix: `Metot adını \`${written}\` yerine \`${canonical}\` yap.`, ...loc }));
    }
  }

  if (fileName) {
    const expectedClass = fileName.replace(/\.cs$/i, '');
    const classMatch = codeOnly.match(/\bpublic\s+class\s+([A-Za-z_]\w*)\s*:\s*MonoBehaviour/);
    if (classMatch && classMatch[1] !== expectedClass) {
      const loc = locationOf(source, classMatch[1]);
      results.push(diagnostic({ severity: 'warning', code: 'UNITY1001', title: 'Dosya adı ile MonoBehaviour sınıfı eşleşmiyor', explanation: `Unity bu Component’i güvenilir biçimde tanıyabilmek için \`${fileName}\` dosyasındaki ana sınıfın \`${expectedClass}\` olmasını bekler; şu anda \`${classMatch[1]}\` yazıyor.`, fix: `Sınıfı \`${expectedClass}\` olarak yeniden adlandır veya dosya adını sınıfla eşleştir.`, ...loc }));
    }
  }
  return results;
}

export function validateCSharpSyntax(source: string, fileName?: string): CodeDiagnostic[] {
  return [...structuralDiagnostics(source), ...identifierDiagnostics(source, []), ...unityConventionDiagnostics(source, fileName)].map((item) => ({ ...item, fileName }));
}

export function validateLessonCode(lessonId: string, source: string, stepId?: string, fileName?: string): CodeDiagnostic[] {
  const expectedIdentifiers: Record<string, string[]> = {
    'lesson-2': ['packageCount', 'isGameActive', 'playerName'],
    'lesson-3': ['lives'],
    'lesson-5': ['playerRigidbody', 'other'],
    'lesson-6': ['index'],
    'lesson-7': ['inventory', 'item'],
    'lesson-8': ['score', 'amount'],
    'lesson-9': ['maxHealth', 'currentHealth', 'CurrentHealth'],
    'lesson-10': ['maxHealth', 'currentHealth'],
  };
  const common = [...structuralDiagnostics(source), ...identifierDiagnostics(source, expectedIdentifiers[lessonId] ?? []), ...unityConventionDiagnostics(source, fileName)];
  const checks: Record<string, CodeDiagnostic[]> = {
    'lesson-1': [
      required(source, /\busing\s+UnityEngine\s*;/, 'ULP1000', '`UnityEngine` namespace’i erişilebilir', '`MonoBehaviour` ve `Debug` gibi Unity türleri bu namespace üzerinden bulunur.', 'Dosyanın başına `using UnityEngine;` yaz.', 'using'),
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
    'lesson-6': [
      required(source, /\busing\s+UnityEngine\s*;/, 'ULP6001', '`UnityEngine` hazır', '`MonoBehaviour` ve `Debug` türleri erişilebilir durumda.', 'Dosyanın başına `using UnityEngine;` ekle.', 'using'),
      required(source, /public\s+class\s+LoopPractice\s*:\s*MonoBehaviour/, 'ULP6002', '`LoopPractice` Component sınıfı hazır', 'Dosya adı, class adı ve `MonoBehaviour` bağlantısı tutarlı.', '`public class LoopPractice : MonoBehaviour` yaz.', 'LoopPractice'),
      required(source, /for\s*\(\s*int\s+index\s*=\s*0\s*;\s*index\s*<\s*3\s*;\s*index\+\+\s*\)\s*{[\s\S]*?Debug\.Log\s*\(\s*index\s*\)\s*;[\s\S]*?}/, 'ULP6003', 'Üç turluk güvenli döngü kuruldu', 'Sayaç 0’dan başlar, 3’e ulaşmadan durur ve her turdaki aynı `index` değeri gözlemlenir.', '`for (int index = 0; index < 3; index++)` gövdesine `Debug.Log(index);` ekle.', 'for'),
    ],
    'lesson-7': [
      required(source, /\busing\s+UnityEngine\s*;/, 'ULP7000', '`UnityEngine` hazır', '`MonoBehaviour` ve `Debug` türleri erişilebilir durumda.', 'Dosyanın başına `using UnityEngine;` ekle.', 'using'),
      required(source, /\busing\s+System\.Collections\.Generic\s*;/, 'ULP7001', 'Generic koleksiyon namespace’i hazır', '`List<T>` türü bu namespace üzerinden bulunur.', 'Dosyaya `using System.Collections.Generic;` ekle.', 'using'),
      required(source, /public\s+class\s+InventoryList\s*:\s*MonoBehaviour/, 'ULP7002', '`InventoryList` Component sınıfı hazır', 'Dosya ve ana class adı Unity beklentisiyle eşleşiyor.', '`public class InventoryList : MonoBehaviour` yaz.', 'InventoryList'),
      required(source, /List\s*<\s*string\s*>\s+inventory\s*=\s*new\s+List\s*<\s*string\s*>\s*\(\s*\)\s*;/, 'ULP7003', 'String List instance’ı oluşturuldu', 'Alan yalnızca bildirilmedi; kullanılabilir boş bir List ile başlatıldı.', '`List<string> inventory = new List<string>();` yaz.', 'inventory'),
      required(source, /inventory\.Add\s*\(\s*"[^"\n]+"\s*\)\s*;[\s\S]*inventory\.Add\s*\(\s*"[^"\n]+"\s*\)\s*;/, 'ULP7004', 'En az iki envanter öğesi eklendi', '`Add` çağrıları çalışma anındaki dinamik içeriği oluşturuyor.', 'Listeye iki farklı metni `inventory.Add("...");` ile ekle.', 'inventory.Add'),
      required(source, /foreach\s*\(\s*string\s+item\s+in\s+inventory\s*\)\s*{[\s\S]*?Debug\.Log\s*\(\s*item\s*\)\s*;[\s\S]*?}/, 'ULP7005', 'Envanter güvenle dolaşılıyor', '`foreach` her geçerli öğeyi index sınırı kurmadan Console’a gönderiyor.', '`foreach (string item in inventory)` gövdesine `Debug.Log(item);` yaz.', 'foreach'),
    ],
    'lesson-8': [
      required(source, /\busing\s+UnityEngine\s*;/, 'ULP8000', '`UnityEngine` hazır', '`MonoBehaviour` ve `Debug` türleri erişilebilir durumda.', 'Dosyanın başına `using UnityEngine;` ekle.', 'using'),
      required(source, /public\s+class\s+ScoreCounter\s*:\s*MonoBehaviour/, 'ULP8001', '`ScoreCounter` tek sorumluluklu Component', 'Class adı skor sorumluluğunu açıkça ifade ediyor.', '`public class ScoreCounter : MonoBehaviour` yaz.', 'ScoreCounter'),
      required(source, /private\s+int\s+score\s*(?:=\s*0\s*)?;/, 'ULP8002', 'Skor durumu private field’da', 'Skor instance boyunca yaşar ve dışarıdan doğrudan değiştirilemez.', '`private int score;` yaz.', 'score'),
      required(source, /(?:public\s+)?void\s+AddPoints\s*\(\s*int\s+amount\s*\)\s*{[\s\S]*?score\s*\+=\s*amount\s*;[\s\S]*?Debug\.Log\s*\(\s*score\s*\)\s*;[\s\S]*?}/, 'ULP8003', '`AddPoints` skor kuralını yönetiyor', 'Parametre yalnızca çağrı girdisi; kalıcı skor field’ı tek metod üzerinden güncelleniyor.', '`void AddPoints(int amount)` içinde `score += amount;` ve `Debug.Log(score);` kullan.', 'AddPoints'),
    ],
    'lesson-9': [
      required(source, /\busing\s+UnityEngine\s*;/, 'ULP9000', '`UnityEngine` hazır', '`MonoBehaviour` ve `SerializeField` türleri erişilebilir durumda.', 'Dosyanın başına `using UnityEngine;` ekle.', 'using'),
      required(source, /public\s+class\s+PlayerConfig\s*:\s*MonoBehaviour/, 'ULP9001', '`PlayerConfig` Component sınıfı hazır', 'Dosya ve class adı aynı sorumluluğu gösteriyor.', '`public class PlayerConfig : MonoBehaviour` yaz.', 'PlayerConfig'),
      required(source, /\[SerializeField\]\s*private\s+int\s+maxHealth\s*(?:=\s*\d+\s*)?;/, 'ULP9002', '`maxHealth` Inspector ayarı kapsüllenmiş', 'Tasarımcı değeri Inspector’dan değiştirebilir; diğer scriptler doğrudan yazamaz.', '`[SerializeField] private int maxHealth = 100;` yaz.', 'maxHealth'),
      required(source, /private\s+int\s+currentHealth\s*;/, 'ULP9003', '`currentHealth` runtime durumu private', 'Çalışma zamanı verisi yalnızca sahibi tarafından değiştirilebilir.', '`private int currentHealth;` yaz.', 'currentHealth'),
      required(source, /public\s+int\s+CurrentHealth\s*=>\s*currentHealth\s*;/, 'ULP9004', 'Read-only health API hazır', 'Dış sistemler değeri okuyabilir fakat setter olmadığı için doğrudan değiştiremez.', '`public int CurrentHealth => currentHealth;` yaz.', 'CurrentHealth'),
    ],
    'lesson-10': [
      required(source, /\busing\s+UnityEngine\s*;/, 'ULP10000', '`UnityEngine` hazır', '`MonoBehaviour`, `Awake` ve `SerializeField` yapıları bu namespace ile kullanılabilir.', 'Dosyanın başına `using UnityEngine;` ekle.', 'using'),
      required(source, /public\s+class\s+PrefabHealth\s*:\s*MonoBehaviour/, 'ULP10001', '`PrefabHealth` Component sınıfı hazır', 'Yeniden kullanılabilir sağlık davranışı ayrı bir Component’tir.', '`public class PrefabHealth : MonoBehaviour` yaz.', 'PrefabHealth'),
      required(source, /\[SerializeField\]\s*private\s+int\s+maxHealth\s*=\s*100\s*;/, 'ULP10002', 'Prefab sağlık ayarı serialized', 'Prefab ve Variant’lar ortak başlangıç ayarını Inspector’dan yapılandırabilir.', '`[SerializeField] private int maxHealth = 100;` yaz.', 'maxHealth'),
      required(source, /private\s+int\s+currentHealth\s*;/, 'ULP10003', 'Instance runtime sağlığı private', 'Her instance kendi çalışma zamanı değerini dış müdahaleden korur.', '`private int currentHealth;` yaz.', 'currentHealth'),
      required(source, /void\s+Awake\s*\(\s*\)\s*{[\s\S]*?currentHealth\s*=\s*maxHealth\s*;[\s\S]*?}/, 'ULP10004', 'Her instance `Awake` içinde başlatılıyor', 'Prefab’dan doğan her Component, kendi runtime sağlığını yapılandırılmış max değerden alır.', '`Awake` içinde `currentHealth = maxHealth;` yaz.', 'Awake'),
    ],
  };

  let lessonChecks = checks[lessonId] ?? [];
  if (lessonId === 'lesson-1' && stepId === 'l1-goal') lessonChecks = lessonChecks.slice(0, 1);
  if (lessonId === 'lesson-1' && stepId === 'l1-anatomy') lessonChecks = lessonChecks.slice(0, 2);
  if (lessonId === 'lesson-1' && stepId === 'l1-console') lessonChecks = lessonChecks.slice(0, 3);
  return [...common, ...lessonChecks].map((item) => ({ ...item, fileName }));
}
