export enum BotManagerView {
    ActiveBots,
    History,
  }
  
  export const getManagerViewText = (managerView: BotManagerView) => {
    if (managerView === BotManagerView.ActiveBots) {
      return "activeBots";
    } else if (managerView === BotManagerView.History) {
      return "history";
    }
  };
  
  export const getAllManagerView = () => {
    return [BotManagerView.ActiveBots, BotManagerView.History];
  };
  