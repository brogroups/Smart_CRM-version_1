const { ProductHistoryModel } = require("@/main/models/firma/product.history.model");


module.exports.listHistories = async(req, res) => {
    try {
        const {name, id} = res
        console.log(name, id)
        const histories = await ProductHistoryModel.find({
            // productName: name,
            firmaId: id,
        });


        // const firm = histories.filter((a) => a.firmaId === id)
        
        console.log(histories)
        return histories
    } catch (error) {
        console.error(error);
        return {
            status: 500,
            error: error.message,
            args: null,
        };
    }
}
