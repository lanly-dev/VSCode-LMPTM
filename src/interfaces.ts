export interface Entry {
  brand: string
  index: number
  selected: boolean
  state: 'playing' | 'paused' | 'none'
  title: string
}
