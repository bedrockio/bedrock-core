import { StyleSheet, Platform } from 'react-native';

import constants from 'constants';

// Debug.
const debug = {
  borderWidth: StyleSheet.hairlineWidth,
  borderColor: 'red'
};

// Layout.
const flex = {
  flex: 1
};

const centerChildren = {
  alignItems: 'center',
  justifyContent: 'center'
};

const center = {
  ...flex,
  ...centerChildren
};

// Box.
const box = {
  ...shadow,
  marginBottom: constants.spacing.base,
  padding: constants.spacing.large,
  backgroundColor: constants.colors.white,
  borderWidth: StyleSheet.hairlineWidth,
  borderColor: constants.colors.gray,
  borderRadius: constants.spacing.base
};

// Text.
const text = {
  margin: constants.spacing.base
};

const interfaceText = {
  fontFamily: 'adelleSans',
  fontSize: 22
};

// Shadow.
const shadow = {
  shadowRadius: constants.spacing.small,
  shadowColor: 'black',
  shadowOpacity: 0.1,
  shadowOffset: {
    width: 0,
    height: 0
  }
};

export default StyleSheet.create({
  // Layout.
  flex,
  center,
  centerChildren,

  stretch: {
    ...center,
    alignItems: 'stretch',
    padding: constants.spacing.large
  },

  row: {
    flexDirection: 'row'
  },

  // Box.
  box,

  listBox: {
    ...box,
    marginBottom: constants.spacing.large
  },

  // Text.
  text: {
    ...text,
    fontFamily: 'portada',
    fontSize: 22,
    lineHeight: 30
  },

  smallText: {
    fontSize: 18
  },

  interfaceText,

  titleText: {
    ...text,
    color: constants.colors.indigo,
    fontFamily: 'apercuBold',
    fontSize: 32
  },

  interfaceTextWithCenteringAdjustment: {
    ...interfaceText,
    paddingTop: Platform.OS === 'ios' ? 5 : null
  },

  // Inputs.
  borderedInput: {
    ...shadow,
    backgroundColor: constants.colors.white,
    borderWidth: 1,
    borderColor: constants.colors.gray,
    borderRadius: constants.spacing.small,
    shadowOpacity: 0.05
  },

  inputWithError: {
    borderColor: constants.colors.green
  },

  // Shadow.
  shadow,

  // Header.
  header: {
    backgroundColor: constants.colors.indigo
  },

  headerTitle: {
    ...interfaceText,
    paddingTop: 3,
    fontSize: 19
  },

  card: {
    backgroundColor: constants.colors.background
  },

  // Debug.
  debug
});
