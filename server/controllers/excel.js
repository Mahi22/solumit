const excel = require('node-excel-export');
const Value = require('../models/value');

// You can define styles as json object
// More info: https://github.com/protobi/js-xlsx#cell-styles
const styles = {
  headerDark: {
    fill: {
      fgColor: {
        rgb: 'FF000000'
      }
    },
    font: {
      color: {
        rgb: 'FFFFFFFF'
      },
      sz: 14,
      bold: true,
      underline: true
    }
  },
  cellPink: {
    fill: {
      fgColor: {
        rgb: 'FFFFCCFF'
      }
    }
  },
  cellGreen: {
    fill: {
      fgColor: {
        rgb: 'FF00FF00'
      }
    }
  }
};

//Here you specify the export structure
const specification = {
  imei: { // <- the key should match the actual data key
    displayName: 'IMEI Number', // <- Here you specify the column header
    headerStyle: styles.headerDark, // <- Header style
    cellStyle: function(value, row) { // <- style renderer function
      // if the status is 1 then color in green else color in red
      // Notice how we use another cell value to style the current one
      return styles.cellGreen; // <- Inline cell style is possible
    },
    width: 120 // <- width in pixels
  },
  timestamp: { // <- the key should match the actual data key
    displayName: 'Timestamp', // <- Here you specify the column header
    headerStyle: styles.headerDark, // <- Header style
    cellStyle: function(value, row) { // <- style renderer function
      // if the status is 1 then color in green else color in red
      // Notice how we use another cell value to style the current one
      return styles.cellPink; // <- Inline cell style is possible
    },
    width: 120 // <- width in pixels
  },
  GV: {
    displayName: 'GV',
    headerStyle: styles.headerDark,
    cellStyle: styles.cellPink, // <- Cell style
    width: 60 // <- width in pixels
  },
  GC: {
    displayName: 'GC',
    headerStyle: styles.headerDark,
    cellStyle: styles.cellGreen, // <- Cell style
    width: 60 // <- width in pixels
  },
  PV: {
    displayName: 'PV',
    headerStyle: styles.headerDark,
    cellStyle: styles.cellPink, // <- Cell style
    width: 60 // <- width in pixels
  },
  PC: {
    displayName: 'PC',
    headerStyle: styles.headerDark,
    cellStyle: styles.cellGreen, // <- Cell style
    width: 60 // <- width in pixels
  },
  IV: {
    displayName: 'IV',
    headerStyle: styles.headerDark,
    cellStyle: styles.cellPink, // <- Cell style
    width: 60 // <- width in pixels
  },
  IR: {
    displayName: 'IR',
    headerStyle: styles.headerDark,
    cellStyle: styles.cellGreen, // <- Cell style
    width: 60 // <- width in pixels
  },
  IR: {
    displayName: 'IR',
    headerStyle: styles.headerDark,
    cellStyle: styles.cellPink, // <- Cell style
    width: 60 // <- width in pixels
  },
  IY: {
    displayName: 'IY',
    headerStyle: styles.headerDark,
    cellStyle: styles.cellGreen, // <- Cell style
    width: 60 // <- width in pixels
  },
  IB: {
    displayName: 'IB',
    headerStyle: styles.headerDark,
    cellStyle: styles.cellPink, // <- Cell style
    width: 60 // <- width in pixels
  }
}



exports.excelData = function (req, res, next) {
  // The data set should have the following shape (Array of Objects)
  // The order of the keys is irrelevant, it is also irrelevant if the
  // dataset contains more fields as the report is build based on the
  // specification provided above. But you should have all the fields
  // that are listed in the report specification

  const {imei, date} = req.query;

  const dataset = [];

  const datasetBuilder = function datasetBuilder(inst) {
    dataset.push(inst.get());
  }

  console.log(imei, date);

  Value.findAll({
    where: {
      imei,
      timestamp: {
        $like: `${date}%`
      }
    }
  }).then( values => {
    values.forEach(datasetBuilder);

    const report = excel.buildExport(
      [ // <- Notice that this is an array. Pass multiple sheets to create multi sheet report
        {
          specification: specification, // <- Report specification
          data: dataset // <-- Report data
        }
      ]
    );

    res.attachment('report.xlsx'); // This is sails.js specific (in general you need to set headers)
    return res.send(report);
  });


  // const dataset = [
  //   {customer_name: 'IBM', status_id: 1, note: 'some note', misc: 'not shown'},
  //   {customer_name: 'HP', status_id: 0, note: 'some note'},
  //   {customer_name: 'MS', status_id: 0, note: 'some note', misc: 'not shown'}
  // ]
  //
  // // Create the excel report.
  // // This function will return Buffer
  // const report = excel.buildExport(
  //   [ // <- Notice that this is an array. Pass multiple sheets to create multi sheet report
  //     {
  //       name: 'Sheet name', // <- Specify sheet name (optional)
  //       heading: heading, // <- Raw heading array (optional)
  //       specification: specification, // <- Report specification
  //       data: dataset // <-- Report data
  //     }
  //   ]
  // );
  //
  // // You can then return this straight
  // res.attachment('report.xlsx'); // This is sails.js specific (in general you need to set headers)
  // return res.send(report);
}
