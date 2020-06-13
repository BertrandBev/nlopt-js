import Vue from 'vue';
import Vuetify from 'vuetify/lib';
import colors from 'vuetify/lib/util/colors'

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    themes: {
      light: {
        primary: colors.indigo.darken1,
        secondary: colors.indigo.lighten4,
        accent: colors.indigo.base,
      },
    },
  },
});
