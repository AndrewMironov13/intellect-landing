import { about } from '@/content'
import { Reveal } from './Reveal'

export function About() {
  return (
    <section className="section about" id="about" aria-labelledby="about-title">
      <div className="container about__grid">
        <Reveal>
          <p className="eyebrow">О студии</p>
          <h2 className="h2" id="about-title" style={{ marginTop: 16 }}>{about.title}</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="about__text">
            {about.paragraphs.map((t) => <p key={t.slice(0, 24)}>{t}</p>)}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
