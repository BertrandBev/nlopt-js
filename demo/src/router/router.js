import Vue from 'vue'
import VueRouter from 'vue-router'
import Documentation from '../views/Documentation.vue'
// import BenchmarksView from '../views/BenchmarksView.vue'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

const classes = [
  { name: 'optimize', title: 'Optimize', icon: 'mdi-chart-bell-curve-cumulative' },
]
const classRoutes = classes.map(cl => ({
  ...cl,
  group: 'Classes',
  path: `/${cl.name}`,
  component: Documentation,
  props: { className: cl.title }
}))

const routes = [
  {
    path: '/',
    name: 'home',
    title: 'NLopt JS',
    group: 'Pages',
    component: Home,
    icon: 'mdi-lambda'

  },
  ...classRoutes,
]

const router = new VueRouter({
  // mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export { routes }
export default router