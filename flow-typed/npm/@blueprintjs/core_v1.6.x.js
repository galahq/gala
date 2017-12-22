// flow-typed signature: b1b677fe36048ce994b3d3910c5a6a4e
// flow-typed version: <<STUB>>/@blueprintjs/core_v^1.6.0/flow_v0.43.1

import * as React from 'react'

declare module '@blueprintjs/core' {
  //
  // Constants
  //
  declare export type PRIMARY = 'PRIMARY'
  declare export type SUCCESS = 'SUCCESS'
  declare export type WARNING = 'WARNING'
  declare export type DANGER = 'DANGER'
  declare export type IntentType =
    | PRIMARY
    | SUCCESS
    | WARNING
    | DANGER
    | typeof undefined

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
    onClick?: (SyntheticEvent<*>) => any,
  }

  declare export interface IBackdropProps {
    backdropClassName?: string,
    backdropProps?: HTMLDivElement,
    canOutsideClickClose?: boolean,
    hasBackdrop?: boolean,
  }

  declare export interface IControlledProps {
    defaultValue?: string,
    onChange?: (SyntheticInputEvent<*>) => any,
    value?: string,
  }

  declare export interface IControlProps {
    checked?: boolean,
    defaultChecked?: boolean,
    disabled?: boolean,
    inputRef?: HTMLInputElement => any,
    label?: string,
    onChange?: (SyntheticInputEvent<*>) => any,
  }

  declare export interface IIntentProps {
    intent?: IntentType,
  }

  declare export interface ILinkProps {
    href?: string,
    target?: '_self' | '_blank' | '_parent' | '_top',
  }

  declare export interface IOptionProps {
    className?: string,
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
    onClose?: (SyntheticEvent<*>) => any,
    transitionDuration?: number,
  }

  //
  // Components
  //
  declare export class AnchorButton extends React.Component<
    {
      active?: boolean,
    } & IActionProps
  > {}

  declare export class Button extends React.Component<
    {
      active?: boolean,
    } & IActionProps
  > {}

  declare export class EditableText extends React.Component<
    {
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
      IIntentProps
  > {}

  declare export class Dialog extends React.Component<
    {
      iconName?: string,
      isCloseButtonShown?: boolean,
      isOpen: boolean,
      style: Object,
      title: React.Node,
    } & IProps &
      IBackdropProps &
      IOverlayableProps
  > {}

  declare export class InputGroup extends React.Component<
    {
      disabled?: boolean,
      intent?: IntentType,
      leftIconName?: string,
      placeholder?: string,
      rightElement?: React.Node,
      type?: string,
    } & IProps &
      IControlledProps
  > {}

  declare export class Menu extends React.Component<
    { ulRef?: (ref: HTMLUListElement) => any } & IProps
  > {}

  declare export class MenuItem extends React.Component<
    {
      label?: React.Node,
      shouldDismissPopover?: boolean,
      submenu?: Array<$PropertyType<MenuItem, 'props'>>,
      submenuViewportMargin?: { left?: number, right?: number },
      text: string,
      useSmartPositioning?: boolean,
    } & IProps &
      IActionProps &
      ILinkProps
  > {}

  declare export class NonIdealState extends React.Component<
    {
      action?: React.Node,
      description?: React.Node,
      title?: string,
      visual?: React.Node,
    } & IProps
  > {}

  declare export class Popover extends React.Component<
    {
      backdropProps?: HTMLDivElement,
      content?: React.Node,
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
      target?: React.Node,
      tetherOptions?: Object,
      useSmartArrowPositioning?: boolean,
    } & IOverlayableProps &
      IProps
  > {}

  declare export class Portal extends React.Component<{}> {}

  declare export class Radio extends React.Component<IControlProps & IProps> {}

  declare export class RadioGroup extends React.Component<{
    disabled?: boolean,
    label?: string,
    name?: string,
    onChange: (SyntheticInputEvent<*>) => any,
    options?: IOptionProps[],
    selectedValue?: string,
  }> {}

  declare export type Toast = {
    action?: IActionProps & ILinkProps,
    message: string,
    onDismiss?: (didTimoutExpire: boolean) => any,
    iconName?: string,
    timeout?: number,
  } & IProps &
    IIntentProps

  declare export class Toaster extends React.Component<{}> {
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

  declare export class Tooltip extends React.Component<
    {
      content: React.Node,
      defaultIsOpen?: boolean,
      hoverCloseDelay?: number,
      hoverOpenDelay?: number,
      inheritDarkTheme?: boolean,
      inline?: boolean,
      isDisabled?: boolean,
      isOpen?: boolean,
      onInteraction?: (nextOpenState: boolean) => void,
      openOnTargetFocus?: boolean,
      portalClassName?: string,
      position?: PositionType,
      rootElementTag?: string,
      tooltipClassName?: string,
      transitionDuration?: number,
      useSmartArrowPositioning?: boolean,
      useSmartPositioning?: boolean,
    } & IIntentProps & IProps
  > {}
}
