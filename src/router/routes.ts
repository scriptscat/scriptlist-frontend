const routes = [
  {
    path: '/',
    component: () => import('layouts/IndexLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Index/Index.vue') },
      {
        path: '/users/managescript',
        component: () => import('pages/Users/UsersScript/UsersScript.vue'),
      },
      // { path: '/scripts/submit-code', name: 'submit-code', component: () => import('pages/Script/SubmitCode/SubmitCode.vue') },
      {
        path: 'users/webhook',
        name: 'webhook',
        component: () => import('pages/Users/Webhook/Webhook.vue'),
      },
      {
        path: 'users/script/new',
        name: 'submit-script',
        component: () => import('pages/Users/UsersScript/SubmitScript.vue'),
      },
      {
        path: 'users/:id',
        name: 'users',
        component: () => import('pages/Users/UsersScript/UsersScript.vue'),
      },
      {
        path: 'script-show-page/:id',
        component: () => import('layouts/ScriptShowLayout.vue'),
        children: [
          {
            path: '',
            name: 'index',
            component: () => import('pages/Script/Code/Index.vue'),
          },
          {
            path: 'code',
            name: 'code',
            component: () => import('pages/Script/Code/Code.vue'),
          },
          //     { path: "/script-show-page/:id/history", name: "history", component: () => import('components/ScriptDescription/History.vue') },
          {
            path: 'comment',
            name: 'comment',
            component: () => import('pages/Script/Code/Comment.vue'),
          },
          {
            path: 'issue',
            component: () => import('layouts/IssueLayout.vue'),
            children: [
              {
                path: '',
                name: 'issue',
                component: () => import('pages/Script/Code/Issue/Issue.vue'),
              },
              {
                path: 'comment',
                name: 'issue-comment',
                component: () => import('pages/Script/Code/Issue/Comment.vue'),
              },
              {
                path: 'new',
                name: 'issue-new',
                component: () => import('pages/Script/Code/Issue/New.vue'),
              },
            ],
          },
          {
            path: 'update',
            name: 'update',
            component: () => import('pages/Script/Code/Update.vue'),
          },
          //     { path: "/script-show-page/:id/delete", name: "deleteScript", component: () => import('components/ScriptDescription/DeleteScript.vue') },
          {
            path: 'statistic',
            name: 'statistic',
            component: () => import('pages/Script/Code/Statistic.vue'),
          },
          //     { path: "/script-show-page/:id/manage", name: "manageScript", component: () => import('components/ScriptDescription/ManageScript.vue') },
        ],
      },
    ],
  },
  {
    path: '/',
    component: () => import('layouts/SearchLayout.vue'),
    children: [
      {
        path: 'search',
        name: 'search',
        component: () => import('pages/Script/Search/Search.vue'),
      },
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
