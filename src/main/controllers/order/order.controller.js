const { events } = require("../../events/index");
require("../../events/notification.event");
require('../../events/product-history.event')
require('../../events/all-increment.event')
require('../../events/all-expected.event')
const OrderModel = require("../../models/order/order.model");
const WorkerModel = require("../../models/worker/worker.model");
const {
  updateStatisticsForOrder,
  updateQoldiqStatisticsForOrder,
} = require("../../global/helpers/statistic.helper");
const workerCommentModel = require("../../models/worker/worker-comment.model");
const {
  setCache,
  getCache,
  deleteCache,
} = require("../../global/helpers/redis.helper");
const workerHistoryModel = require("../../models/worker/worker-history.model");
const { newOrderAdd, rmOrder } = require("../../global/helpers/my-product.helper");
const myProductsModel = require("../../models/my-product.model");
const OrderItemModel = require("../../models/order/order-item.model");
const salesProductModel = require("../../models/firma/sales-product.model");
const { createOrderPayment } = require("./order-payment.controller");
const { createPayment } = require("../firma-items/payed.controller");
require("../../events/all-expected.event");

require('../../events/order.event')

module.exports.createOrder = async (event, args) => {
  try {
      const {
          clientName,
          phone,
          products,
          avans,
          price,
          paymentMethod,
          qoldiq = price - avans,
          address,
          startDate,
          endDate,
          workers,
      } = args;

      if (!products || !products.length) {
          return {
              status: 400,
              error: 'Products are required and cannot be empty',
          };
      }

      const workerRefs = await WorkerModel.find({ _id: { $in: workers } });
      if (workerRefs.length !== workers.length) {
          return {
              status: 400,
              error: 'Invalid worker references provided',
          };
      }

      const order = await OrderModel.create({
          clientName,
          phone: phone || '',
          avans,
          price,
          qoldiq,
          products: [],
          satisfactions: [],
          address,
          startDate,
          paymentMethod,
          endDate,
          workers: workerRefs.map((worker) => worker._id),
      });
      events.emit('aset.sila',order.id, avans, Date.now(), 'начальные аванс' )

      const populatedProducts = await Promise.all(
          products.map(async (product) => {
              const myProduct = await myProductsModel.findById(product.id);
              return {
                  productId: myProduct._id,
                  title: myProduct.title,
                  quantity: product.quantity,
                  price: product.price,
              };
          })
      );

      order.products.push(...populatedProducts);
      await order.save();


      const desc = `New order from ${clientName}`;
      events.emit('order.created', avans, qoldiq, Date.now(), desc);
      events.emit('order.created.st', order._id, `Order with price ${avans}`, clientName, avans, Date.now());
      events.emit('order.expected.st', order._id, `Order expected for ${order.qoldiq}`, order.qoldiq);

      await deleteCache('order_list');
      await deleteCache('firma_list');

      return {
          status: 201,
          message: 'Order created successfully',
          data: JSON.parse(JSON.stringify(order)),
      };
  } catch (error) {
      return {
          status: 500,
          error: error.message || 'An error occurred while creating the order',
      };
  }
};

module.exports.oneOrder = async (event, args) => {
  try {
    const { id } = args;
    const order = await OrderModel.findById(id)
    .populate([
      "payments",
      "workers"
    ])

    if (!order) {
      return {
        status: 404,
        message: "Order not found by id",
        data: null,
      };
    }
    return {
      status: 200,
      message: "Order retrieved successfully",
      data: JSON.parse(JSON.stringify(order))
    };
  } catch (error) {
    console.error(error);
  }
};

module.exports.oneOrderSatisfaction = async (event, args) => {
  try {
    const { orderId, rasxodlar } = args;
    const order = await OrderModel.findById(orderId)
    .populate("workers")
    .populate("payments")

    await Promise.all(
      rasxodlar.map(async (satisfaction) => {
        const sales = await salesProductModel.findById(satisfaction.id)
        if(!sales) {
          return {
            status: 404,
            error: 'Sales Product Not Found in one Order Satisfaction'
          }
        }
        const obj = {
          title: sales.name,
          quantity: satisfaction.quantity,
          price: satisfaction.price
        }
        sales.quantity -= obj.quantity
        
        order.satisfactions.push(obj)
        
        await sales.save()
        events.emit('sales.history', 
          order.clientName, sales.name, satisfaction.price, satisfaction.quantity, sales.firmaId, sales.name)
      })
    );
    await order.save()
    if (!order) {
      return {
        status: 404,
        message: "Order not found by id",
        data: null,
      };
    }
   
    return {
      status: 200,
      message: "Order retrieved successfully",
      data: JSON.parse(JSON.stringify(order))
    };
  } catch (error) {
    console.error(error);
  }
};


module.exports.listOrder = async (res, args) => {
  
  try {
    const cachedOrders = await getCache("order_list");
    if (cachedOrders) {
      return {
        status: 200,
        message: "Orders retrieved from cache",
        data: cachedOrders,
      };
    }

    const orders = await OrderModel.find({ isArchive: false }).exec();
    
    await setCache("order_list", orders, 3600);

    return {
      status: 200,
      message: "Orders retrieved from database",
      data: JSON.parse(JSON.stringify(orders)),
    };
  } catch (error) {
    console.error(error);
  }
};


module.exports.updateOrder = async (event, args) => {
  try {
    const {
      id,
      clientName,
      phone,
      avans,
      price,
      qoldiq,
      address,
      startDate,
      endDate,
      products,
      status,
      workers,
    } = args;

    const order = await OrderModel.findById(id);
    if (!order) {
      return {
        status: 404,
        message: "Order not found",
        data: null,
      };
    }
    
    if(status != "Заказ оплачен")  {
      Object.assign(order, {
        clientName: clientName ,
        phone: phone ,
        products: [], 
        address: address ,
        startDate: startDate ,
        endDate: endDate ,
        status: status,
      })
      await order.save();

      await Promise.all(
        products.map(async (product) => {
          const myProduct = await myProductsModel.findById(product.id)
          const item = {
            productId: myProduct._id,
            title: myProduct.title,
            quantity: product.quantity,
            price: product.price,
          }
  
          order.products.push(item)
        })
      );
      await order.save()

      await deleteCache("order_list");
      await deleteCache("worker_list");
      await deleteCache("firma_list");
  
      events.emit('order.deleted.st', order.id)
      events.emit('order.expected.deleted', order.id)
  
      events.emit('order.created.st', order.id, `Заказать по цене ${order.avans}`, order.avans, order.clientName)
      events.emit('order.expected.st', order.id, `Ожидается заказ ${order.qoldiq}`, order.qoldiq, Date.now())
  
      return {
        status: 200,
        message: "Order updated successfully",
        data: JSON.parse(JSON.stringify(order)),
      };
    }

    if (workers && workers.length > 0) {
      const workerRefs = await WorkerModel.find({ _id: { $in: workers } });
      if (workerRefs.length !== workers.length) {
        return {
          status: 400,
          message: "One or more worker references are invalid.",
          data: null,
        };
      }
      order.workers = workerRefs.map((worker) => worker._id);
    }

    if (price !== undefined && price > 0 && price !== order.price) {
      const priceDifference = price - order.price;
      await updateStatisticsForOrder(priceDifference, price > order.price);
      await updateQoldiqStatisticsForOrder(priceDifference, price > order.price);
      order.price = price;
    }

    if (qoldiq !== undefined && qoldiq >= 0 && qoldiq !== order.qoldiq) {
      await updateQoldiqStatisticsForOrder(qoldiq - order.qoldiq, qoldiq > order.qoldiq);
      order.qoldiq = qoldiq;
    }

    if (avans !== undefined && avans >= 0) {
      order.avans = avans;
    }

    if (status === "Заказ оплачен") {
      if(order.isRestored) {
        order.status = "Заказ оплачен";
        order.isArchive = true
        order.save()
        await deleteCache("order_list");
        return {
          status: 200,
          message: 'Success'
        }
      }
      
      const workerRefs = await WorkerModel.find({
        _id: { $in: order.workers },
      });
      
      await Promise.all(
        workerRefs.map(async (worker) => {
          const workerHistoryDoc = await workerHistoryModel.create({
            workerName: worker.name,
            clientName: order.clientName,
            summa:
              worker.summaType === "price"
                ? worker.price
                : worker.summaType === "percent"
                ? (order.price * worker.percent) / 100
                : 0,
            order: order._id,
            workerId: worker._id,
          });
          await workerHistoryDoc.save()
      
          if (worker.summaType === "price" || worker.summaType === "percent") {
            await WorkerModel.updateOne(
              { _id: worker._id },
              {
                $push: { history: workerHistoryDoc._id },
                $inc: {
                  totalCash:
                    worker.summaType === "price"
                      ? worker.price
                      : (order.price * worker.percent) / 100,
                },
              }
            );
          }
          
          return workerHistoryDoc;
        })
      );

      order.status = "Заказ оплачен";

      await Promise.all(
        products.map(async (product) => {
          const myProduct = await myProductsModel.findById(product.id)
          const item = {
            productId: myProduct._id,
            title: myProduct.title,
            quantity: product.quantity,
            price: product.price,
          }
  
          order.products.push(item)
        })
      );
      await rmOrder(order.id)
      await newOrderAdd(order.id, '', order.clientName, order.color, Date.now(), order.avans + order.qoldiq)
      order.avans += order.qoldiq;
      order.qoldiq = 0;
      order.isArchive = true;

      events.emit('order.expected.deleted', order.id)
      await order.save()

      await deleteCache("order_list");
      await deleteCache("worker_list");
      await deleteCache("firma_list");
      return {
        status: 200,
        data: JSON.parse(JSON.stringify(order))
      }
    }
  } catch (error) {
    console.error(error);
  }
};


module.exports.deleteOrder = async (event, args) => {
  try {
    const { id } = args;
    const order = await OrderModel.findById(id);
    
    if (!order) {
      return {
        status: 404,
        message: "Order not found",
        data: null,
      };
    }

    await OrderItemModel.deleteMany({ orderId: order.id });

    rmOrder(order.id)

    await updateStatisticsForOrder(order.avans, true);
    await updateQoldiqStatisticsForOrder(order.qoldiq, false);

    const desc = `Order from ${order.clientName}`;
    events.emit("order.deleted", order.avans, order.qoldiq, Date.now(), desc);

    await OrderModel.deleteOne({ _id: id });

    await deleteCache("order_list");
    await deleteCache("firma_list");

    events.emit('order.deleted.st', order.id)
    events.emit('order.expected.deleted', order.id)

    return {
      status: 200,
      message: "Order deleted successfully",
      data: null,
    };
  } catch (error) {
    console.error(error);
  }
};

module.exports.workerComment = async (event, args) => {
  try {
    const { id, workerId, comment, date } = args;
    const order = await OrderModel.findById(id);

    if (!order) {
      return {
        status: 404,
        message: "Order not found",
        data: null,
      };
    }

    const worker = await WorkerModel.findById(workerId);
    if (!worker) {
      return {
        status: 404,
        message: "Worker not found",
        data: null,
      };
    }

    const newComment = await workerCommentModel.create({
      comment,
      date,
      workerId,
    });

    await worker.comments.push(newComment.id);
    await newComment.save();
    await worker.save();

    return {
      status: 200,
      message: "Comment added successfully",
      data: newComment,
    };
  } catch (error) {
    console.error(error);
    return handleError(500, "Server Error", null);
  }
};

module.exports.listArchive= async (res, args)=>{
  try {
    const data = await OrderModel.find({isArchive:false})
    return{status:200,data:JSON.parse(JSON.stringify(data))}
  } catch (error) {
    return{status:500, error:error.message}
  }
}

module.exports.deleteSatisfaction = async(event, args) => {
  try {
    const {orderId, title} = args

    const orderItem = await OrderItemModel.findById(orderId)
    if(!orderItem) {
      return {
        status: 404,
        error: 'ORder ITEM not found'
      }
    }

    orderId.satisfactions = orderId.satisfactions.filter(
      (satisfaction) => satisfaction.title !== title
    )

    await orderId.save()
    console.log('Satistification deleted is =>', true)
  } catch (error) {
    return{status:500, error:error.message}
  }
}