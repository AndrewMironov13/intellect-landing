import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { CheckCircle2, MapPin } from 'lucide-react'
import { brand, contact } from '@/content'
import { photo } from '@/lib/asset'
import { lead } from '@/lib/lead'
import { Reveal } from './Reveal'
import { Messengers } from './Messengers'
import { goal } from '@/lib/metrika'

type Status = 'idle' | 'sending' | 'ok' | 'error'

export function Contact() {
  const [status, setStatus] = useState<Status>('idle')
  const [service, setService] = useState(contact.services[0])
  const [comment, setComment] = useState('')
  const [mapOn, setMapOn] = useState(false)

  useEffect(() => lead.subscribe((t) => { setComment(t); setService('Оклейка полиуретаном'); setStatus('idle') }), [])

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    if (fd.get('website')) return // ловушка для ботов
    setStatus('sending')
    const payload = { Имя: fd.get('name'), Телефон: fd.get('phone'), Услуга: service, Сообщение: comment, _subject: 'Заявка с сайта Intellect', _template: 'table', _captcha: 'false' }
    try {
      if (contact.endpoint) {
        const r = await fetch(contact.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(payload) })
        if (!r.ok) throw new Error(String(r.status))
      } else {
        await new Promise((res) => setTimeout(res, 600))
        console.info('[lead]', payload)
      }
      setStatus('ok'); goal('form', { service })
    } catch { setStatus('error') }
  }

  const mapSrc = `https://yandex.ru/map-widget/v1/?text=${encodeURIComponent(brand.mapsQuery)}&z=16`

  return (
    <section className="section" id="contact">
      <div className="container">
        <Reveal>
          <div className="head head--split">
            <div>
              <p className="eyebrow">Запись</p>
              <h2 className="h2" style={{ marginTop: 16 }}>{contact.title}</h2>
            </div>
            <p className="lead">{contact.text}</p>
          </div>
        </Reveal>
        <div className="contact">
          <Reveal>
            <AnimatePresence mode="wait" initial={false}>
              {status === 'ok' ? (
                <motion.div key="ok" className="form form__ok" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                  <CheckCircle2 strokeWidth={1.5} />
                  <b>Заявка принята</b>
                  <p style={{ color: 'var(--muted)' }}>Перезвоним в рабочее время: {brand.hours}. Срочно — звоните <a href={brand.phoneHref} style={{ color: 'var(--accent)' }}>{brand.phone}</a></p>
                </motion.div>
              ) : (
                <motion.form key="form" className="form" onSubmit={submit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="form__row">
                    <div className="field"><label htmlFor="f-name">Как вас зовут</label><input id="f-name" name="name" required autoComplete="name" placeholder="Иван" /></div>
                    <div className="field"><label htmlFor="f-phone">Телефон</label><input id="f-phone" name="phone" type="tel" required autoComplete="tel" inputMode="tel" placeholder="+7 910 000-00-00" /></div>
                  </div>
                  <div className="field">
                    <label htmlFor="f-service">Что нужно</label>
                    <select id="f-service" name="service" value={service} onChange={(e) => setService(e.target.value)}>
                      {contact.services.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="field"><label htmlFor="f-msg">Машина и что хотите сделать</label><textarea id="f-msg" name="message" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Например: BMW X1 2023, капот и бампер в плёнку" /></div>
                  <input className="hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
                  <button className="btn btn--primary" type="submit" disabled={status === 'sending'}>{status === 'sending' ? 'Отправляем…' : 'Записаться на осмотр'}</button>
                  {status === 'error' && <p style={{ color: '#ff9b9b', fontSize: 14 }}>Не отправилось. Позвоните нам: <a href={brand.phoneHref}>{brand.phone}</a></p>}
                  <p className="form__consent">{contact.consent}</p>
                </motion.form>
              )}
            </AnimatePresence>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="info">
              <div className="info__grid">
                <div className="info__item"><small>Телефон</small><a className="big" href={brand.phoneHref} onClick={() => goal('phone', { where: 'contact' })}>{brand.phone}</a><span>звонки и мессенджеры</span></div>
                <div className="info__item"><small>Режим</small><b>{brand.hours}</b><span>{brand.hoursNote}</span></div>
                <div className="info__item"><small>Адрес</small><b>{brand.address}</b><span>{brand.metro}</span></div>
                <div className="info__item"><small>Соцсети</small><a className="big" href={brand.vk} target="_blank" rel="noopener">ВКонтакте</a><span>фото работ и новости</span></div>
              </div>
              <div className="info__msgs">
                <small>Или напишите, ответим в рабочее время</small>
                <Messengers extra={comment ? comment : 'Хочу '} />
              </div>
              <div className="map">
                {mapOn ? <iframe src={mapSrc} title="Автостудия Intellect на карте" loading="lazy" allowFullScreen /> : (
                  <button className="map__lock" onClick={() => { setMapOn(true); goal('map') }} aria-label="Показать карту">
                    <span className="btn btn--ghost"><MapPin size={18} /> Показать на карте</span>
                  </button>
                )}
                <div className="map__gate"><img src={photo('gate', true)} alt="Ворота бокса с надписью INTELLECT" loading="lazy" /></div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
