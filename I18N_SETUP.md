# i18n Multilingual Setup Guide

This project is now fully configured with **i18next** for internationalization (i18n) support with 3 languages: English, Russian, and Kazakh.

## 📦 Installation Summary

All required packages have been installed:
- `i18next` - Core i18n framework
- `react-i18next` - React integration
- `i18next-browser-languagedetector` - Automatic language detection

## 🌍 Supported Languages

1. **English (EN)** - `en.js`
2. **Russian (RU)** - `ru.js`
3. **Kazakh (KZ)** - `kz.js`

## 📂 Project Structure

```
src/
├── locales/
│   ├── en.js              # English translations
│   ├── ru.js              # Russian translations
│   ├── kz.js              # Kazakh translations
│   └── index.ts           # Locales export barrel
├── i18n.ts                # i18n configuration
├── components/
│   └── LanguageSwitcher.tsx  # Language switcher component
├── main.tsx               # Updated with i18n initialization
└── App.tsx                # Main app (no changes needed)
```

## 🚀 How to Use

### 1. Using Translations in Components

Import the `useTranslation` hook from React i18next:

```tsx
import { useTranslation } from "react-i18next";

export function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t("home.title")}</h1>
      <p>{t("home.subtitle")}</p>
      <button>{t("common.apply")}</button>
    </div>
  );
}
```

### 2. Accessing Translations

Use the dot notation to access nested translation keys:

```tsx
t("common.home")        // "Home"
t("grants.title")       // "Scholarships & Grants"
t("auth.loginSuccess")  // "Login successful!"
```

### 3. Language Switcher Component

The header automatically includes a language switcher. It's located in:
- **Component**: `src/components/LanguageSwitcher.tsx`
- **Location in Header**: Appears with language buttons (EN, RU, KZ)

### 4. Available Translation Keys

#### Common Keys
```
common.home
common.grants
common.learning
common.pricing
common.telegram
common.profile
common.login
common.logout
common.register
common.search
...and more
```

#### Home Page
```
home.title          # "Discover Educational Opportunities"
home.subtitle       # "Find and apply for scholarships..."
home.exploreGrants
home.browseResources
```

#### Grants Section
```
grants.title
grants.description
grants.filterByType
grants.filterByCountry
grants.filterByFunding
grants.bachelor
grants.master
grants.phd
grants.internship
...and more
```

See the translation files (`en.js`, `ru.js`, `kz.js`) for all available keys.

## 🔄 Changing Language

### Programmatically
```tsx
import { useTranslation } from "react-i18next";

export function MyComponent() {
  const { i18n } = useTranslation();
  
  const switchToRussian = () => {
    i18n.changeLanguage("ru");
  };
  
  return <button onClick={switchToRussian}>Русский</button>;
}
```

### Via Language Switcher
Click the language buttons (EN, RU, KZ) in the header to switch languages.

## 💾 Language Persistence

The selected language is automatically saved to localStorage. When users return to the site, their language preference is restored.

```
Detection order: localStorage → browser language → fallback to English
```

## 📝 Translation File Structure

Each translation file (en.js, ru.js, kz.js) exports an object with nested keys:

```js
export const en = {
  common: {
    home: "Home",
    grants: "Grants",
    // ...
  },
  header: {
    welcome: "Welcome",
    // ...
  },
  home: {
    title: "Discover Educational Opportunities",
    // ...
  },
  // ... more sections
};
```

## 🎨 Language Switcher Styling

The language switcher matches the screenshot design:
- Compact button group in the header
- Selected language highlighted in dark with white text
- Smooth transitions between languages
- Responsive on mobile/tablet

## 🔧 Adding New Translations

1. Open the language file you want to add to (e.g., `src/locales/en.js`)
2. Add the new key to the appropriate section:

```js
export const en = {
  common: {
    // ... existing keys
    newKey: "New translation text" // Add here
  }
};
```

3. Update all three language files (en.js, ru.js, kz.js)
4. Use in components:

```tsx
const { t } = useTranslation();
<span>{t("common.newKey")}</span>
```

## 📚 Adding a New Language

To add a new language (e.g., Turkish - TR):

1. Create `src/locales/tr.js`:

```js
export const tr = {
  common: { /* ... */ },
  // ... all sections
};
```

2. Update `src/i18n.ts`:

```ts
import { tr } from "./locales/tr.js";

const resources = {
  en: { translation: en },
  ru: { translation: ru },
  kz: { translation: kz },
  tr: { translation: tr }, // Add this
};
```

3. Update `src/components/LanguageSwitcher.tsx`:

```tsx
const LANGUAGES = [
  { code: "en", label: "EN" },
  { code: "ru", label: "RU" },
  { code: "kz", label: "KZ" },
  { code: "tr", label: "TR" }, // Add this
];
```

## 🐛 Troubleshooting

### Translations Not Showing
- Ensure `import "./i18n.ts"` is in `main.tsx` ✓
- Check that translation keys exist in all language files
- Clear browser cache if using cached version

### Language Switcher Not Appearing
- Verify `LanguageSwitcher` component is imported in `HeaderNav.tsx` ✓
- Check that component is in the render path

### Missing Keys
- Use the console to check for warnings about missing translation keys
- Add the key to all three language files

## 📦 Next Steps

1. ✅ i18n Setup Complete
2. ⏭️ Update remaining pages with translations
3. ⏭️ Add translations to form validation messages
4. ⏭️ Consider adding RTL support if needed

## 🔗 Useful Links

- [i18next Documentation](https://www.i18next.com/)
- [React i18next Docs](https://react.i18next.com/)
- [Language Codes](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes)

## 📞 Support

For questions about the i18n setup:
1. Check the translation files for available keys
2. Review the `i18n.ts` configuration file
3. Examine how it's used in existing components (HeaderNav, LanguageSwitcher, HomePage)

---

**Status**: ✅ Ready to use
**Languages Supported**: 3 (EN, RU, KZ)
**Last Updated**: April 11, 2026
