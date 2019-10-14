import Main from '@/components/main'

/**
 * iview-admin中meta除了原生参数外可配置的参数:
 * meta: {
 *  title: { String|Number|Function }
 *         显示在侧边栏、面包屑和标签栏的文字
 *         使用'{{ 多语言字段 }}'形式结合多语言使用，例子看多语言的路由配置;
 *         可以传入一个回调函数，参数是当前路由对象，例子看动态路由和带参路由
 *  hideInBread: (false) 设为true后此级路由将不会出现在面包屑中，示例看QQ群路由配置
 *  hideInMenu: (false) 设为true后在左侧菜单不会显示该页面选项
 *  notCache: (false) 设为true后页面在切换标签后不会缓存，如果需要缓存，无需设置这个字段，而且需要设置页面组件name属性和路由配置的name一致
 *  access: (null) 可访问该页面的权限数组，当前路由设置的权限会影响子路由
 *  icon: (-) 该页面在左侧菜单、面包屑和标签导航处显示的图标，如果是自定义图标，需要在图标名称前加下划线'_'
 *  beforeCloseName: (-) 设置该字段，则在关闭当前tab页时会去'@/router/before-close.js'里寻找该字段名对应的方法，作为关闭前的钩子函数
 * }
 */

export default [
  {
    path: '/login',
    name: 'login',
    meta: {
      title: 'Login - 登录',
      hideInMenu: true
    },
    component: () => import('@/view/login/login.vue')
  },
  {
    path: '/',
    name: '_home',
    redirect: '/home',
    component: Main,
    meta: {
      hideInMenu: true,
      notCache: true
    },
    children: [
      {
        path: '/home',
        name: 'home',
        meta: {
          hideInMenu: true,
          title: '首页',
          notCache: true,
          icon: 'md-home'
        },
        component: () => import('@/view/single-page/home')
      }
    ]
  },
  {
    path: '/diagnose',
    name: 'diagnose',
    component: Main,
    meta: {
      hideInBread: true,
      notCache: true
    },
    children: [
      {
        path: 'diagnose_page',
        name: 'diagnose_page',
        meta: {
          icon: 'md-person-add',
          title: '接诊'
        },
        component: () => import('@/view/diagnose/diagnose.vue')
      }
    ]
  },
  {
    path: '/buy_drug',
    name: 'buy_drug',
    component: Main,
    meta: {
      hideInBread: true,
      notCache: true
    },
    children: [
      {
        path: 'buy_drug_page',
        name: 'buy_drug_page',
        meta: {
          icon: 'ios-cart',
          title: '购药'
        },
        component: () => import('@/view/join-page.vue')
      }
    ]
  },
  {
    path: '/stock',
    name: 'stock',
    component: Main,
    meta: {
      icon: 'ios-archive',
      title: '库房管理'
    },
    children: [
      {
        path: 'stock_page',
        name: 'stock_page',
        meta: {
          icon: 'md-filing',
          title: '库存管理'
        },
        component: () => import('@/view/join-page.vue')
      },
      {
        path: 'stock_pull_page',
        name: 'stock_pull_page',
        meta: {
          icon: 'md-arrow-round-down',
          title: '入存管理'
        },
        component: () => import('@/view/join-page.vue')
      },
      {
        path: 'stock_push_page',
        name: 'stock_push_page',
        meta: {
          icon: 'md-arrow-round-up',
          title: '出存管理'
        },
        component: () => import('@/view/join-page.vue')
      }
    ]
  },
  {
    path: '/clinic',
    name: 'clinic',
    component: Main,
    meta: {
      icon: 'ios-build',
      title: '诊所设置'
    },
    children: [
      {
        path: 'clinic_drug_page',
        name: 'clinic_drug_page',
        meta: {
          icon: 'md-medkit',
          title: '添加药品'
        },
        component: () => import('@/view/join-page.vue')
      },
      {
        path: 'clinic_treatment_page',
        name: 'clinic_treatment_page',
        meta: {
          icon: 'md-headset',
          title: '诊疗项目'
        },
        component: () => import('@/view/join-page.vue')
      },
      {
        path: 'clinic_employee_page',
        name: 'clinic_employee_page',
        meta: {
          icon: 'md-people',
          title: '员工管理'
        },
        component: () => import('@/view/join-page.vue')
      },
      {
        path: 'clinic_import_page',
        name: 'clinic_import_page',
        meta: {
          icon: 'ios-document',
          title: '数据导入'
        },
        component: () => import('@/view/join-page.vue')
      }
    ]
  },
  {
    path: '/message',
    name: 'message',
    component: Main,
    meta: {
      hideInBread: true,
      hideInMenu: true
    },
    children: [
      {
        path: 'message_page',
        name: 'message_page',
        meta: {
          icon: 'md-notifications',
          title: '消息中心'
        },
        component: () => import('@/view/single-page/message/index.vue')
      }
    ]
  },
  {
    path: '/error_logger',
    name: 'error_logger',
    meta: {
      hideInBread: true,
      hideInMenu: true
    },
    component: Main,
    children: [
      {
        path: 'error_logger_page',
        name: 'error_logger_page',
        meta: {
          icon: 'ios-bug',
          title: '错误收集'
        },
        component: () => import('@/view/single-page/error-logger.vue')
      }
    ]
  },
  {
    path: '/401',
    name: 'error_401',
    meta: {
      hideInMenu: true
    },
    component: () => import('@/view/error-page/401.vue')
  },
  {
    path: '/500',
    name: 'error_500',
    meta: {
      hideInMenu: true
    },
    component: () => import('@/view/error-page/500.vue')
  },
  {
    path: '*',
    name: 'error_404',
    meta: {
      hideInMenu: true
    },
    component: () => import('@/view/error-page/404.vue')
  }
]
