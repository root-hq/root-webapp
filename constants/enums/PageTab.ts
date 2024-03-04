export enum PageTab {
    Trade,
    Bots,
  }
  
  export const getPageTabText = (pageTab: PageTab) => {
    if (pageTab === PageTab.Trade) {
      return "trade";
    } else if (pageTab === PageTab.Bots) {
      return "bots";
    }
  };
  
  export const getAllPageTabs = () => {
    return [PageTab.Trade, PageTab.Bots];
  };
  