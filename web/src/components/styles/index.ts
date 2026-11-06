import type { ComponentType } from 'react'
import type { NotifyStyle } from '@/lib/types'
import type { StyleProps } from './shared'
import { Racing } from './Racing'
import { Billboard } from './Billboard'
import { Phone } from './Phone'
import { Pill } from './Pill'
import { News } from './News'
import { Mission } from './Mission'

export const STYLE_COMPONENTS: Record<NotifyStyle, ComponentType<StyleProps>> = {
  racing: Racing,
  billboard: Billboard,
  phone: Phone,
  pill: Pill,
  news: News,
  mission: Mission,
}
