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

  declare export class Intent {
    static PRIMARY: PRIMARY;
    static SUCCESS: SUCCESS;
    static WARNING: WARNING;
    static DANGER: DANGER;
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

  declare export class Position {
    static TOP_LEFT: TOP_LEFT;
    static TOP: TOP;
    static TOP_RIGHT: TOP_RIGHT;
    static RIGHT_TOP: RIGHT_TOP;
    static RIGHT: RIGHT;
    static RIGHT_BOTTOM: RIGHT_BOTTOM;
    static BOTTOM_RIGHT: BOTTOM_RIGHT;
    static BOTTOM: BOTTOM;
    static BOTTOM_LEFT: BOTTOM_LEFT;
    static LEFT_BOTTOM: LEFT_BOTTOM;
    static LEFT: LEFT;
    static LEFT_TOP: LEFT_TOP;
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

  declare export class PopoverInteractionKind {
    static CLICK: CLICK;
    static CLICK_TARGET_ONLY: CLICK_TARGET_ONLY;
    static HOVER: HOVER;
    static HOVER_TARGET_ONLY: HOVER_TARGET_ONLY;
  }

  //
  // Interfaces
  //
  declare export type IProps = {
    className?: string;
  }

  declare export type IActionProps = {
    disabled?: boolean;
    text?: string;
    icon?: string | React.Node;
    onClick?: (SyntheticEvent<*>) => any;
  }

  declare export type IBackdropProps = {
    backdropClassName?: string;
    backdropProps?: HTMLDivElement;
    canOutsideClickClose?: boolean;
    hasBackdrop?: boolean;
  }

  declare export type IButtonProps = IActionProps & { active?: boolean }

  declare export type IControlledProps = {
    defaultValue?: string;
    onChange?: (SyntheticInputEvent<*>) => any;
    value?: string;
  }

  declare export type IControlProps = {
    checked?: boolean;
    defaultChecked?: boolean;
    disabled?: boolean;
    inputRef?: HTMLInputElement => any;
    label?: string;
    onChange?: (SyntheticInputEvent<*>) => any;
  }

  declare export type IDialogProps = IProps &
    IBackdropProps &
    IOverlayableProps & {
      icon?: string,
      isCloseButtonShown?: boolean,
      isOpen: boolean,
      style: Object,
      title: React.Node,
    }

  declare export type IEditableTextProps = IProps &
    IIntentProps & {
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
    }

    declare export type IFormGroupProps = IIntentProps &
      IProps & {
        disabled?: boolean,
        helperText?: React.Node,
        inline?: boolean,
        label?: React.Node,
        labelFor?: string,
        requiredLabel?: boolean | React.Node,
      }

  declare export type IIntentProps = {
    intent?: IntentType;
  }

  declare export type ILinkProps = {
    href?: string;
    target?: '_self' | '_blank' | '_parent' | '_top';
  }

  declare export type IOptionProps = {
    className?: string;
    disabled?: boolean;
    label?: string;
    value?: string;
  }

  declare export type IOverlayableProps = {
    autoFocus?: boolean;
    canEscapeKeyClose?: boolean;
    enforceFocus?: boolean;
    inline?: boolean;
    lazy?: boolean;
    onClose?: (SyntheticEvent<*>) => any;
    transitionDuration?: number;
  }

  declare export type IPopoverProps = IOverlayableProps &
    IProps & {
      backdropProps?: HTMLDivElement,
      content?: React.Node,
      defaultIsOpen?: boolean,
      disabled?: boolean,
      hasBackdrop?: boolean,
      hoverCloseDelay?: number,
      hoverOpenDelay?: number,
      inheritDarkTheme?: boolean,
      interactionKind?: PopoverInteractionKindType,
      isOpen?: boolean,
      lazy?: boolean,
      minimal?: boolean,
      modifiers?: any, // PopperModifers,
      onInteraction?: (nextOpenState: boolean) => void,
      openOnTargetFocus?: boolean,
      popoverClassName?: string,
      popoverDidClose?: () => void,
      popoverDidOpen?: () => void,
      popoverRef?: (?HTMLDivElement) => void,
      popoverWillClose?: () => void,
      popoverWillOpen?: () => void,
      portalClassName?: string,
      position?: PositionType,
      rootElementTag?: string,
      target?: React.Node,
      targetClassName?: string,
      targetElementTag?: string,
      usePortal?: boolean,
    }

  declare export type ITagInputProps = IProps & {
    addOnBlur?: boolean,
    disabled?: boolean,
    fill?: boolean,
    inputProps?: $Shape<HTMLInputElement>,
    inputRef?: ?HTMLInputElement => void,
    inputValue?: string,
    large?: boolean,
    leftIcon?: string | React.Node,
    onAdd?: (values: string[])=> ?boolean,
    onChange?: (values: React.Node[]) => ?boolean,
    onInputChange?: SyntheticInputEvent<*> => mixed,
    onKeyDown?: SyntheticKeyboardEvent<*> => mixed,
    onKeyUp?: SyntheticKeyboardEvent<*> => mixed,
    onRemove?: (value: string, index: number) => mixed,
    placeholder?: string,
    rightElement?: React.Node,
    separator?: string | RegExp | false,
    tagProps?: ITagProps | (value: React.Node, index: number) => ITagProps,
    values: React.Node[],
  }

  declare export type ITagProps = IProps & IIntentProps & {
    active?: boolean,
    interactive?: boolean,
    large?: boolean,
    minimal?: boolean,
    onClick?: SyntheticMouseEvent<*> => mixed,
    onRemove?: (SyntheticMouseEvent<*>, ITagProps) => mixed,
    round?: boolean
  }

  //
  // Components
  //
  declare export class AnchorButton extends React.Component<IButtonProps> {}

  declare export class Button extends React.Component<IButtonProps> {}

  declare export class Dialog extends React.Component<IDialogProps> {}

  declare export class EditableText extends React.Component<
    IEditableTextProps
  > {}

  declare export class FormGroup extends React.Component<IFormGroupProps> {}

  declare export class Icon extends React.Component<
    {
      icon: string,
      iconSize?: 'inherit' | 16 | 20,
    } & IProps &
      IIntentProps
  > {}

  declare export class InputGroup extends React.Component<
    {
      disabled?: boolean,
      intent?: IntentType,
      leftIcon?: string,
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

  declare export class Popover extends React.Component<IPopoverProps> {}

  declare export class Portal extends React.Component<{}> {}

  declare export class ProgressBar extends React.Component<
    {
      value: number,
    } & IIntentProps &
      IProps
  > {}

  declare export class Radio extends React.Component<IControlProps & IProps> {}

  declare export class RadioGroup extends React.Component<{
    disabled?: boolean,
    label?: string,
    name?: string,
    onChange: (SyntheticInputEvent<*>) => any,
    options?: IOptionProps[],
    selectedValue?: string,
  }> {}

  declare export class Switch extends React.Component<IControlProps & IProps> {}

  declare export class Tag extends React.Component<ITagProps> {}

  declare export class TagInput extends React.Component<ITagInputProps> {}

  declare export type Toast = {
    action?: IActionProps & ILinkProps,
    message: React.Node,
    onDismiss?: (didTimoutExpire: boolean) => any,
    icon?: string,
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
    ): Toaster;

    clear(): void;
    dismiss(key: string): void;
    getToasts(): Toast[];
    show(props: Toast, key?: string): string;
  }

  declare export class Tooltip extends React.Component<
    {
      content: React.Node,
      defaultIsOpen?: boolean,
      hoverCloseDelay?: number,
      hoverOpenDelay?: number,
      inheritDarkTheme?: boolean,
      inline?: boolean,
      disabled?: boolean,
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
    } & IIntentProps &
      IProps
  > {}
}
