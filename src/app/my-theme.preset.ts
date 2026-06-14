import { definePreset } from '@primeuix/themes';
import Lara from '@primeuix/themes/lara';
import { palette } from '@primeuix/themes';

const sohoSurface = {
  0: '#ffffff',
  50: '#ececec',
  100: '#dedfdf',
  200: '#c4c4c6',
  300: '#adaeb0',
  400: '#97979b',
  500: '#7f8084',
  600: '#6a6b70',
  700: '#55565b',
  800: '#3f4046',
  900: '#2c2c34',
  950: '#16161d',
};

export const MyPreset = definePreset(Lara, {
  semantic: {
    primary: palette('{indigo}'),
    colorScheme: {
      light: { surface: sohoSurface },
      dark: { surface: sohoSurface },
    },
  },
});
