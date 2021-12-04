const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Index/Index.vue') },
      {
        path: 'search',
        name: 'search',
        component: () => import('pages/Script/Search/Search.vue'),
      },
      // { path: '/users/home', component: () => import('pages/ManageScript.vue') },
      // { path: '/scripts/submit-code', name: 'submit-code', component: () => import('pages/Script/SubmitCode/SubmitCode.vue') },
      { path: 'users/webhook', name: 'webhook', component: () => import('pages/Users/Webhook/Webhook.vue') },
      { path: 'users/:id', name: 'users', component: () => import('pages/Users/Users.vue') },
      // {
      //   path: 'script-show-page', component: () => import('pages/SciptShowPage.vue'),
      //   children: [
      //     { path: "/script-show-page/:id", name: "showPage", component: () => import('components/ScriptDescription/MainMess.vue') },
      //     { path: "/script-show-page/:id/code", name: "showCode", component: () => import('components/ScriptDescription/CodeShow.vue') },
      //     { path: "/script-show-page/:id/history", name: "showHistory", component: () => import('components/ScriptDescription/History.vue') },
      //     { path: "/script-show-page/:id/comment", name: "showComment", component: () => import('components/ScriptDescription/Comment.vue') },
      //     { path: "/script-show-page/:id/delete", name: "deleteScript", component: () => import('components/ScriptDescription/DeleteScript.vue') },
      //     { path: "/script-show-page/:id/update", name: "updateScript", component: () => import('components/ScriptDescription/UpdataScript.vue') },
      //     { path: "/script-show-page/:id/statistic", name: "statistic", component: () => import('components/ScriptDescription/statistic.vue') },
      //     { path: "/script-show-page/:id/manage", name: "manageScript", component: () => import('components/ScriptDescription/ManageScript.vue') },

      //   ]
      // }
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404.vue'),
  },
];

export default routes;
