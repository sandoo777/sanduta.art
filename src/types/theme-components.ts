/**
 * Theme - Component Styles
 * Tipuri pentru stilizarea componentelor UI
 */

export interface ComponentsConfig {
  button: ButtonStyle;
  card: CardStyle;
  input: InputStyle;
  badge: BadgeStyle;
  alert: AlertStyle;
  modal: ModalStyle;
}

export interface ButtonStyle {
  borderRadius: string;
  padding: string;
  fontSize: string;
  fontWeight: number;
  shadow: string;
  hover: {
    scale: number;
    brightness: number;
  };
  variants: {
    primary: ComponentVariant;
    secondary: ComponentVariant;
    outline: ComponentVariant;
    ghost: ComponentVariant;
  };
}

export interface CardStyle {
  borderRadius: string;
  padding: string;
  shadow: string;
  border: string;
  backgroundColor: string;
  hover: {
    shadow: string;
    transform: string;
  };
}

export interface InputStyle {
  borderRadius: string;
  padding: string;
  fontSize: string;
  border: string;
  focusBorder: string;
  backgroundColor: string;
}

export interface BadgeStyle {
  borderRadius: string;
  padding: string;
  fontSize: string;
  fontWeight: number;
}

export interface AlertStyle {
  borderRadius: string;
  padding: string;
  border: string;
  shadow: string;
}

export interface ModalStyle {
  borderRadius: string;
  padding: string;
  shadow: string;
  backdrop: string;
  maxWidth: string;
}

export interface ComponentVariant {
  background: string;
  color: string;
  border?: string;
}
