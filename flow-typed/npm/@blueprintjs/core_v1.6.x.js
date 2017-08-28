// flow-typed signature: b1b677fe36048ce994b3d3910c5a6a4e
// flow-typed version: <<STUB>>/@blueprintjs/core_v^1.6.0/flow_v0.43.1

declare module '@blueprintjs/core' {
  //
  // Constants
  //
  declare export type PRIMARY = 'PRIMARY'
  declare export type SUCCESS = 'SUCCESS'
  declare export type WARNING = 'WARNING'
  declare export type DANGER = 'DANGER'
  declare export type IntentType = PRIMARY | SUCCESS | WARNING | DANGER

  declare export interface Intent {
    static PRIMARY: PRIMARY,
    static SUCCESS: SUCCESS,
    static WARNING: WARNING,
    static DANGER: DANGER,
  }

  declare export type TOP_LEFT = 'TOP_LEFT'
  declare export type TOP = 'TOP'
  declare export type TOP_RIGHT = 'TOP_RIGHT'
  declare export type RIGHT_TOP = 'RIGHT_TOP'
  declare export type RIGHT = 'RIGHT'
  declare export type RIGHT_BOTTOM = 'RIGHT_BOTTOM'
  declare export type BOTTOM_RIGHT = 'BOTTOM_RIGHT'
  declare export type BOTTOM = 'BOTTOM'
  declare export type BOTTOM_LEFT = 'BOTTOM_LEFT'
  declare export type LEFT_BOTTOM = 'LEFT_BOTTOM'
  declare export type LEFT = 'LEFT'
  declare export type LEFT_TOP = 'LEFT_TOP'
  declare export type PositionType =
    | TOP_LEFT
    | TOP
    | TOP_RIGHT
    | RIGHT_TOP
    | RIGHT
    | RIGHT_BOTTOM
    | BOTTOM_RIGHT
    | BOTTOM
    | BOTTOM_LEFT
    | LEFT_BOTTOM
    | LEFT
    | LEFT_TOP

  declare export interface Position {
    static TOP_LEFT: TOP_LEFT,
    static TOP: TOP,
    static TOP_RIGHT: TOP_RIGHT,
    static RIGHT_TOP: RIGHT_TOP,
    static RIGHT: RIGHT,
    static RIGHT_BOTTOM: RIGHT_BOTTOM,
    static BOTTOM_RIGHT: BOTTOM_RIGHT,
    static BOTTOM: BOTTOM,
    static BOTTOM_LEFT: BOTTOM_LEFT,
    static LEFT_BOTTOM: LEFT_BOTTOM,
    static LEFT: LEFT,
    static LEFT_TOP: LEFT_TOP,
  }

  declare export type CLICK = 'CLICK'
  declare export type CLICK_TARGET_ONLY = 'CLICK_TARGET_ONLY'
  declare export type HOVER = 'HOVER'
  declare export type HOVER_TARGET_ONLY = 'HOVER_TARGET_ONLY'
  declare export type PopoverInteractionKindType =
    | CLICK
    | CLICK_TARGET_ONLY
    | HOVER
    | HOVER_TARGET_ONLY

  declare export interface PopoverInteractionKind {
    static CLICK: CLICK,
    static CLICK_TARGET_ONLY: CLICK_TARGET_ONLY,
    static HOVER: HOVER,
    static HOVER_TARGET_ONLY: HOVER_TARGET_ONLY,
  }

  //
  // Interfaces
  //
  declare export interface IProps {
    className?: string,
  }

  declare export interface IActionProps {
    disabled?: boolean,
    text?: string,
    iconName?: string,
    onClick?: SyntheticEvent => any,
  }

  declare export interface IBackdropProps {
    backdropClassName?: string,
    backdropProps?: HTMLDivElement,
    canOutsideClickClose?: boolean,
    hasBackdrop?: boolean,
  }

  declare export interface IControlledProps {
    defaultValue?: string,
    onChange?: SyntheticInputEvent => any,
    value?: string,
  }

  declare export interface IControlProps {
    checked?: boolean,
    defaultChecked?: boolean,
    disabled?: boolean,
    inputRef?: HTMLInputElement => any,
    label?: string,
    onChange?: SyntheticInputEvent => any,
  }

  declare export interface IIntentProps {
    intent?: IntentType,
  }

  declare export interface ILinkProps {
    href?: string,
    target?: '_self' | '_blank' | '_parent' | '_top',
  }

  declare export interface IOptionProps {
    disabled?: boolean,
    label?: string,
    value?: string,
  }

  declare export interface IOverlayableProps {
    autoFocus?: boolean,
    canEscapeKeyClose?: boolean,
    enforceFocus?: boolean,
    inline?: boolean,
    lazy?: boolean,
    onClose?: SyntheticEvent => any,
    transitionDuration?: number,
  }

  //
  // Components
  //
  declare export interface Button extends React$Component<*, *, *> {
    props: {
      active?: boolean,
    } & IActionProps,
  }

  declare export interface EditableText extends React$Component<*, *, *> {
    props: {
      confirmOnEnterKey?: boolean,
      defaultValue?: string,
      disabled?: boolean,
      isEditing?: boolean,
      maxLength?: number,
      maxLines?: number,
      minLines?: number,
      minWidth?: number,
      multiline?: boolean,
      onCancel?: string => any,
      onChange?: string => any,
      onConfirm?: string => any,
      onEdit?: () => any,
      placeholder?: string,
      selectAllOnFocus?: boolean,
      value?: string,
    } & IProps &
      IIntentProps,
  }

  declare export interface Dialog extends React$Component<*, *, *> {
    props: {
      iconName?: string,
      isCloseButtonShown?: boolean,
      isOpen: boolean,
      style: Object,
      title: string | React$Element<*>,
    } & IProps &
      IBackdropProps &
      IOverlayableProps,
  }

  declare export interface InputGroup extends React$Component<*, *, *> {
    props: {
      disabled?: boolean,
      intent?: IntentType,
      leftIconName?: string,
      placeholder?: string,
      rightElement?: React$Element<*>,
      type?: string,
    } & IProps &
      IControlledProps,
  }

  declare export interface Menu extends React$Component<*, *, *> {
    props: { ulRef: (ref: HTMLUListElement) => any } & IProps,
  }

  declare export interface MenuItem extends React$Component<*, *, *> {
    props: {
      label?: string | React$Element<*>,
      shouldDismissPopover?: boolean,
      submenu?: Array<$PropertyType<MenuItem, 'props'>>,
      submenuViewportMargin?: { left?: number, right?: number },
      text: string,
      useSmartPositioning?: boolean,
    } & IProps &
      IActionProps &
      ILinkProps,
  }

  declare export interface NonIdealState extends React$Component<*, *, *> {
    props: {
      action?: React$Element<*>,
      description?: string | React$Element<*>,
      title?: string,
      visual?: string | React$Element<*>,
    } & IProps,
  }

  declare export interface Popover extends React$Component<*, *, *> {
    props: {
      backdropProps?: HTMLDivElement,
      content?: string | React$Element<*>,
      defaultIsOpen?: boolean,
      hoverCloseDelay?: number,
      hoverOpenDelay?: number,
      inheritDarkTheme?: boolean,
      interactionKind?: PopoverInteractionKindType,
      isDisabled?: boolean,
      isModal?: boolean,
      isOpen?: boolean,
      onInteraction?: (nextOpenState: boolean) => void,
      popoverClassName?: string,
      popoverDidOpen?: () => void,
      popoverWillClose?: () => void,
      popoverWillOpen?: () => void,
      portalClassName?: string,
      position?: PositionType,
      rootElementTag?: string,
      target?: string | React$Element<*>,
      tetherOptions?: Object,
      useSmartArrowPositioning?: boolean,
    } & IOverlayableProps &
      IProps,
  }

  declare export interface Portal extends React$Component<*, *, *> {}

  declare export interface Radio extends React$Component<*, *, *> {
    props: IControlProps & IProps,
  }

  declare export interface RadioGroup extends React$Component<*, *, *> {
    props: {
      disabled?: boolean,
      label?: string,
      name?: string,
      onChange: (event: SyntheticInputEvent) => any,
      options?: IOptionProps[],
      selectedValue?: string,
    },
  }

  declare export type Toast = {
    action?: IActionProps & ILinkProps,
    message: string,
    onDismiss?: (didTimoutExpire: boolean) => any,
    iconName?: string,
    timeout?: number,
  } & IProps &
    IIntentProps

  declare export interface Toaster extends React$Component<*, *, *> {
    static create(
      props: ?({
        autoFocus?: boolean,
        canEscapeKeyClear?: boolean,
        inline?: boolean,
        position?: Position,
      } & IProps),
      container: ?HTMLElement
    ): Toaster,
    show(props: Toast): string,
    update(key: string, props: Toast): void,
    dismiss(key: string): void,
    clear(): void,
    getToasts(): Toast[],
  }

  declare export interface Tooltip extends React$Component<*, *, *> {
    props: {
      isDisabled?: boolean,
      content: string,
    } & IIntentProps,
  }
}
