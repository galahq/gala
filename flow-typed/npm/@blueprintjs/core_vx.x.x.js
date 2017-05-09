// flow-typed signature: b1b677fe36048ce994b3d3910c5a6a4e
// flow-typed version: <<STUB>>/@blueprintjs/core_v^1.6.0/flow_v0.43.1

declare module '@blueprintjs/core' {

  //
  // Constants
  //
  declare export type PRIMARY = "PRIMARY"
  declare export type SUCCESS = "SUCCESS"
  declare export type WARNING = "WARNING"
  declare export type DANGER = "DANGER"
  declare export type IntentType = PRIMARY | SUCCESS | WARNING | DANGER

  declare export class Intent {
    static PRIMARY: PRIMARY;
    static SUCCESS: SUCCESS;
    static WARNING: WARNING;
    static DANGER: DANGER;
  }

  declare export type TOP_LEFT = "TOP_LEFT"
  declare export type TOP = "TOP"
  declare export type TOP_RIGHT = "TOP_RIGHT"
  declare export type RIGHT_TOP = "RIGHT_TOP"
  declare export type RIGHT = "RIGHT"
  declare export type RIGHT_BOTTOM = "RIGHT_BOTTOM"
  declare export type BOTTOM_RIGHT = "BOTTOM_RIGHT"
  declare export type BOTTOM = "BOTTOM"
  declare export type BOTTOM_LEFT = "BOTTOM_LEFT"
  declare export type LEFT_BOTTOM = "LEFT_BOTTOM"
  declare export type LEFT = "LEFT"
  declare export type LEFT_TOP = "LEFT_TOP"
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

  //
  // Interfaces
  //
  declare export type IActionProps = {
    disabled?: boolean,
    text?: string,
    iconName?: string,
  } & IIntentProps

  declare export type IIntentProps = {
    intent?: IntentType,
  }

  declare export type IOptionProps = {
    disabled?: boolean,
    label?: string,
    value?: string,
  }

  //
  // Components
  //
  declare export class Button extends React$Component {
    props: {
      active?: boolean,
    } & IActionProps
  }

  declare export class Dialog extends React$Component {
    props: {
      isOpen: boolean,
      title: string | React$Component<*,*,*>,
    }
  }

  declare export class Tooltip extends React$Component {
    props: {
      isDisabled?: boolean,
      content: string,
    } & IIntentProps
  }

  declare export class RadioGroup extends React$Component {
    props: {
      disabled?: boolean,
      label?: string,
      name?: string,
      onChange: (event: SyntheticInputEvent) => void,
      options?: IOptionProps[],
      selectedValue?: string,
    }
  }

}
