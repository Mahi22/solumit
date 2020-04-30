const path = require("path");
const readline = require("readline");
const fs = require("fs");
const Excel = require("exceljs");
const moment = require("moment");
const db = require("./db");
const MultiStream = require("./multistream");

module.exports = app => {
  app.get("/excel", function(req, res) {
    const workbook = new Excel.Workbook();

    const sheet = workbook.addWorksheet("Data");

    const fileName = `solumExcel_device${req.query.deviceId || ''}_${Date.now()}.xlsx`;

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

    if (req.query.startDate) {
      querybuilder.where(
        "fortime",
        ">=",
        moment(req.query.startDate)
          // .add("5.5", "hours")
          .startOf("day")
          .toISOString()
      );
    }

    if (req.query.endDate) {
      querybuilder.where(
        "fortime",
        "<",
        moment(req.query.endDate)
          .endOf("day")
          // .subtract("5.5", "hours")
          .toISOString()
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

  app.get("/change", async function(req, res) {
    const fordate = moment(new Date(req.query.fordate))
    const selectedDate = fordate.format('DD/MM/YYYY')
    const filename2 = `device${req.query.deviceId}_change_${fordate.format('DD_MM_YYYY')}.log`;
    const filename1 = `device${req.query.deviceId}_change_${fordate.subtract(1, 'day').format('DD_MM_YYYY')}.log`;
    const filepath2 = path.join(__dirname, `../worker/logs/${filename1}`);
    const filepath1 = path.join(__dirname, `../worker/logs/${filename2}`);
    if (fs.existsSync(filepath1) || fs.existsSync(filepath2)) {
      var streams = new MultiStream([
        function testFilePath1() {
          if (fs.existsSync(filepath1)) {
            return fs.createReadStream(filepath1)
          }
          return null
        },
        function testFilePath2() {
          if (fs.existsSync(filepath2)) {
            return fs.createReadStream(filepath2)
          }
          return null
        },
      ])
      const rl = readline.createInterface({
        input: streams,
        crlfDelay: Infinity
      });

      res.setHeader('Content-Type', 'text/tsv');
      res.setHeader('Content-Disposition', 'attachment; filename=\"' + `device${req.query.deviceId}-` + Date.now() + '.tsv\"');
      res.write("DATE\tTIME\tPFC\tMPPT\tUPS\n")
      for await (const row of rl) {
        const [datetime, data] = row.split(" -> ");
        const formatedDateTime = moment(new Date(datetime)).add(5, 'hours').add(30, 'minutes');

        if (formatedDateTime.format('DD/MM/YYYY') === selectedDate) {
          const jsonData = JSON.parse(data)
          if (jsonData.name.includes('PFC')) {
            res.write(`${formatedDateTime.format('DD/MM/YYYY')}\t ${formatedDateTime.format('HH:MM:SS')}\tttl=${jsonData.ttl}::${jsonData.data}\t\t\n`)
          }

          if (jsonData.name.includes('MP')) {
            res.write(`${formatedDateTime.format('DD/MM/YYYY')}\t ${formatedDateTime.format('HH:MM:SS')}\t\tttl=${jsonData.ttl}::${jsonData.data}\t\n`)
          }

          if (jsonData.name.includes('UPS')) {
            res.write(`${formatedDateTime.format('DD/MM/YYYY')}\t ${formatedDateTime.format('HH:MM:SS')}\t\t\tttl=${jsonData.ttl}::${jsonData.data}\n`)
          }
        }
      }
      res.end()
    } else {
      res.send("FILE DOES NOT EXISTS")
    }
    // console.log(filepath);
  });
};
