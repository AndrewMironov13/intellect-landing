import { useEffect, useMemo, useState } from 'react'
import { animate, motion, useMotionValue, useTransform } from 'motion/react'
import { ArrowRight, Check } from 'lucide-react'
import { extras, parts, presets, type PartId } from '@/content'
import { rub } from '@/lib/asset'
import { lead, scrollTo } from '@/lib/lead'
import { goal } from '@/lib/metrika'
import { Reveal } from './Reveal'

const ON = { fill: 'rgba(46,200,198,.26)', stroke: '#2EC8C6', label: '#2EC8C6' }
const OFF = { fill: '#1d1d1d', stroke: '#4a4a4a', label: '#8a8a8a' }
const BASE = { fill: '#1a1a1a', stroke: '#3a3a3a' }

export function Constructor() {
  const [sel, setSel] = useState<Set<PartId>>(new Set(['hood']))
  const [ext, setExt] = useState<Set<string>>(new Set())
  const full = sel.has('body')

  const toggle = (id: PartId) => setSel((s) => {
    const n = new Set(s)
    if (id === 'body') { if (n.has('body')) n.delete('body'); else { n.clear(); n.add('body') } }
    else if (!n.has('body')) { n.has(id) ? n.delete(id) : n.add(id) }
    return n
  })
  const toggleExt = (id: string) => setExt((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  const applyPreset = (ids: PartId[]) => setSel(new Set(ids))
  const activePreset = presets.find((p) => p.parts.length === sel.size && p.parts.every((x) => sel.has(x)))?.id

  const { total, from, names } = useMemo(() => {
    let total = 0, from = false
    const names: string[] = []
    for (const p of parts) if (sel.has(p.id)) { total += p.price; from ||= !!p.from; names.push(p.name.toLowerCase()) }
    for (const e of extras) if (ext.has(e.id)) { total += e.price; names.push(e.label.toLowerCase()) }
    return { total, from, names }
  }, [sel, ext])

  const mv = useMotionValue(total)
  useEffect(() => { const c = animate(mv, total, { type: 'spring', stiffness: 120, damping: 24, mass: 0.8 }); return () => c.stop() }, [total, mv])
  const shown = useTransform(() => rub(Math.round(mv.get())))

  const summary = names.length ? `${names.join(', ')} — ${from ? 'от ' : ''}${rub(total)}` : 'Выберите детали на схеме'
  const send = () => { lead.set(`Расчёт оклейки: ${summary}`); goal('calc', { total }); scrollTo('contact') }

  const z = (id: PartId) => (full || sel.has(id)) ? ON : OFF
  const body = full ? ON : BASE

  return (
    <section className="section" id="constructor">
      <div className="container">
        <Reveal>
          <div className="head head--split">
            <div>
              <p className="eyebrow">Конструктор оклейки</p>
              <h2 className="h2" style={{ marginTop: 16 }}>Соберите защиту и сразу увидите сумму</h2>
            </div>
            <p className="lead">Нажимайте детали на схеме. Считаем по нашим ценам, точную назовём, когда увидим машину</p>
          </div>
        </Reveal>

        <div className="cons">
          <Reveal>
            <div className="presets" role="group" aria-label="Готовые варианты">
              {presets.map((p) => (
                <button key={p.id} className={`chip${activePreset === p.id ? ' is-on' : ''}`} onClick={() => applyPreset(p.parts)}>{p.name}</button>
              ))}
            </div>
            <svg className="car" viewBox="-10 -46 730 360" role="img" aria-label="Схема автомобиля сверху: капот, бампер, фары, зеркала">
              <rect x="116" y="22" width="76" height="20" rx="7" fill="#0E0E0E" stroke="#3A3A3A" />
              <rect x="478" y="22" width="76" height="20" rx="7" fill="#0E0E0E" stroke="#3A3A3A" />
              <rect x="116" y="258" width="76" height="20" rx="7" fill="#0E0E0E" stroke="#3A3A3A" />
              <rect x="478" y="258" width="76" height="20" rx="7" fill="#0E0E0E" stroke="#3A3A3A" />
              <g className="zone" onClick={() => toggle('body')} fill={body.fill} stroke={body.stroke}>
                <path d="M 24 150 C 24 104 30 66 58 50 C 96 38 160 34 236 35 L 468 35 C 528 36 568 42 592 58 C 614 76 622 110 622 150 C 622 190 614 224 592 242 C 568 258 528 264 468 265 L 236 265 C 160 266 96 262 58 250 C 30 234 24 196 24 150 Z" strokeWidth="1.4" />
                <path d="M 58 50 C 30 66 24 104 24 150 C 24 196 30 234 58 250 L 66 236 C 44 222 40 190 40 150 C 40 110 44 78 66 64 Z" strokeWidth="1.2" />
                <path d="M 66 64 C 96 62 118 64 138 70 C 130 110 130 190 138 230 C 118 236 96 238 66 236 C 44 222 40 190 40 150 C 40 110 44 78 66 64 Z" strokeWidth="1.2" />
                <path d="M 200 62 L 382 60 C 392 104 392 196 382 240 L 200 238 C 192 196 192 104 200 62 Z" strokeWidth="1.2" />
              </g>
              <path d="M 138 70 C 158 64 180 62 200 62 C 192 104 192 196 200 238 C 180 238 158 236 138 230 C 130 190 130 110 138 70 Z" fill="#141414" stroke="#5A5A5A" strokeWidth="1.2" />
              <path d="M 382 60 C 412 58 436 60 446 64 C 458 104 456 196 446 236 C 436 240 412 242 382 240 C 392 196 392 104 382 60 Z" fill="#141414" stroke="#5A5A5A" strokeWidth="1.2" />
              <path d="M 392 74 C 410 90 420 104 424 112" fill="none" stroke="#3C3C3C" strokeWidth="2" strokeLinecap="round" />
              <path d="M 205 36 L 200 62 M 300 35 L 300 61 M 452 37 L 446 64 M 205 264 L 200 238 M 300 265 L 300 239 M 452 263 L 446 236" fill="none" stroke="#4E4E4E" strokeWidth="1.2" />
              <path className="zone" onClick={() => toggle('hood')} d="M 446 64 C 506 60 556 64 582 71 C 600 88 606 116 606 150 C 606 184 600 212 582 229 C 556 236 506 240 446 236 C 456 196 458 104 446 64 Z" fill={z('hood').fill} stroke={z('hood').stroke} strokeWidth="1.6" />
              <path d="M 474 108 C 520 104 560 106 588 112 M 474 192 C 520 196 560 194 588 188" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="1.2" />
              <path className="zone" onClick={() => toggle('bumper')} d="M 592 58 C 614 76 622 110 622 150 C 622 190 614 224 592 242 L 582 229 C 600 212 606 184 606 150 C 606 116 600 88 582 71 Z" fill={z('bumper').fill} stroke={z('bumper').stroke} strokeWidth="1.6" />
              <path className="zone" onClick={() => toggle('lights')} d="M 558 55 C 578 57 592 64 601 75 L 594 88 C 584 79 571 73 554 69 Z" fill={z('lights').fill} stroke={z('lights').stroke} strokeWidth="1.6" />
              <path className="zone" onClick={() => toggle('lights')} d="M 558 245 C 578 243 592 236 601 225 L 594 212 C 584 221 571 227 554 231 Z" fill={z('lights').fill} stroke={z('lights').stroke} strokeWidth="1.6" />
              <path className="zone" onClick={() => toggle('mirrors')} d="M 402 36 C 402 23 413 14 430 14 C 439 14 444 20 442 29 L 434 36 Z" fill={z('mirrors').fill} stroke={z('mirrors').stroke} strokeWidth="1.6" />
              <path className="zone" onClick={() => toggle('mirrors')} d="M 402 264 C 402 277 413 286 430 286 C 439 286 444 280 442 271 L 434 264 Z" fill={z('mirrors').fill} stroke={z('mirrors').stroke} strokeWidth="1.6" />
              <text className="lbl" x="528" y="155" textAnchor="middle" fontSize="15" fill={z('hood').label}>Капот</text>
              <path d="M 624 150 L 640 150" stroke={z('bumper').label} strokeWidth="1" />
              <text className="lbl" x="646" y="155" fontSize="14" fill={z('bumper').label}>Бампер</text>
              <path d="M 596 66 L 628 36" stroke={z('lights').label} strokeWidth="1" />
              <text className="lbl" x="634" y="34" fontSize="14" fill={z('lights').label}>Фары</text>
              <path d="M 422 14 L 422 -8" stroke={z('mirrors').label} strokeWidth="1" />
              <text className="lbl" x="422" y="-16" textAnchor="middle" fontSize="14" fill={z('mirrors').label}>Зеркала</text>
              <text className="lbl" x="300" y="155" textAnchor="middle" fontSize="13" fill={full ? '#2EC8C6' : '#5a5a5a'}>{full ? 'весь кузов' : 'кузов — нажмите для полной оклейки'}</text>
            </svg>
            <p className="car__hint">Вид сверху. Капот, бампер, фары и зеркала — зоны, куда прилетает чаще всего</p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="panel">
              <div className="panel__title">Что клеим</div>
              {parts.map((p) => {
                const on = sel.has(p.id)
                const disabled = full && p.id !== 'body'
                return (
                  <button key={p.id} className={`prow${on || (full && p.id !== 'body') ? ' is-on' : ''}`} onClick={() => toggle(p.id)} disabled={disabled} aria-pressed={on}>
                    <span className="check"><Check strokeWidth={3} /></span>
                    <span><span className="prow__name">{p.name}</span><br /><span className="prow__note">{p.note}</span></span>
                    <span className="prow__price">{p.from ? 'от ' : ''}{rub(p.price)}</span>
                  </button>
                )
              })}
              <div className="panel__title" style={{ marginTop: 18 }}>Добавить к оклейке</div>
              <div className="extras">
                {extras.map((e) => (
                  <button key={e.id} className={`chip${ext.has(e.id) ? ' is-on' : ''}`} onClick={() => toggleExt(e.id)} aria-pressed={ext.has(e.id)}>{e.label} · {rub(e.price)}</button>
                ))}
              </div>
              <div className="total">
                <span className="total__label">примерная стоимость</span>
                <span className="total__value">{from && <small>от</small>}<motion.span>{shown}</motion.span></span>
              </div>
              <p className="summary">{summary}</p>
              <button className="btn btn--primary" onClick={send} disabled={!names.length}>Отправить расчёт <ArrowRight /></button>
              <p className="panel__foot">Расчёт попадёт в заявку — вам не придётся ничего переписывать. При полной оклейке кузова антидождь в подарок</p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
