const Excel = require("exceljs");
const moment = require("moment");
const db = require("./db");

module.exports = app => {
  app.get("/excel", function(req, res) {
    console.log(req.query);
    const workbook = new Excel.Workbook();

    const sheet = workbook.addWorksheet("Data");

    const fileName = "solumExcel.xlsx";

    sheet.columns = [
      { header: "Date", key: "fordate" },
      { header: "Time", key: "fortime" },
      { header: "UPS OpV", key: "ups_opv" },
      { header: "UPS Vb", key: "ups_vb" },
      { header: "UPS l1", key: "ups_l1" },
      { header: "UPS l2", key: "ups_l2" },
      { header: "UPS lt", key: "ups_lt" },
      { header: "PFC Vi", key: "pfc_vi" },
      { header: "PFC Ii", key: "pfc_ii" },
      { header: "PFC Vm", key: "pfc_vm" },
      { header: "PFC Vb", key: "pfc_vb" },
      { header: "PFC Io", key: "pfc_io" },
      { header: "MPPT Vi", key: "mp1_vi" },
      { header: "MPPT Ii", key: "mp1_ii" },
      { header: "MPPT Vm", key: "mp1_vm" },
      { header: "MPPT Vb", key: "mp1_vb" },
      { header: "MPPT Io", key: "mp1_io" }
    ];

    const querybuilder = db(`device${req.query.deviceId || 3}`).select("*");

    console.log(
      moment(req.query.startDate)
        .startOf("day")
        .subtract("5.5", "hours")
        .toString()
    );
    console.log(
      moment(req.query.endDate)
        .endOf("day")
        .subtract("5.5", "hours")
        .toString()
    );

    if (req.query.startDate) {
      querybuilder.where(
        "fortime",
        ">=",
        moment(req.query.startDate)
          .startOf("day")
          .subtract("5.5", "hours")
          .toString()
      );
    }

    if (req.query.endDate) {
      querybuilder.where(
        "fortime",
        "<",
        moment(req.query.endDate)
          .endOf("day")
          .subtract("5.5", "hours")
          .toString()
      );
    }

    querybuilder.then(values => {
      values.forEach(val => {
        const datetime = moment(val.fortime).utcOffset("+05:30");
        Object.keys(val)
          .filter(key => key !== "fortime")
          .forEach(key => {
            val[key] = Math.round(val[key]);
          });
        val.fordate = datetime.format("DD/MM/YYYY");
        val.fortime = datetime.format("HH:mm");
        sheet.addRow(val);
      });
      // console.log('ADDED values');
      // res.type('application/json');
      // res.send(values);
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader("Content-Disposition", "attachment; filename=" + fileName);
      workbook.xlsx
        .write(res, { dateFormat: "YYYY-MM-DD[T]HH:mm:ss", dateUTC: true })
        .then(function() {
          res.end();
        });
    });
  });
};
