// // const fs = require('fs');
// // const path = require('path');
// // const StatisticModel = require('../models/statistic.model');
// // const { allIncrementsModel } = require('../models/statistic-child-models/increment.model');
// // const { allDecrementModel } = require('../models/statistic-child-models/decrement.model');
// // const { allExpectedModel } = require('../models/statistic-child-models/expected.model');



// // const ensureDirectoryExists = (filePath) => {
// //     const dir = path.dirname(filePath);
// //     if (!fs.existsSync(dir)) {
// //         fs.mkdirSync(dir, { recursive: true });
// //         console.log(`Директория ${dir} создана.`);
// //     }
// // };

// // const writeIdToFile = (filePath, id) => {
// //     try {
// //         ensureDirectoryExists(filePath);
// //         fs.writeFileSync(filePath, `module.exports = { id: '${id}' };`, 'utf8');
// //         console.log(`ID записан в ${filePath}`);
// //     } catch (error) {
// //         console.error(`Ошибка записи в файл ${filePath}:`, error);
// //         throw error;
// //     }
// // };   
// // // statistic-childs/allExpected.key
// // module.exports.statisticCreateConfig = async () => {
// //     try {
// //         const statistic = await StatisticModel.find();
// //         if (statistic.length > 0) {
// //             console.log('Statistic already exists in the database');
// //             return;
// //         }

// //         const newStatistic = new StatisticModel();

// //         const newAllIncrements = new allIncrementsModel({ statisticId: newStatistic._id });
// //         await newAllIncrements.save();

// //         const newAllDecrements = new allDecrementModel({ statisticId: newStatistic._id });
// //         await newAllDecrements.save();

// //         const newAllExpected = new allExpectedModel({ statisticId: newStatistic._id });
// //         await newAllExpected.save();

// //         newStatistic.globalIncrements = newAllIncrements._id;
// //         newStatistic.globalDecrements = newAllDecrements._id;
// //         newStatistic.expectedAmount = newAllExpected._id;

// //         await newStatistic.save();

// //         console.log('Statistic and child models are created');

// //         const incrementFilePath = path.resolve(__dirname, './statistic-childs/allIncrements.key.js');
// //         const decrementFilePath = path.resolve(__dirname, './statistic-childs/allDecrements.key.js');
// //         const expectedFilePath = path.resolve(__dirname, './statistic-childs/allExpected.key.js');

// //         writeIdToFile(incrementFilePath, newAllIncrements._id);
// //         writeIdToFile(decrementFilePath, newAllDecrements._id);
// //         writeIdToFile(expectedFilePath, newAllExpected._id);
// //     } catch (error) {
// //         console.error('Error:', error);
// //         return { status: 500, error: 'Server Error' };
// //     }
// // };


// const fs = require('fs');
// const path = require('path');
// const StatisticModel = require('../models/statistic.model');
// const { allIncrementsModel } = require('../models/statistic-child-models/increment.model');
// const { allDecrementModel } = require('../models/statistic-child-models/decrement.model');
// const { allExpectedModel } = require('../models/statistic-child-models/expected.model');
// const { 
//     DayIncrementsModel, 
//     DayDecrementsModel
// } = require('../models/statistic-child-models/day.model');
// const {MonthIncrementsModel, MonthDecrementsModel} = require('../models/statistic-child-models/month.model')

// const ensureDirectoryExists = (filePath) => {
//     const dir = path.dirname(filePath);
//     if (!fs.existsSync(dir)) {
//         fs.mkdirSync(dir, { recursive: true });
//     }
// };

// const writeIdToFile = (filePath, root,id) => {
//     try {
//         ensureDirectoryExists(filePath);
//         fs.writeFile(filePath, `module.exports.${root} = '${id}'`, 'utf8');
//         console.log(`Writed to ${filePath} and ${root} id ${id}`)
//     } catch (error) {
//         throw error;
//     }
// };

// module.exports.statisticCreateConfig = async () => {
//     try {
//         const statistic = await StatisticModel.find();
//         if (statistic.length > 0) return;

//         const newStatistic = new StatisticModel();

//         const newAllIncrements = new allIncrementsModel({ statisticId: newStatistic._id });
//         await newAllIncrements.save();

//         const newAllDecrements = new allDecrementModel({ statisticId: newStatistic._id });
//         await newAllDecrements.save();

//         const newAllExpected = new allExpectedModel({ statisticId: newStatistic._id });
//         await newAllExpected.save();

//         const newDayIncrements = new DayIncrementsModel({ statisticId: newStatistic._id });
//         await newDayIncrements.save();

//         const newDayDecrements = new DayDecrementsModel({ statisticId: newStatistic._id });
//         await newDayDecrements.save();

//         const newMonthIncrements = new MonthIncrementsModel({ statisticId: newStatistic._id });
//         await newMonthIncrements.save();

//         const newMonthDecrements = new MonthDecrementsModel({ statisticId: newStatistic._id });
//         await newMonthDecrements.save();

//         newStatistic.globalIncrements = newAllIncrements._id;
//         newStatistic.globalDecrements = newAllDecrements._id;
//         newStatistic.expectedAmount = newAllExpected._id;

//         await newStatistic.save();

//         const statisticFilePath = path.resolve(__dirname, './statistic.js');
//         const incrementFilePath = path.resolve(__dirname, './statistic-childs/allIncrements.key.js');
//         const decrementFilePath = path.resolve(__dirname, './statistic-childs/allDecrements.key.js');
//         const expectedFilePath = path.resolve(__dirname, './statistic-childs/allExpected.key.js');
//         const dayIncrementFilePath = path.resolve(__dirname, './statistic-childs/dayIncrements.key.js');
//         const dayDecrementFilePath = path.resolve(__dirname, './statistic-childs/dayDecrements.key.js');
//         const monthIncrementFilePath = path.resolve(__dirname, './statistic-childs/monthIncrements.key.js');
//         const monthDecrementFilePath = path.resolve(__dirname, './statistic-childs/monthDecrements.key.js');

//         Promise.all([
//             writeIdToFile(statisticFilePath, 'statisticId', newStatistic._id),
//             writeIdToFile(incrementFilePath, 'allIncrements', newAllIncrements._id),
//             writeIdToFile(decrementFilePath, 'allDecrements', newAllDecrements._id),
//             writeIdToFile(expectedFilePath,'allExpected', newAllExpected._id),
//             writeIdToFile(dayIncrementFilePath,'dayIncrements', newDayIncrements._id),
//             writeIdToFile(dayDecrementFilePath,'dayDecrements', newDayDecrements._id),
//             writeIdToFile(monthIncrementFilePath,'monthIncrements', newMonthIncrements._id),
//             writeIdToFile(monthDecrementFilePath,'monthDecrements', newMonthDecrements._id),
//         ]).then(() => {
//             console.log('file writing succssed')
//         })
//         } catch (error) {
//             return { status: 500, error: 'Server Error' };
//     }
// };

// // const fs = require('fs');
// // const path = require('path');
// // const StatisticModel = require('../models/statistic.model');
// // const { allIncrementsModel } = require('../models/statistic-child-models/increment.model');
// // const { allDecrementModel } = require('../models/statistic-child-models/decrement.model');
// // const { allExpectedModel } = require('../models/statistic-child-models/expected.model');



// // const ensureDirectoryExists = (filePath) => {
// //     const dir = path.dirname(filePath);
// //     if (!fs.existsSync(dir)) {
// //         fs.mkdirSync(dir, { recursive: true });
// //         console.log(`Директория ${dir} создана.`);
// //     }
// // };

// // const writeIdToFile = (filePath, id) => {
// //     try {
// //         ensureDirectoryExists(filePath);
// //         fs.writeFileSync(filePath, `module.exports = { id: '${id}' };`, 'utf8');
// //         console.log(`ID записан в ${filePath}`);
// //     } catch (error) {
// //         console.error(`Ошибка записи в файл ${filePath}:`, error);
// //         throw error;
// //     }
// // };   
// // // statistic-childs/allExpected.key
// // module.exports.statisticCreateConfig = async () => {
// //     try {
// //         const statistic = await StatisticModel.find();
// //         if (statistic.length > 0) {
// //             console.log('Statistic already exists in the database');
// //             return;
// //         }

// //         const newStatistic = new StatisticModel();

// //         const newAllIncrements = new allIncrementsModel({ statisticId: newStatistic._id });
// //         await newAllIncrements.save();

// //         const newAllDecrements = new allDecrementModel({ statisticId: newStatistic._id });
// //         await newAllDecrements.save();

// //         const newAllExpected = new allExpectedModel({ statisticId: newStatistic._id });
// //         await newAllExpected.save();

// //         newStatistic.globalIncrements = newAllIncrements._id;
// //         newStatistic.globalDecrements = newAllDecrements._id;
// //         newStatistic.expectedAmount = newAllExpected._id;

// //         await newStatistic.save();

// //         console.log('Statistic and child models are created');

// //         const incrementFilePath = path.resolve(__dirname, './statistic-childs/allIncrements.key.js');
// //         const decrementFilePath = path.resolve(__dirname, './statistic-childs/allDecrements.key.js');
// //         const expectedFilePath = path.resolve(__dirname, './statistic-childs/allExpected.key.js');

// //         writeIdToFile(incrementFilePath, newAllIncrements._id);
// //         writeIdToFile(decrementFilePath, newAllDecrements._id);
// //         writeIdToFile(expectedFilePath, newAllExpected._id);
// //     } catch (error) {
// //         console.error('Error:', error);
// //         return { status: 500, error: 'Server Error' };
// //     }
// // };


// const fs = require('fs');
// const path = require('path');
// const StatisticModel = require('../models/statistic.model');
// const { allIncrementsModel } = require('../models/statistic-child-models/increment.model');
// const { allDecrementModel } = require('../models/statistic-child-models/decrement.model');
// const { allExpectedModel } = require('../models/statistic-child-models/expected.model');
// const { 
//     DayIncrementsModel, 
//     DayDecrementsModel
// } = require('../models/statistic-child-models/day.model');
// const {MonthIncrementsModel, MonthDecrementsModel} = require('../models/statistic-child-models/month.model')

// const ensureDirectoryExists = (filePath) => {
//     const dir = path.dirname(filePath);
//     if (!fs.existsSync(dir)) {
//         fs.mkdirSync(dir, { recursive: true });
//     }
// };

// const writeIdToFile = (filePath, id) => {
//     try {
//         ensureDirectoryExists(filePath);
//         fs.writeFileSync(filePath, `module.exports = { id: '${id}' };`, 'utf8');
//     } catch (error) {
//         throw error;
//     }
// };

// module.exports.statisticCreateConfig = async () => {
//     try {
//         const statistic = await StatisticModel.find();
//         if (statistic.length > 0) return;

//         const newStatistic = new StatisticModel();

//         const newAllIncrements = new allIncrementsModel({ statisticId: newStatistic._id });
//         await newAllIncrements.save();

//         const newAllDecrements = new allDecrementModel({ statisticId: newStatistic._id });
//         await newAllDecrements.save();

//         const newAllExpected = new allExpectedModel({ statisticId: newStatistic._id });
//         await newAllExpected.save();

//         const newDayIncrements = new DayIncrementsModel({ statisticId: newStatistic._id });
//         await newDayIncrements.save();

//         const newDayDecrements = new DayDecrementsModel({ statisticId: newStatistic._id });
//         await newDayDecrements.save();

//         const newMonthIncrements = new MonthIncrementsModel({ statisticId: newStatistic._id });
//         await newMonthIncrements.save();

//         const newMonthDecrements = new MonthDecrementsModel({ statisticId: newStatistic._id });
//         await newMonthDecrements.save();

//         newStatistic.globalIncrements = newAllIncrements._id;
//         newStatistic.globalDecrements = newAllDecrements._id;
//         newStatistic.expectedAmount = newAllExpected._id;

//         await newStatistic.save();

//         const incrementFilePath = path.resolve(__dirname, './statistic-childs/allIncrements.key.js');
//         const decrementFilePath = path.resolve(__dirname, './statistic-childs/allDecrements.key.js');
//         const expectedFilePath = path.resolve(__dirname, './statistic-childs/allExpected.key.js');
//         const dayIncrementFilePath = path.resolve(__dirname, './statistic-childs/dayIncrements.key.js');
//         const dayDecrementFilePath = path.resolve(__dirname, './statistic-childs/dayDecrements.key.js');
//         const monthIncrementFilePath = path.resolve(__dirname, './statistic-childs/monthIncrements.key.js');
//         const monthDecrementFilePath = path.resolve(__dirname, './statistic-childs/monthDecrements.key.js');

//         writeIdToFile(incrementFilePath, newAllIncrements._id);
//         writeIdToFile(decrementFilePath, newAllDecrements._id);
//         writeIdToFile(expectedFilePath, newAllExpected._id);
//         writeIdToFile(dayIncrementFilePath, newDayIncrements._id);
//         writeIdToFile(dayDecrementFilePath, newDayDecrements._id);
//         writeIdToFile(monthIncrementFilePath, newMonthIncrements._id);
//         writeIdToFile(monthDecrementFilePath, newMonthDecrements._id);
//     } catch (error) {
//         return { status: 500, error: 'Server Error' };
//     }
// };


const fs = require('fs');
const path = require('path');
const StatisticModel = require('../models/statistic.model');
const { allIncrementsModel } = require('../models/statistic-child-models/increment.model');
const { allDecrementModel } = require('../models/statistic-child-models/decrement.model');
const { allExpectedModel } = require('../models/statistic-child-models/expected.model');
const { DayIncrementsModel, DayDecrementsModel } = require('../models/statistic-child-models/day.model');
const { MonthIncrementsModel, MonthDecrementsModel } = require('../models/statistic-child-models/month.model');

const ensureDirectoryExists = (filePath) => {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

const writeIdToFile = (filePath, id) => {
    try {
        ensureDirectoryExists(filePath);
        fs.writeFileSync(filePath, `module.exports = { id: '${id}' };`, 'utf8');
    } catch (error) {
        console.error(`Ошибка записи в файл ${filePath}:`, error.message);
        throw error;
    }
};

module.exports.statisticCreateConfig = async () => {
    try {
        const statisticExists = await StatisticModel.exists({});
        if (statisticExists) {
            console.log('Statistic already exists in the database');
            return;
        }

        const newStatistic = new StatisticModel();

        const newAllIncrements = new allIncrementsModel({ statisticId: newStatistic._id });
        const newAllDecrements = new allDecrementModel({ statisticId: newStatistic._id });
        const newAllExpected = new allExpectedModel({ statisticId: newStatistic._id });
        const newDayIncrements = new DayIncrementsModel({ statisticId: newStatistic._id });
        const newDayDecrements = new DayDecrementsModel({ statisticId: newStatistic._id });
        const newMonthIncrements = new MonthIncrementsModel({ statisticId: newStatistic._id });
        const newMonthDecrements = new MonthDecrementsModel({ statisticId: newStatistic._id });

        await Promise.all([
            newAllIncrements.save(),
            newAllDecrements.save(),
            newAllExpected.save(),
            newDayIncrements.save(),
            newDayDecrements.save(),
            newMonthIncrements.save(),
            newMonthDecrements.save(),
        ]);

        newStatistic.globalIncrements = newAllIncrements._id;
        newStatistic.globalDecrements = newAllDecrements._id;
        newStatistic.expectedAmount = newAllExpected._id;

        await newStatistic.save();

        const filePaths = {
            './statistic-childs/allIncrements.key.js': newAllIncrements._id,
            './statistic-childs/allDecrements.key.js': newAllDecrements._id,
            './statistic-childs/allExpected.key.js': newAllExpected._id,
            './statistic-childs/dayIncrements.key.js': newDayIncrements._id,
            './statistic-childs/dayDecrements.key.js': newDayDecrements._id,
            './statistic-childs/monthIncrements.key.js': newMonthIncrements._id,
            './statistic-childs/monthDecrements.key.js': newMonthDecrements._id,
        };

        for (const [filePath, id] of Object.entries(filePaths)) {
            writeIdToFile(path.resolve(__dirname, filePath), id);
        }

        console.log('Statistic and child models created successfully');
    } catch (error) {
        console.error('Error:', error.message);
        return { status: 500, error: 'Server Error', details: error.message };
    }
};
