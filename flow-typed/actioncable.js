declare class ActionCable$Consumer {
  send(data: mixed): boolean,
  connect(): boolean,
  disconnect({ allowReconnect: boolean }): boolean,
  ensureActiveConnection(): boolean,

  subscriptions: ActionCable$Subscriptions,
}

declare class ActionCable$Subscription {
  perform(action: string, data: object): boolean,
  send(data: object): boolean,
  unsubscribe(): void,

  identifier: string,  // Stringified JSON params
}

declare class ActionCable$Subscriptions {
  create(
    params: string | { channel: string },
    mixin: {[string]: Function}
  ): ActionCable$Subscription,
}

declare type ActionCable = {
  [key: string]: ActionCable$Subscription,
  cable: ActionCable$Consumer,
}

declare var App: ActionCable
