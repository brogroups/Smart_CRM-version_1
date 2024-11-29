const { loginEvent, createUserEvent, updateUserEvent, getAllUsersEvent, deleteOneUserEvent, 
  createFirmaEvent, listFirmaEvent, updateFirmaEvent, deleteFirmaEvent, 
  createPaymentEvent, listPaymentEvent, updatePaymentEvent, deletePaymentEvent, 
  createSalesEvent, listSalesEvent, updateSalesEvent, deleteSalesEvent, 
  createInvalidEvent, listInvalidEvent, updateInvalidEvent, deleteInvalidEvent, 
  updateOrderPaymentEvent,
  createOrderEvent, listOrderEvent, updateOrderEvent, deleteOrderEvent, OneProductEvent,listArchiveEvent,
  workerCommentEvent, oneFirmaEvent,
  createDayDebtsEvent, listDayDebtsEvent, updateDayDebtsEvent, deleteDayDebtsEvent, 
  createLeadEvent, listLeadEvent, updateLeadEvent, deleteLeadEvent,
  createWorkerEvent,UpdateWorkerEvent,DeleteWorkerHistory,ListWorkerEvent,OneWorkerEvent,notificationEvent,
  listStatisticEvent,listIncrementEvent,listDecrementEvent,listExpectedEvent, listDayDecrementsEvent,
  listDayIncrementsEvent, listMonthDecrementsEvent, listMonthIncrementsEvent,
  exitArchiveEvent,
  oneOrderRasxodEvent,
  oneSalesEvent,
  createMyProductEvent,
  listMyProductEvent,
  updateMyProductEvent,
  deleteMyProductEvent,
  createOrderPaymentEvent,
  listOrderPaymentEvent,
  deleteOrderPaymentEvent,
  createOneSalesEvent,
  createManySalesEvent,
  deleteSatisfactionEvent,
  createWorkerPaymentEvent
} = require("@/universal/eventNames");

const { loginUser } = require("./controllers/login.controller");
const { createUser, updateUser, listUser, deleteUser } = require("./controllers/user.controller");
const { createFirma, listFirma, updateFirma, deleteFirma, oneFirma } = require("./controllers/firma-items/firma.controller");
const { createPayment, listPayment, updatePayment, deletePayment } = require("./controllers/firma-items/payed.controller");
const { listSales, updateSales, deleteSales, oneSales, createOneSales, createManySales } = require("./controllers/firma-items/sales-product.controller");
const { createInvalid, updateInvalid, deleteInvalid, listInvalids } = require("./controllers/order/invalid.controller");
const { createOrder, listOrder, updateOrder, deleteOrder, workerComment, oneOrder, oneOrderSatisfaction, deleteSatisfaction } = require("./controllers/order/order.controller");
const { createDayDebts, listDayDebts, updateDayDebts, deleteDayDebts } = require("./controllers/day-debts.controller");
const { createLead, listLead, updateLead, deleteLead } = require("./controllers/lead.controller");
const { createWorker, updateWorker, deleteWorker, listWorkers, oneWorker } = require("./controllers/worker-items/worker.controller");
const { listNotification } = require("./controllers/notification.controller");
const { listStatistic, listIncrement, listDecrement, listExpected } = require("./controllers/statistic.controller");
const { listDayDecrements, listDayIncrements } = require("./controllers/day.controller");
const { listMonthDecrements, listMonthIncrements } = require("./controllers/month.controller");
const {listArchive,exitArchive} = require('./controllers/order/archive.controller');
const { createMyProduct, listMyProducts, updateMyProduct, deleteMyProduct } = require("./controllers/my-product.controller");
const { createOrderPayment, listOrderPayment, updateOrderPayment, deleteOrderPayment } = require("./controllers/order/order-payment.controller");
const { createWorkerPayment } = require("./controllers/worker-items/worker.payment");
module.exports.eventController = async (ipcMain) => {
try {
  ipcMain.handle(deleteSatisfactionEvent, deleteSatisfaction)

  ipcMain.handle(oneOrderRasxodEvent, oneOrderSatisfaction)
  
  ipcMain.handle(createOrderPaymentEvent, createOrderPayment)
  ipcMain.handle(listOrderPaymentEvent, listOrderPayment)
  ipcMain.handle(updateOrderPaymentEvent, updateOrderPayment)
  ipcMain.handle(deleteOrderPaymentEvent, deleteOrderPayment)
  
  ipcMain.handle(createMyProductEvent, createMyProduct)
  ipcMain.handle(listMyProductEvent, listMyProducts)
  ipcMain.handle(updateMyProductEvent, updateMyProduct)
  ipcMain.handle(deleteMyProductEvent, deleteMyProduct)

  ipcMain.handle(listDayDecrementsEvent, listDayDecrements);
  ipcMain.handle(listDayIncrementsEvent, listDayIncrements);
  ipcMain.handle(listMonthDecrementsEvent, listMonthDecrements);
  ipcMain.handle(listMonthIncrementsEvent, listMonthIncrements);
  
  ipcMain.handle(notificationEvent, listNotification);

  ipcMain.handle(listStatisticEvent, listStatistic);
  ipcMain.handle(listIncrementEvent, listIncrement);
  ipcMain.handle(listDecrementEvent, listDecrement);
  ipcMain.handle(listExpectedEvent, listExpected);

  ipcMain.handle(loginEvent, loginUser);
  ipcMain.handle(createUserEvent, createUser);
  ipcMain.handle(updateUserEvent, updateUser);
  ipcMain.handle(getAllUsersEvent, listUser);
  ipcMain.handle(deleteOneUserEvent, deleteUser);

  ipcMain.handle(createFirmaEvent, createFirma);
  ipcMain.handle(listFirmaEvent, listFirma);
  
  ipcMain.handle(oneFirmaEvent, oneFirma)

  ipcMain.handle(updateFirmaEvent, updateFirma);
  ipcMain.handle(deleteFirmaEvent, deleteFirma);

  ipcMain.handle(createPaymentEvent, createPayment);
  ipcMain.handle(listPaymentEvent, listPayment);
  ipcMain.handle(updatePaymentEvent, updatePayment);
  ipcMain.handle(deletePaymentEvent, deletePayment);

  ipcMain.handle(createOneSalesEvent, createOneSales);
  ipcMain.handle(createManySalesEvent, createManySales);
  

  ipcMain.handle(listSalesEvent, listSales);
  ipcMain.handle(oneSalesEvent, oneSales)
  ipcMain.handle(updateSalesEvent, updateSales);
  ipcMain.handle(deleteSalesEvent, deleteSales);

  ipcMain.handle(createInvalidEvent, createInvalid);
  ipcMain.handle(listInvalidEvent, listInvalids);
  ipcMain.handle(updateInvalidEvent, updateInvalid);
  ipcMain.handle(deleteInvalidEvent, deleteInvalid);

  ipcMain.handle(createOrderEvent, createOrder);
  ipcMain.handle(listOrderEvent, listOrder);
  ipcMain.handle(updateOrderEvent, updateOrder);
  ipcMain.handle(deleteOrderEvent, deleteOrder);
  ipcMain.handle(OneProductEvent,oneOrder)

  ipcMain.handle(workerCommentEvent, workerComment);

  ipcMain.handle(createDayDebtsEvent, createDayDebts);
  ipcMain.handle(listDayDebtsEvent, listDayDebts);
  ipcMain.handle(updateDayDebtsEvent, updateDayDebts);
  ipcMain.handle(deleteDayDebtsEvent, deleteDayDebts);

  ipcMain.handle(createLeadEvent, createLead);
  ipcMain.handle(listLeadEvent, listLead);
  ipcMain.handle(updateLeadEvent, updateLead);
  ipcMain.handle(deleteLeadEvent, deleteLead);

  ipcMain.handle(createWorkerEvent, createWorker)
  ipcMain.handle(UpdateWorkerEvent, updateWorker)
  ipcMain.handle(DeleteWorkerHistory, deleteWorker)
  ipcMain.handle(ListWorkerEvent, listWorkers)
  ipcMain.handle(OneWorkerEvent, oneWorker)
  ipcMain.handle(createWorkerPaymentEvent,createWorkerPayment)


  ipcMain.handle(listArchiveEvent,listArchive)
  ipcMain.handle(exitArchiveEvent,exitArchive)

} catch (error) {
  console.log(error);
}
};
