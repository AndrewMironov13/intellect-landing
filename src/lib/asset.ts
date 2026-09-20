export const asset = (p: string) => `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${p.replace(/^\//, '')}`
export const photo = (name: string, small = false) => asset(`photos/${name}${small ? '-s' : ''}.webp`)
export const rub = (n: number) => `${n.toLocaleString('ru-RU')} ₽`
