import './assets/main.css'

import { createApp } from 'vue'
import PrimeVue from 'primevue/config';
import { createPinia } from 'pinia'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import {far} from "@fortawesome/free-regular-svg-icons";

import App from './App.vue'
import router from './router'

library.add(fas, far)

const app = createApp(App)

app.use(PrimeVue);
app.use(createPinia())
app.use(router)

app.component('FontAwesomeIcon', FontAwesomeIcon);

app.mount('#app')