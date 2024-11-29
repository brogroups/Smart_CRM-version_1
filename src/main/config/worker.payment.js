const { deleteCache } = require("../global/helpers/redis.helper");
const WorkerModel = require("../models/worker/worker.model");

const checkWorkerPayments = async () => {
  const workers = await WorkerModel.find({ summaType: 'month' });

  workers.forEach(async (worker) => {
    const currentDate = new Date();
    const createdAt = worker.createdAt;
    const monthDiff = (currentDate.getFullYear() - createdAt.getFullYear()) * 12 + currentDate.getMonth() - createdAt.getMonth();


    if (monthDiff >= 1) {
      const monthsPassed = monthDiff;
      const totalCashToAdd = worker.price * monthsPassed;

      await WorkerModel.updateOne(
        { _id: worker._id },
        {
          $inc: { totalCash: totalCashToAdd },
          createdAt: currentDate
        }
      );

      
      await deleteCache('worker_list');
      console.log(`${worker.name} получил(а) выплату за ${monthsPassed} месяц(ев).`);
    } else {
      console.log(`Для сотрудника ${worker.name} ещё не прошёл месяц.`);
    }
  });
};

module.exports = checkWorkerPayments;
