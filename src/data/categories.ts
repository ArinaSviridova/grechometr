import type { Category } from '../types'

export const categories: Category[] = [
  { id: 'pride', title: 'Гордыня', icon: '/assets/sin-icons/sin-icon-pride.webp', circle: 6, circleTitle: 'Ересь', description: 'Самоуверенность, высокомерие и культ собственной непогрешимости.' },
  { id: 'envy', title: 'Зависть', icon: '/assets/sin-icons/sin-icon-envy.webp', circle: 4, circleTitle: 'Алчность', description: 'Когда чужое счастье почему-то решило раздражать лично вас.' },
  { id: 'greed', title: 'Алчность', icon: '/assets/sin-icons/sin-icon-greed.webp', circle: 4, circleTitle: 'Алчность', description: 'Деньги, вещи и вечное "мне мало".' },
  { id: 'wrath', title: 'Гнев', icon: '/assets/sin-icons/sin-icon-wrath.webp', circle: 5, circleTitle: 'Гнев', description: 'Вспышки злости, хамство и желание объяснить миру всё погромче.' },
  { id: 'lust', title: 'Похоть', icon: '/assets/sin-icons/sin-icon-lust.webp', circle: 2, circleTitle: 'Похоть', description: 'Страсть, импульсивность и решения, которые утром требуют пояснений.' },
  { id: 'gluttony', title: 'Чревоугодие', icon: '/assets/sin-icons/sin-icon-gluttony.webp', circle: 3, circleTitle: 'Чревоугодие', description: 'Излишества в еде, напитках и удовольствиях.' },
  { id: 'sloth', title: 'Лень', icon: '/assets/sin-icons/sin-icon-sloth.webp', circle: 1, circleTitle: 'Лимб', description: 'Прокрастинация, бездействие и священное "сделаю завтра".' },
  { id: 'lie', title: 'Ложь', icon: '/assets/sin-icons/sin-icon-lie.webp', circle: 8, circleTitle: 'Обман', description: 'Ложь, манипуляции и творческое редактирование реальности.' },
  { id: 'betrayal', title: 'Предательство', icon: '/assets/sin-icons/sin-icon-betrayal.webp', circle: 9, circleTitle: 'Предательство', description: 'Нарушение доверия и обещаний.' },
  { id: 'other', title: 'Прочее', icon: '/assets/sin-icons/sin-icon-other.webp', circle: 1, circleTitle: 'Лимб', description: 'Для всего, чему даже адская бюрократия пока не придумала форму.' }
]

export const categoryById = Object.fromEntries(categories.map((item) => [item.id, item])) as Record<Category['id'], Category>
