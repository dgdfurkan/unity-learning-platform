import { useMemo, useState } from 'react';
import { Icon } from '../shared/Icon';

export type ProofChallenge = {
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
  hint: string;
};

type ProofMode = 'signal' | 'route' | 'diagnostic' | 'console' | 'sorter' | 'lens' | 'terminal';
const proofModes: ProofMode[] = ['signal','route','diagnostic','console','sorter','lens','terminal'];

function hueFor(stepId: string) {
  return [...stepId].reduce((total, letter) => total + letter.charCodeAt(0), 0) % 46;
}

type Props = {
  stepId: string;
  variant: number;
  challenge: ProofChallenge;
  enabled: boolean;
  selected: number | null;
  onChoose: (index: number) => void;
};

export function StepProof({ stepId, variant, challenge, enabled, selected, onChoose }: Props) {
  const mode = proofModes[Math.abs(variant) % proofModes.length];
  const correct = selected === challenge.answer;
  const hue = hueFor(stepId);
  const [cursor, setCursor] = useState(0);
  const title = useMemo(() => ({
    signal: 'Sinyali doğru hedefe bağlayalım',
    route: 'Bilginin izleyeceği yolu seçelim',
    diagnostic: 'İlk kırılan kanıtı bulalım',
    console: 'Sistemin sonucunu birlikte çalıştıralım',
    sorter: 'Bu bilgiyi doğru bölmeye gönderelim',
    lens: 'Doğru bölgeyi mercek altına alalım',
    terminal: 'Kanıtı terminale yükleyelim',
  }[mode]), [mode]);

  const feedback = selected === null
    ? null
    : <div className={correct ? 'foundation-feedback correct' : 'foundation-feedback incorrect'} role="status">
        <Icon name={correct ? 'check' : 'spark'} />
        <div>
          <strong>{correct ? 'Bağlantı doğru; XP kaydediliyor.' : 'Bu kanıt henüz zincirle uyuşmuyor.'}</strong>
          <p>{correct ? challenge.explanation : challenge.hint}</p>
        </div>
      </div>;

  const choose = (index: number) => {
    if (!enabled || correct) return;
    onChoose(index);
  };

  return (
    <section
      className={`step-proof proof-${mode} ${enabled ? 'ready' : 'locked'} ${correct ? 'resolved' : ''}`}
      style={{ '--proof-hue': `${258 + hue}deg` } as React.CSSProperties}
      aria-disabled={!enabled}
    >
      <header>
        <span className="stage-number">02</span>
        <div>
          <p className="section-kicker">KAVRAYIŞ KONTROLÜ · {mode.toUpperCase()}</p>
          <h3>{title}</h3>
          <p>{challenge.prompt}</p>
        </div>
      </header>

      {!enabled && <div className="proof-lock"><Icon name="lock" /><span>Yukarıdaki deneyim tamamlandığında bu bölüm açılacak.</span></div>}

      {enabled && mode === 'signal' && <div className="proof-signal-board">
        <div className="proof-source"><small>KAYNAK</small><b>●</b><strong>{stepId.includes('component') ? 'GameObject' : 'Gelen bilgi'}</strong></div>
        <div className="proof-cables" aria-hidden="true">{challenge.options.map((_, index) => <i key={index} className={selected === index ? (index === challenge.answer ? 'correct' : 'incorrect') : ''} />)}</div>
        <div className="proof-targets">{challenge.options.map((option, index) => <button key={option} type="button" disabled={correct} onClick={() => choose(index)} className={selected === index ? (index === challenge.answer ? 'correct' : 'incorrect') : ''}><span>{index + 1}</span><strong>{option}</strong><small>{selected === index ? 'Bağlantı denendi' : 'Kabloyu bağla'}</small></button>)}</div>
      </div>}

      {enabled && mode === 'route' && <div className="proof-route-map">
        <div className="route-origin"><i /><span>BAŞLANGIÇ</span></div>
        {challenge.options.map((option, index) => <button key={option} type="button" disabled={correct} onClick={() => choose(index)} className={selected === index ? (index === challenge.answer ? 'correct' : 'incorrect') : ''}><i /><span>{option}</span><b>{selected === index ? '●' : '○'}</b></button>)}
        <div className="route-destination"><i /><span>SONUÇ</span></div>
      </div>}

      {enabled && mode === 'diagnostic' && <div className="proof-diagnostic-map">
        <div className="diagnostic-screen"><small>CANLI BELİRTİ</small><div><i /><i /><i /></div><strong>{challenge.prompt}</strong></div>
        <div className="diagnostic-nodes">{challenge.options.map((option, index) => <button key={option} type="button" disabled={correct} onClick={() => choose(index)} className={selected === index ? (index === challenge.answer ? 'correct' : 'incorrect') : ''}><b>{selected === index ? '!' : '?'}</b><span>{option}</span><small>{selected === index ? 'Test sonucu açık' : 'Bu düğümü test et'}</small></button>)}</div>
      </div>}

      {enabled && mode === 'console' && <div className="proof-control-room">
        <div className="control-display"><small>SİSTEM DURUMU</small><div className={selected === null ? 'control-orb' : selected === challenge.answer ? 'control-orb correct' : 'control-orb incorrect'}><i /><b>{selected === null ? 'BEKLİYOR' : correct ? 'UYUMLU' : 'ÇELİŞKİ'}</b></div><p>{challenge.options[cursor]}</p></div>
        <div className="control-console"><label>Olasılığı değiştir <input type="range" min="0" max={challenge.options.length - 1} value={cursor} disabled={correct} onChange={(event) => setCursor(Number(event.target.value))} /></label><div>{challenge.options.map((_, index) => <i key={index} className={cursor === index ? 'active' : ''} />)}</div><button type="button" className="button button-secondary" disabled={correct} onClick={() => choose(cursor)}>Sistemi çalıştır<Icon name="spark" /></button></div>
      </div>}

      {enabled && mode === 'sorter' && <div className="proof-sorter">
        <div className="sorter-packet"><i /><small>İNCELENEN BİLGİ</small><strong>{challenge.prompt}</strong></div>
        <div className="sorter-belt" aria-hidden="true"><i /><i /><i /></div>
        <div className="sorter-bins">{challenge.options.map((option, index) => <button key={option} type="button" disabled={correct} onClick={() => choose(index)} className={selected === index ? (index === challenge.answer ? 'correct' : 'incorrect') : ''}><span>{['◇', '○', '□'][index % 3]}</span><strong>{option}</strong></button>)}</div>
      </div>}

      {enabled && mode === 'lens' && <div className="proof-lens-map">
        <div className="lens-canvas" aria-hidden="true"><i /><i /><span>{selected === null ? 'ARA' : selected + 1}</span></div>
        <div>{challenge.options.map((option, index) => <button key={option} type="button" disabled={correct} onClick={() => choose(index)} className={selected === index ? (index === challenge.answer ? 'correct' : 'incorrect') : ''}><b>{String(index + 1).padStart(2, '0')}</b><span>{option}</span><Icon name="chevron-right" /></button>)}</div>
      </div>}

      {enabled && mode === 'terminal' && <div className="proof-terminal">
        <div className="terminal-toolbar"><i /><i /><i /><span>evidence://{stepId}</span></div>
        <pre><code><b>$</b> {challenge.options[cursor]}</code></pre>
        <div className="terminal-controls"><button type="button" disabled={correct} onClick={() => setCursor((cursor - 1 + challenge.options.length) % challenge.options.length)}>Önceki kanıt</button><span>{cursor + 1} / {challenge.options.length}</span><button type="button" disabled={correct} onClick={() => setCursor((cursor + 1) % challenge.options.length)}>Sonraki kanıt</button><button type="button" className="button button-secondary" disabled={correct} onClick={() => choose(cursor)}>Bu kanıtı kullan<Icon name="check" /></button></div>
      </div>}

      {feedback}
    </section>
  );
}
