// 全站全局基础配置 (请在此处修改你的个人信息与功能开关)
export const siteConfig = {
  // 博客名称与副标题
  title: '我的个人博客',
  subtitle: 'My Personal Blog',
  description: '记录技术思考、架构沉淀与生活碎碎念。',

  // 博主基本信息
  author: '博主昵称',
  bio: '这里是一句简短的个人签名或座右铭。保持好奇，持续造物。',
  avatar: '/avatar.svg',

  // 站点根域名 (用于 SEO 与 RSS 生成)
  site: 'https://waaogg.github.io',

  // 建站起算时间 (用于页脚极客运行计时器)
  siteStartDate: '2026-01-01',

  // 社交与外部链接
  social: {
    github: 'https://github.com/waaogg',
    email: 'hello@example.com',
  },

  // Waline 评论系统服务端地址 (若暂未搭建可留空或保留默认占位)
  waline: {
    serverURL: 'https://waline.example.com',
  },

  // 极简氛围轻音乐播放器预置曲目 (可自定义音频外链)
  music: [
    {
      title: 'Chill Lofi Study',
      artist: 'Aesthetic Sound',
      url: 'https://assets.mixkit.co/music/preview/mixkit-chill-bro-494.mp3',
      cover: '/favicon.svg',
    },
    {
      title: 'Serene Piano Dream',
      artist: 'Peaceful Mind',
      url: 'https://assets.mixkit.co/music/preview/mixkit-piano-reflections-22.mp3',
      cover: '/favicon.svg',
    },
  ],

  // 近况看板 (/now) 当前状态
  now: {
    location: '中国 · 赛博空间',
    reading: '《代码整洁之道》&《黑客与画家》',
    building: 'Astro 5 旗舰级独立博客 & 智能体自动化套件',
    listening: 'Lo-Fi Hip Hop / 钢琴古典微电音',
    status: '正在打磨个人数字化自留地，享受造物的简单纯粹。',
    lastUpdated: '2026-10-15',
  },

  // 幕后技术账本 (/colophon)
  colophon: {
    framework: 'Astro 5 + React 19',
    styling: 'Tailwind CSS v4 (Pure CSS Next-gen engine)',
    search: 'Pagefind 1.5 (静态毫秒级离线全文索引)',
    comments: 'Waline (轻量独立服务端 / SQLite 存储)',
    typography: 'Inter / Geist / JetBrains Mono / 思源宋体',
    motion: 'ParticleX Aurora Flow + View Transitions',
    license: 'MIT / 知识共享 CC BY-NC-SA 4.0',
    deployment: 'Docker Multi-stage + Nginx Alpine',
  },
};
