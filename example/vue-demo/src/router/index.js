import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    // {
    //   path: '/style',
    //   name: 'Style',
    //   component: () => import('../components/style/')
    // },
    {
      path: '/template',
      name: 'Template',
      component: () => import('../components/template/')
    }
    // {
    //   path: '/component',
    //   name: 'Component',
    //   component: () => import('../components/component/')
    // },
    // {
    //   path: '/component/out-export',
    //   name: 'ComponentOut',
    //   component: () => import('../components/component/out-export')
    // },
    // {
    //   path: '/multi-label',
    //   name: 'MultiLabel',
    //   component: () => import('../components/multi-label/')
    // },
    // {
    //   path: '/multi-component',
    //   name: 'MultiComponent',
    //   component: () => import('../components/multi-component/')
    // }
  ]
})
