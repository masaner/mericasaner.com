export const defaultLang = 'en' as const;
export const languages = {
  en: 'English',
  tr: 'Türkçe',
} as const;

export type Lang = keyof typeof languages;

export const ui = {
  en: {
    // Navigation
    'nav.experience': 'Experience',
    'nav.projects': 'Case Studies',
    'nav.certifications': 'Certifications',
    'nav.skills': 'Skills',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    'nav.cv': 'Resume',

    // Hero & Badges
    'hero.badge.open': 'Open to opportunities',
    'hero.cta.contact': 'Get in touch',
    'hero.cta.work': 'View Case Studies',
    'hero.record.title': 'FULL STACK ARCHITECTURE · HIGHLIGHTS',
    'hero.careerPath.label': 'Career Path',

    // Section Titles & Subtitles
    'section.experience.eyebrow': '01 · Experience',
    'section.experience.title': 'Career & Impact',
    'section.experience.sub':
      'Architecting resilient full-stack systems, enterprise APIs, and scalable automations across high-growth European tech.',
    'section.projects.eyebrow': '02 · Selected Work',
    'section.projects.title': 'Featured Case Studies',
    'section.projects.sub':
      'Deep dives into full-stack architecture, platform optimization, and measurable engineering outcomes.',
    'section.certifications.eyebrow': '03 · Credentials',
    'section.certifications.title': 'Licenses & Certifications',
    'section.certifications.sub':
      'Verified platform credentials and continuous software engineering specializations.',
    'section.skills.eyebrow': '04 · Stack',
    'section.skills.title': 'Technical Skills & Ecosystem',
    'section.skills.sub':
      'Full-stack tools, languages, cloud platforms, and enterprise systems I work with daily.',
    'section.about.eyebrow': '05 · Profile',
    'section.about.title': 'About Me',
    'section.contact.eyebrow': '06 · Connect',
    'section.contact.title': 'Let’s build something reliable together.',
    'section.contact.sub':
      'Whether you are looking for a Senior Full Stack Engineer, have an integration challenge, or want to discuss scalable architecture.',

    // Common labels
    'common.present': 'Present',
    'common.fulltime': 'Full-time',
    'common.contract': 'Contract',
    'common.internship': 'Internship',
    'common.viewCredential': 'Verify Credential',
    'common.challenge': 'The Challenge',
    'common.contribution': 'What I Built',
    'common.outcome': 'Business & Tech Impact',
    'common.copied': 'Copied to clipboard!',
    'common.copyEmail': 'Copy email',
    'common.sendEmail': 'Send an email',
    'common.downloadPdf': 'Download PDF',
    'common.systemTheme': 'System',
    'common.lightTheme': 'Light',
    'common.darkTheme': 'Dark',
    'common.themeToggle': 'Toggle color scheme',
    'common.langSwitch': 'Switch language',
    'common.menuOpen': 'Open menu',
    'common.menuClose': 'Close menu',
    'common.backToTop': 'Back to top',
    'common.allRightsReserved': 'All rights reserved.',
    'common.builtWith': 'Engineered with Astro & SLDS Cosmos tokens.',

    // 404
    '404.title': '404 · Page Not Found',
    '404.heading': 'Record not found in database',
    '404.sub': 'The URL you requested does not exist or has been archived.',
    '404.backHome': 'Return to Homepage',
  },
  tr: {
    // Navigation
    'nav.experience': 'Deneyim',
    'nav.projects': 'Örnek Projeler',
    'nav.certifications': 'Sertifikalar',
    'nav.skills': 'Yetenekler',
    'nav.about': 'Hakkımda',
    'nav.contact': 'İletişim',
    'nav.cv': 'Özgeçmiş',

    // Hero & Badges
    'hero.badge.open': 'Yeni fırsatlara açık',
    'hero.cta.contact': 'İletişime Geç',
    'hero.cta.work': 'Projeleri İncele',
    'hero.record.title': 'FULL STACK MİMARİ · AYRINTILAR',
    'hero.careerPath.label': 'Kariyer Yolu',

    // Section Titles & Subtitles
    'section.experience.eyebrow': '01 · Deneyim',
    'section.experience.title': 'Kariyer ve Başarılar',
    'section.experience.sub':
      'Avrupa ve Türkiye odaklı teknoloji ekiplerinde dayanıklı full stack sistemler, kurumsal API ve otomasyon mimarileri.',
    'section.projects.eyebrow': '02 · Seçilmiş İşler',
    'section.projects.title': 'Örnek Vaka Analizleri',
    'section.projects.sub':
      'Full stack mimari, platform optimizasyonu ve somut mühendislik çıktıları üzerine detaylı çalışmalar.',
    'section.certifications.eyebrow': '03 · Yetkinlikler',
    'section.certifications.title': 'Lisanslar ve Sertifikalar',
    'section.certifications.sub':
      'Doğrulanmış platform sertifikaları ve sürekli yazılım mühendisliği uzmanlıkları.',
    'section.skills.eyebrow': '04 · Teknoloji Seti',
    'section.skills.title': 'Teknik Yetenekler ve Ekosistem',
    'section.skills.sub':
      'Günlük çalışmalarımda kullandığım full stack araçlar, diller, bulut platformları ve kurumsal sistemler.',
    'section.about.eyebrow': '05 · Profil',
    'section.about.title': 'Hakkımda',
    'section.contact.eyebrow': '06 · İletişim',
    'section.contact.title': 'Birlikte güvenilir sistemler kuralım.',
    'section.contact.sub':
      'Kıdemli bir Full Stack yazılım mühendisi arayışındaysanız, entegrasyon projeniz varsa ya da ölçeklenebilir sistem mimarisi üzerine konuşmak isterseniz bana her zaman ulaşabilirsiniz.',

    // Common labels
    'common.present': 'Günümüz',
    'common.fulltime': 'Tam zamanlı',
    'common.contract': 'Sözleşmeli',
    'common.internship': 'Staj',
    'common.viewCredential': 'Sertifikayı Doğrula',
    'common.challenge': 'Problem / Zorluk',
    'common.contribution': 'Yaptığım Çalışma',
    'common.outcome': 'İş ve Teknik Etkisi',
    'common.copied': 'Panoya kopyalandı!',
    'common.copyEmail': 'E-postayı kopyala',
    'common.sendEmail': 'E-posta gönder',
    'common.downloadPdf': 'PDF İndir',
    'common.systemTheme': 'Sistem',
    'common.lightTheme': 'Açık',
    'common.darkTheme': 'Koyu',
    'common.themeToggle': 'Tema değiştir',
    'common.langSwitch': 'Dili değiştir',
    'common.menuOpen': 'Menüyü aç',
    'common.menuClose': 'Menüyü kapat',
    'common.backToTop': 'Başa dön',
    'common.allRightsReserved': 'Tüm hakları saklıdır.',
    'common.builtWith': 'Astro ve SLDS Cosmos tasarım tokenları ile geliştirildi.',

    // 404
    '404.title': '404 · Sayfa Bulunamadı',
    '404.heading': 'Veritabanında kayıt bulunamadı',
    '404.sub': 'İstediğiniz URL mevcut değil veya arşive kaldırılmış.',
    '404.backHome': 'Ana Sayfaya Dön',
  },
} as const;

export type UIKey = keyof (typeof ui)[typeof defaultLang];
