
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Index.vue') },
      { path: 'search', component: () => import('pages/Search.vue') },
      {
        path: 'script-show-page', component: () => import('pages/SciptShowPage.vue'),
        children: [
          { path: "/script-show-page/:id", name: "showPage", component: () => import('components/ScriptDescription/MainMess.vue') },
          { path: "/script-show-page/:id/code", name: "showCode", component: () => import('components/ScriptDescription/CodeShow.vue') },
          { path: "/script-show-page/:id/history", name: "showHistory", component: () => import('components/ScriptDescription/History.vue') },
          { path: "/script-show-page/:id/comment", name: "showComment", component: () => import('components/ScriptDescription/Comment.vue') },
        ]
      }
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
