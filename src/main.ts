import { createApp } from 'vue'
import { registerSW } from 'virtual:pwa-register'
import App from './App.vue'
import './styles.css'
import { appStore } from './store'

registerSW({ immediate: true })

window.addEventListener('beforeinstallprompt', (event) => appStore.captureInstallPrompt(event))
window.addEventListener('appinstalled', () => {
  appStore.deferredInstallPrompt.value = null
  appStore.standalone.value = true
})

createApp(App).mount('#app')
