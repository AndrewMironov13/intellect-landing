/** Через столько мс CSS показывает пререндер первого экрана, если скрипт ещё не пришёл (см. styles.css) */
export const PRERENDER_REVEAL_MS = 1200

/** Скрипт опоздал: посетитель уже видит пререндер, поэтому вход первого экрана заново не проигрываем */
export const lateStart = !!document.querySelector('[data-prerender]') && performance.now() > PRERENDER_REVEAL_MS
