export enum ManagerView {
    OpenOrders,
    Funds,
  }
  
  export const getManagerViewText = (managerView: ManagerView) => {
    if (managerView === ManagerView.OpenOrders) {
      return "openOrders";
    } else if (managerView === ManagerView.Funds) {
      return "funds";
    }
  };
  
  export const getAllManagerView = () => {
    return [ManagerView.OpenOrders, ManagerView.Funds];
  };