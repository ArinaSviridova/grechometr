import { computed, reactive, ref } from 'vue'
import { categories, categoryById } from './data/categories'
import { circles } from './data/circles'
import { hellCopy, backgroundLevelMap } from './data/copy'
import { prayers } from './data/prayers'
import { seedSins } from './data/seedSins'
import type { AppSettings, AvatarKind, CategoryId, ImportPayload, SinDefinition, SinEntry } from './types'
import {
  deleteEntry as dbDeleteEntry,
  deleteSin as dbDeleteSin,
  getAllEntries,
  getAllSins,
  getSettings,
  putEntry,
  putSettings,
  putSin,
  putSins,
  replaceAll,
  requestPersistentStorage,
  resetDb
} from './db'

const HELL_TARGET = 666
const REDEMPTION_FACTOR = 0.6

const defaultSettings = (): AppSettings => ({
  id: 'settings',
  avatar: 'girl',
  onboardingDone: false,
  installHintDismissed: false,
  originCollapsed: false,
  hellRewardSeen: false,
  createdAt: new Date().toISOString()
})

const settings = reactive<AppSettings>(defaultSettings())
const sins = ref<SinDefinition[]>([])
const entries = ref<SinEntry[]>([])
const initialized = ref(false)
const storagePersistent = ref<boolean | null>(null)
const toast = ref('')
const deferredInstallPrompt = ref<any>(null)
const standalone = ref(false)

function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

function isSameLocalDay(a: string, date = new Date()) {
  const d = new Date(a)
  return d.getFullYear() === date.getFullYear() && d.getMonth() === date.getMonth() && d.getDate() === date.getDate()
}

function effectivePoints(entry: SinEntry) {
  return entry.redeemedAt ? entry.points * REDEMPTION_FACTOR : entry.points
}

const totalScore = computed(() => entries.value.reduce((sum, entry) => sum + effectivePoints(entry), 0))
const rawScore = computed(() => entries.value.reduce((sum, entry) => sum + entry.points, 0))
const hellPercent = computed(() => Math.min(100, (totalScore.value / HELL_TARGET) * 100))
const currentLevel = computed(() => {
  if (hellPercent.value <= 10) return 1
  return Math.min(10, Math.ceil(hellPercent.value / 10))
})
const backgroundLevel = computed(() => backgroundLevelMap[currentLevel.value] ?? currentLevel.value)
const characterPath = computed(() => `/assets/characters/character-${settings.avatar}-level-${String(currentLevel.value).padStart(2, '0')}.webp`)
const backgroundPath = computed(() => `/assets/backgrounds/background-level-${String(backgroundLevel.value).padStart(2, '0')}.webp`)
const hellCopyCurrent = computed(() => hellCopy.find((item) => hellPercent.value <= item.max) ?? hellCopy[hellCopy.length - 1])
const todayEntries = computed(() => entries.value.filter((entry) => isSameLocalDay(entry.createdAt)))
const todayScore = computed(() => todayEntries.value.reduce((sum, entry) => sum + effectivePoints(entry), 0))

const categoryScores = computed<Record<CategoryId, number>>(() => {
  const result = Object.fromEntries(categories.map((category) => [category.id, 0])) as Record<CategoryId, number>
  for (const entry of entries.value) result[entry.category] += effectivePoints(entry)
  return result
})

const todayCategoryScores = computed<Record<CategoryId, number>>(() => {
  const result = Object.fromEntries(categories.map((category) => [category.id, 0])) as Record<CategoryId, number>
  for (const entry of todayEntries.value) result[entry.category] += effectivePoints(entry)
  return result
})

function dominantFrom(scores: Record<CategoryId, number>): CategoryId {
  const sorted = categories.map((c) => ({ id: c.id, score: scores[c.id] })).sort((a, b) => b.score - a.score)
  return sorted[0]?.score > 0 ? sorted[0].id : 'other'
}

const dominantCategory = computed(() => dominantFrom(categoryScores.value))
const todayDominantCategory = computed(() => dominantFrom(todayCategoryScores.value))

function entryCircle(entry: SinEntry) {
  if (entry.category === 'wrath' && entry.severity >= 8) return 7
  return categoryById[entry.category].circle
}

function circleScore(number: number) {
  return entries.value
    .filter((entry) => entryCircle(entry) === number)
    .reduce((sum, entry) => sum + effectivePoints(entry), 0)
}

const mainCircle = computed(() => {
  if (!entries.value.length) return 1
  return circles
    .map((circle) => ({ number: circle.number, score: circleScore(circle.number) }))
    .sort((a, b) => b.score - a.score)[0]?.number ?? 1
})
const mainCircleData = computed(() => circles.find((circle) => circle.number === mainCircle.value) ?? circles[0])
const dailyPrayer = computed(() => {
  const category = todayEntries.value.length ? todayDominantCategory.value : dominantCategory.value
  return prayers.find((prayer) => prayer.category === category) ?? prayers.find((prayer) => prayer.category === 'general')!
})
const unreedeemedEntries = computed(() => entries.value.filter((entry) => !entry.redeemedAt).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)))
const redeemedCount = computed(() => entries.value.filter((entry) => Boolean(entry.redeemedAt)).length)
const hellReached = computed(() => hellPercent.value >= 100)

const achievements = computed(() => {
  const usedCategories = new Set(entries.value.map((e) => e.category))
  const result = [
    { id: 'first', title: 'Первый пошёл', text: 'Совершить первый записанный грех.', unlocked: entries.value.length >= 1, icon: '🔥' },
    { id: 'variety', title: 'Разносторонняя личность', text: 'Отметиться в пяти разных категориях.', unlocked: usedCategories.size >= 5, icon: '🎭' },
    { id: 'redeem', title: 'Попытка засчитана', text: 'Искупить хотя бы один грех.', unlocked: redeemedCount.value >= 1, icon: '🙏' },
    { id: 'hundred', title: 'Ад оформлен', text: 'Добраться до 100%.', unlocked: hellReached.value, icon: '👹' }
  ]
  return result
})

function showToast(message: string) {
  toast.value = message
  window.setTimeout(() => {
    if (toast.value === message) toast.value = ''
  }, 2600)
}

async function init() {
  if (initialized.value) return
  const existingSettings = await getSettings()
  Object.assign(settings, existingSettings ?? defaultSettings())

  const storedSins = await getAllSins()
  if (storedSins.length === 0) {
    await putSins(seedSins)
    sins.value = [...seedSins]
  } else {
    sins.value = storedSins.sort((a, b) => a.title.localeCompare(b.title, 'ru'))
  }
  entries.value = (await getAllEntries()).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
  storagePersistent.value = await requestPersistentStorage()
  standalone.value = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true
  initialized.value = true
}

async function setAvatar(avatar: AvatarKind) {
  settings.avatar = avatar
  await putSettings({ ...settings })
}

async function finishOnboarding(avatar: AvatarKind) {
  settings.avatar = avatar
  settings.onboardingDone = true
  await putSettings({ ...settings })
}

async function updateSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
  settings[key] = value
  await putSettings({ ...settings })
}

async function createSin(payload: Pick<SinDefinition, 'title' | 'category' | 'severity' | 'redemption'>) {
  const sin: SinDefinition = {
    id: uid('sin'),
    title: payload.title.trim(),
    category: payload.category,
    severity: Math.max(1, Math.min(10, Math.round(payload.severity))),
    redemption: payload.redemption.trim() || 'Сделай конкретный поступок, который исправляет или уменьшает причинённый вред.',
    isCustom: true,
    createdAt: new Date().toISOString()
  }
  await putSin(sin)
  sins.value = [...sins.value, sin].sort((a, b) => a.title.localeCompare(b.title, 'ru'))
  return sin
}

async function updateSin(sin: SinDefinition) {
  await putSin(sin)
  const index = sins.value.findIndex((item) => item.id === sin.id)
  if (index >= 0) sins.value[index] = { ...sin }
  sins.value = [...sins.value].sort((a, b) => a.title.localeCompare(b.title, 'ru'))
}

async function removeSin(id: string) {
  const sin = sins.value.find((item) => item.id === id)
  if (!sin?.isCustom) return
  await dbDeleteSin(id)
  sins.value = sins.value.filter((item) => item.id !== id)
  showToast('Пользовательский грех удалён')
}

async function logSin(sin: SinDefinition, intensity: number, multiplier: number) {
  const entry: SinEntry = {
    id: uid('entry'),
    sinId: sin.id,
    sinTitle: sin.title,
    category: sin.category,
    severity: sin.severity,
    intensity,
    multiplier,
    points: Number((sin.severity * multiplier).toFixed(2)),
    createdAt: new Date().toISOString()
  }
  await putEntry(entry)
  entries.value = [entry, ...entries.value]
  showToast(`+${entry.points.toFixed(entry.points % 1 ? 1 : 0)} грехобаллов`)
  return entry
}

async function redeem(entryId: string) {
  const entry = entries.value.find((item) => item.id === entryId)
  if (!entry || entry.redeemedAt) return
  const updated = { ...entry, redeemedAt: new Date().toISOString() }
  await putEntry(updated)
  entries.value = entries.value.map((item) => item.id === entryId ? updated : item)
  showToast('Искуплено: вклад греха уменьшен на 40%')
}

async function deleteEntry(id: string) {
  await dbDeleteEntry(id)
  entries.value = entries.value.filter((entry) => entry.id !== id)
  showToast('Запись удалена из истории')
}

function getSinById(id: string) {
  return sins.value.find((sin) => sin.id === id)
}

function getCategory(id: CategoryId) {
  return categoryById[id]
}

function exportData() {
  const payload: ImportPayload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    settings: { ...settings },
    sins: sins.value,
    entries: entries.value
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `grekhometr-soul-${new Date().toISOString().slice(0, 10)}.json`
  anchor.click()
  URL.revokeObjectURL(url)
  showToast('Душа экспортирована')
}

async function importData(file: File) {
  const raw = await file.text()
  const parsed = JSON.parse(raw) as ImportPayload
  if (!parsed || parsed.version !== 1 || !parsed.settings || !Array.isArray(parsed.sins) || !Array.isArray(parsed.entries)) {
    throw new Error('Неподдерживаемый файл резервной копии')
  }
  await replaceAll(parsed.settings, parsed.sins, parsed.entries)
  Object.assign(settings, parsed.settings)
  sins.value = parsed.sins
  entries.value = parsed.entries.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
  showToast('Душа восстановлена')
}

async function resetEverything() {
  await resetDb()
  Object.assign(settings, defaultSettings())
  await putSettings({ ...settings })
  await putSins(seedSins)
  sins.value = [...seedSins]
  entries.value = []
  showToast('Совесть очищена. История тоже.')
}

function captureInstallPrompt(event: Event) {
  event.preventDefault()
  deferredInstallPrompt.value = event
}

async function installApp() {
  if (standalone.value) {
    showToast('Грехометр уже установлен')
    return true
  }
  if (!deferredInstallPrompt.value) return false
  deferredInstallPrompt.value.prompt()
  const choice = await deferredInstallPrompt.value.userChoice
  if (choice?.outcome === 'accepted') {
    deferredInstallPrompt.value = null
    standalone.value = true
    showToast('Грехометр установлен')
    return true
  }
  return false
}

function formatPoints(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

export const appStore = {
  settings,
  sins,
  entries,
  initialized,
  storagePersistent,
  toast,
  deferredInstallPrompt,
  standalone,
  categories,
  circles,
  prayers,
  totalScore,
  rawScore,
  hellPercent,
  currentLevel,
  characterPath,
  backgroundPath,
  hellCopyCurrent,
  todayEntries,
  todayScore,
  categoryScores,
  dominantCategory,
  todayDominantCategory,
  mainCircleData,
  dailyPrayer,
  unreedeemedEntries,
  redeemedCount,
  hellReached,
  achievements,
  init,
  setAvatar,
  finishOnboarding,
  updateSetting,
  createSin,
  updateSin,
  removeSin,
  logSin,
  redeem,
  deleteEntry,
  getSinById,
  getCategory,
  circleScore,
  effectivePoints,
  exportData,
  importData,
  resetEverything,
  captureInstallPrompt,
  installApp,
  showToast,
  formatPoints,
  HELL_TARGET,
  REDEMPTION_FACTOR
}
