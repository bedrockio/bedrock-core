type IconSize = 'vsmall' | 'small' | 'medium' | 'large' | 'extraLarge';
const STEPS = [
  {
    text: 'Working...',
    image: 'wizard',
    size: 'medium',
    styles: wizardStyles,
  },
  {
    text: 'Big Stretch...',
    image: 'one-paw',
    size: 'large',
    styles: pawStyles,
  },
  {
    text: 'Go Play...',
    image: 'two-paw',
    size: 'large',
    styles: pawStyles,
  },
  {
    text: 'Chasing Tails...',
    size: 'large',
    image: 'three-paw',
    styles: pawStyles,
  },
] as { text: String; size: IconSize; image: 'string'; styles: any }[];
