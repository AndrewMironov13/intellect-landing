import { ticker } from '@/content'

export function Ticker() {
  const items = [...ticker, ...ticker]
  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker__track">
        {items.map((t, i) => <span className="ticker__item" key={i}>{t}</span>)}
      </div>
    </div>
  )
}
