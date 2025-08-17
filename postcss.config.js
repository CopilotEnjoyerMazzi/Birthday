import purgeModule from '@fullhuman/postcss-purgecss';
import cssnano from 'cssnano';

// compat: algumas instalações expõem default, outras exportam a função direto
const purgecss = typeof purgeModule === 'function' ? purgeModule : purgeModule.default;

export default {
  plugins: [
    purgecss({
      content: ['**/*.html', 'assets/**/*.js'],
      defaultExtractor: c => c.match(/[\w-:/]+(?<!:)/g) || [],
      safelist: {
        standard: [
          'modal','show','dialog',
          'letter-zoom-modal','zoom-content','zoom-header','zoom-body',
          'letter-full-text','love-letter','big-love','big-love-block',
          'final-english','highlighted-phrase','strong-highlight','strike',
          'simple-letter',
          'option','disabled','correct','incorrect','timer',
          'btn','ghost','secondary','badge','ok','warn','err','purple',
          'opened','hidden','playing','stop-btn',
          'heart-emoji',
          // gate de entrada
          'entry-gate','entry-card','entry-title','entry-sub','entry-btn', 'gifts-on',
          'random-gift','gift-emoji','gift-press',
          'entry-content','entry-heart'
        ],
        deep: [/^envelope-/]
      }
    }),
    cssnano({ preset: 'default' })
  ]
};
