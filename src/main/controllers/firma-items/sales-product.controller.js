const { events } = require('../../events/index');
require('../../events/product-history.event')
require('../../events/notification.event');
const FirmaModel = require('../../models/firma/firma.model');
const SalesModel = require('../../models/firma/sales-product.model');
const {
    updateStatisticsForFirma,
} = require('../../global/helpers/statistic.helper');
const {
    setCache,
    getCache,
    deleteCache,
} = require('../../global/helpers/redis.helper');
const { listHistories } = require('../../global/helpers/product-history.helper');

module.exports.createOneSales = async (event, args) => {
    try {
        const { name, price, quantity, firmaId,totalPrice  } = args;

        const firma = await FirmaModel.findById(firmaId).populate('saleProducts');
        if (!firma) {
            return {
                status: 404,
                error: 'Firma not found',
                args: null,
            };
        }

        const isHave = await SalesModel.findOne({$and: [
            {
                name: name
            },
            {
                firmaId: firmaId
            }
        ]})
        if(isHave) {
            isHave.quantity += quantity;
            isHave.totalPrice += Number(totalPrice);
            isHave.price = price

            firma.debts += totalPrice
            await firma.save()
            await updateStatisticsForFirma(Number(totalPrice), true);
            await isHave.save()

            const desc = `продукт был куплен ${firma.firma}`;
            events.emit('product.created',name, totalPrice, new Date(), desc);
            events.emit('sales.history','', isHave.name, price, quantity, firma._id.toString(), firma.firma)

            events.emit('ss')

            await deleteCache('sales_list');
            await deleteCache('firma_list');
            return {
                status: 200,
                message: 'Продукт продаж успешно обновлен',
                data: JSON.parse(JSON.stringify(isHave)),
            }
        } else {
            const newSalesProduct = new SalesModel({
                name,
                price,
                quantity,
                firmaName: firma.firma,
            totalPrice,
            firmaId,
        });
        
        await newSalesProduct.save();
        
        firma.saleProducts.push(newSalesProduct._id);
        firma.debts += Number(totalPrice);
        firma.productsCount += 1
        await firma.save();
        
        await updateStatisticsForFirma(Number(totalPrice), true);
        
        const desc = `продукт был куплен ${firma.firma}`;
        events.emit('product.created',name, totalPrice, new Date(), desc);
        events.emit('sales.history.first','', name, price, quantity, firma._id.toString(), firma.firma)
        
        
        await deleteCache('sales_list');
        await deleteCache('firma_list');
        
        return {
            status: 201,
            message: 'Продукт продаж создан успешно',
            data: JSON.parse(JSON.stringify(newSalesProduct)),
        };
    }
    } catch (error) {
        console.error(error);
        return {
            status: 500,
            error: error.message,
            args: null,
        };
    }
}

module.exports.createManySales = async (event, args) => {
    try {
        // Validate input
        const { products} = args;
        
        if (!Array.isArray(products) || products.length === 0) {
            throw new Error("No products provided or invalid input format");
        }

        const results = await Promise.all(
            products.map(async (product) => {
                try {
                    // Fetch Firma and validate
                    

                    // Fetch Sales and validate
                    const sales = await SalesModel.findById(product.id);
                    if (!sales) {
                        return {
                            status: 404,
                            error: 'Продажа не найдена',
                            args: product,
                        };
                    }

                    const firma = await FirmaModel.findById(sales.firmaId).populate('saleProducts');
                    if (!firma) {
                        return {
                            status: 404,
                            error: 'Фирма не найдена',
                            args: product,
                        };
                    }

                    const totalPrice = product.quantity * product.price;

                    // Check if sale already exists
                    let saleResponse;
                    const existingSale = await SalesModel.findOne({ name: sales.name });
                    if (existingSale) {
                        // Update existing sale
                        existingSale.quantity += product.quantity;
                        existingSale.totalPrice += totalPrice;
                        existingSale.price = product.price;
                        await existingSale.save();

                        // Update Firma
                        firma.debts += totalPrice;
                        await firma.save();

                        // Update statistics
                        await updateStatisticsForFirma(totalPrice, true);

                        // Emit events
                        const desc = `Продукт был куплен ${firma.firma}`;
                        events.emit('product.created', sales.name, totalPrice, new Date(), desc);
                        events.emit('sales.history','', sales.name, product.price, product.quantity, firma._id.toString(), firma.firma);

                        saleResponse = {
                            status: 200,
                            message: 'Продукт продаж успешно обновлен',
                            data: existingSale.toJSON(),
                        };
                    } else {
                        // Create new sale
                        const newSalesProduct = new SalesModel({
                            name: sales.name,
                            price: product.price,
                            firmaName: firma.firma,
                            quantity: product.quantity,
                            totalPrice,
                            firmaId: firma._id,
                        });
                        await newSalesProduct.save();

                        // Update Firma
                        firma.saleProducts.push(newSalesProduct._id);
                        firma.debts += totalPrice;
                        firma.productsCount += 1;
                        await firma.save();

                        // Update statistics
                        await updateStatisticsForFirma(totalPrice, true);

                        // Emit events
                        const desc = `Продукт был куплен ${firma.firma}`;
                        events.emit('product.created', sales.name, totalPrice, new Date(), desc);
                        events.emit('sales.history',null, sales.name, product.price, product.quantity, firma._id.toString(), firma.firma);

                        saleResponse = {
                            status: 200,
                            message: 'Продукт продаж создан успешно',
                        };
                    }

                    return  saleResponse
                        
                } catch (innerError) {
                    console.error("Error processing product:", product, innerError);
                    return {
                        status: 500,
                        error: innerError.message,
                        args: product,
                    };
                }
            })
        );

        // Clear cache once after all operations
        await deleteCache('sales_list');
        await deleteCache('firma_list');

        return results;
    } catch (error) {
        console.error("Error in createManySales function:", error);
        return {
            status: 500,
            error: error.message,
            args: null,
        };
    }
};



module.exports.listSales = async (res, args) => {
    try {
        const saleProducts = await SalesModel.find();
        console.log(saleProducts)
        // const cachedSales = await getCache('sales_list');
        // if (cachedSales) {
        //     console.log(cac);
            
        //     return {
        //         status: 200,
        //         message: 'Sales products retrieved from cache',
        //         data: JSON.parse(JSON.stringify(cachedSales)),
        //     };
        // }
        
        // await setCache('sales_list', saleProducts, 3600);
        
        // const histories = await listHistories(null, cachedSales.name, cachedSales.firmaId)
        return {
            status: 200,
            sales: JSON.parse(JSON.stringify(saleProducts)),
            // histories: JSON.parse(JSON.stringify(histories))
        }
    } catch (error) {
        console.error(error);
        return {
            status: 500,
            error: error.message,
            args: null,
        };
    }
};

module.exports.oneSales = async (event, args) => {
    try {
        const {id} = args
        const sales = await SalesModel.findById(id)
        if(!sales) {
            return {
                status: 404,
                error: 'Sales not found'
            }
        }
        const obj = {
            id: sales.firmaId.toString(),
            name: sales.name
        }
        const histories = await listHistories(null, obj)
        console.log(histories)

        return {
            status: 200,
            sales: JSON.parse(JSON.stringify(sales)),
            histories: JSON.parse(JSON.stringify(histories))
        }

    } catch (error) {
        console.error(error);
        return {
            status: 500,
            error: error.message,
            args: null,
        };
    }
}

module.exports.updateSales = async (event, args) => {
    try {
        const { id, name, price, firmaId, quantity, status,totalPrice } = args;
        const sales = await getSalesById(id);
        const firm = await FirmaModel.findById(sales.firmaId);

        if (price > 0 || quantity > 0) {
            firm.debts -= Number(firm.totalPrice);
            firm.debts += Number(totalPrice);
            await firm.save();

            await updateStatisticsForFirma(Number(sales.totalPrice), false);
            await updateStatisticsForFirma(Number(totalPrice), true);
        }

        const updateFields = {
            name: name || sales.name,
            price: price || sales.price,
            totalPrice: totalPrice,
            quantity: quantity || sales.quantity,
            status: status || sales.status,
            firmaId: firmaId,
        };

        await SalesModel.updateOne({ _id: id }, { $set: updateFields });

        await deleteCache('sales_list');
        await deleteCache('firma_list');

        events.emit('firma.debts.rm', sales.firmaId)
        events.emit('firma.debts', firmaId, `Купленный продукт ${sales.totalPrice}`, totalPrice, Date.now())


        return {
            status: 200,
            message: 'Продукт продаж успешно обновлен',
        };
    } catch (error) {
        console.error(error);
        return {
            status: 500,
            error: error.message,
            args: null,
        };
    }
};

module.exports.deleteSales = async (event, args) => {
    try {
        const { id } = args;
        const sales = await getSalesById(id);

        await updateStatisticsForFirma(sales.totalPrice, false);

        await FirmaModel.updateOne(
            { _id: sales.firmaId },
            {
                $pull: { saleProducts: sales.id },
                $inc: {
                    debts: -sales.totalPrice,
                    productsCount: -1
                }
            }
        );

        await SalesModel.deleteOne({ _id: id });
        await deleteCache('sales_list');
        await deleteCache('firma_list');

        const desc = `Payment`;
        events.emit('product.deleted', new Date(), desc)

        return {
            status: 200,
            message: 'Продукт продажи успешно удален',
        };
    } catch (error) {
        console.error(error);
        return {
            status: 500,
            error: error.message,
            args: null,
        };
    }
};

const getSalesById = async (id) => {
    const sales = await SalesModel.findById(id);
    if (!sales) {
        throw new Error('Продажи не найдены по идентификатору');
    }

    return sales;
};