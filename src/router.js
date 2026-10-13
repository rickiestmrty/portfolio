import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from './views/DashboardView.vue'
import ProjectView from './views/ProjectView.vue'
import HireMeView from './views/HireMeView.vue'
import ProfileView from './views/ProfileView.vue'
import { pageFor } from './data/pages'

const routes = [
  { path: '/', redirect: '/dashboard' },
  { path: '/dashboard', name: 'dashboard', component: DashboardView },
  { path: '/projects/:slug', name: 'project', component: ProjectView, props: true },
  { path: '/hire-me', name: 'hire-me', component: HireMeView },
  // Old name of the Hire me page. Kept so existing links still work.
  { path: '/settings', redirect: '/hire-me' },
  { path: '/profile', name: 'profile', component: ProfileView },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Keep the tab title and the Open Graph tags in step with the page.
const setMeta = (attr, key, content) => {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

router.afterEach((to) => {
  const { title, description } = pageFor(to.path)
  document.title = title
  setMeta('name', 'description', description)
  setMeta('property', 'og:title', title)
  setMeta('property', 'og:description', description)
})

export default router
