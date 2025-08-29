export enum ViewMode {
  CARDS = 'cards',
  CHAT = 'chat'
}

export interface AppState {
  viewMode: ViewMode;
  currentConversationId: number | null;
  isTimelineExpanded: boolean;
}