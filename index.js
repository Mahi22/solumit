require('dotenv').config();
var Particle = require('particle-api-js');
var rxjs = require('rxjs');
var operators = require('rxjs/operators');
var knex = require('knex');
var express = require('express');
var bodyParser = require('body-parser');
const Excel = require('exceljs');
var moment = require('moment');

var  app = express();

var particle = new Particle();

var auth = '5ddcf180fa86c2e0109555d2e6db846d767bb95c';

const deviceId  = '1f0053000451353432383931';

const db = knex({
    client: process.env.DB_CLIENT || 'pg',
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      socketPath: process.env.DB_SOCKET_PATH,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      ssl: process.env.DB_SSL,
      multipleStatements: true,
      charset: 'utf8'
    }
  });

particle.getEventStream({ deviceId, auth }).then(function(stream) {
    const source = rxjs.fromEvent(stream, 'event');
    const inv = rxjs.interval(30000);

    const ups = source.pipe(
        operators.filter(val => val.name.includes('UPS')),
        operators.buffer(inv),
        operators.map(values => values.map(d => d.data).filter(d => d.includes('OpV'))),
        operators.map(a => a.map(v => {
            if (v) {
                var line1 = v.substring(0, 16).split(' ');
                var line2 = v.substring(16, 32).split(' ');
                var l1 = parseInt(line1[2].replace(/[^\d.-]/g, ''));
                var l2 = parseInt(line1[3].replace(/[^\d.-]/g, ''));
                var lt = parseInt(line1[1].replace(/[^\d.-]/g, ''));
                return { OpV: parseInt(line1[0].replace(/[^\d.-]/g, '')), Vb: parseInt(line2[0].replace(/[^\d.-]/g, '')), l1, l2, lt }
            } else {
                return { OpV: 0, l1: 0, l2: 0, lt: 0,  Vb: 0 };
            }
         })),
        operators.map(val => {
            const result = val.reduce((acc, curr) => {
                acc.OpV += curr.OpV;
                acc.l1 += curr.l1;
                acc.l2 += curr.l2;
                acc.lt += curr.lt;
                acc.Vb += curr.Vb;
                return acc;
            }, { OpV: 0, l1: 0, l2: 0, lt: 0,  Vb: 0 });

            const length = val.length;

            return {
                OpV: result.OpV / length,
                l1: result.l1 / length,
                l2: result.l2 / length,
                lt: result.lt / length,
                Vb: result.Vb / length
            };
        })
    );

    const pfc = source.pipe(
        operators.filter(val => val.name.includes('PFC')),
        operators.buffer(inv),
        operators.map(vals => {
            const inpL = vals.map(val => val.data).filter(data => data.includes('Vi')).map(data => data.substring(16, 32).split(' '));
            const inputLine = inpL.reduce((acc, curr) => {
                acc.Vi += parseInt(curr[0].replace(/[^\d.-]/g, ''));
                acc.Ii += parseInt(curr[1].replace(/[^\d.-]/g, ''));
                return acc;
            }, { Vi: 0, Ii: 0 })
            const outL = vals.map(val => val.data).filter(data => data.includes('Vb')).map(data => data.substring(16, 32).split(' '));
            const outputLine = outL.reduce((acc, curr) => {
                acc.Vb += parseInt(curr[0].replace(/[^\d.-]/g, ''));
                acc.Io += parseInt(curr[1].replace(/[^\d.-]/g, ''));
                return acc;
            }, { Vb: 0, Io: 0 })
            return { Vi: inputLine.Vi / (inpL.length || 1), Ii: inputLine.Ii / (inpL.length || 1), Vb: outputLine.Vb / (outL.length || 1), Io: outputLine.Io / (outL.length || 1) };
        }),
    );

    const mp1 = source.pipe(
        operators.filter(val => val.name.includes('MP1')),
        operators.filter(val => val.data.includes('Vi') || (val.data.includes('Vb') && !val.data.includes('ILVb'))),
        operators.buffer(inv),
        operators.map(vals => {
            const inpL = vals.map(val => val.data).filter(data => data.includes('Vi')).map(data => data.substring(16, 32).split(' '));
            const inputLine = inpL.reduce((acc, curr) => {
                acc.Vi += parseInt(curr[1].replace(/[^\d.-]/g, ''));
                acc.Ii += parseInt(curr[2].replace(/[^\d.-]/g, ''));
                return acc;
            }, { Vi: 0, Ii: 0 })
            const outL = vals.map(val => val.data).filter(data => data.includes('Vb')).map(data => data.substring(16, 32).split(' '));
            const outputLine = outL.reduce((acc, curr) => {
                acc.Vb += parseInt(curr[0].replace(/[^\d.-]/g, ''));
                acc.Io += parseInt(curr[1].replace(/[^\d.-]/g, ''));
                return acc;
            }, { Vb: 0, Io: 0 })
            return { Vi: inputLine.Vi / (inpL.length || 1), Ii: inputLine.Ii / (inpL.length || 1), Vb: outputLine.Vb / (outL.length || 1), Io: outputLine.Io / (outL.length || 1) };
        })
    );

    // ups.subscribe(val => console.log('UPS ROBOT', val));
    // pfc.subscribe(val => console.log('PFC ROBOT', val));
    // mp1.subscribe(val => console.log('MP1 ROBOT', val));
    
    const values = rxjs.zip(ups, pfc, mp1);
    values.subscribe(val => {
        console.log(val);
        db('device3').insert({
            fortime: new Date().toISOString(),
            ups_opv: val[0].OpV,
            ups_vb: val[0].Vb,
            ups_l1: val[0].l1,
            ups_l2: val[0].l2,
            ups_lt: val[0].lt,
            pfc_vi: val[1].Vi,
            pfc_ii: val[1].Ii,
            pfc_vb: val[1].Vb,
            pfc_io: val[1].Io,
            pfc_vm: 299,
            mp1_vi: val[2].Vi,
            mp1_ii: val[2].Ii,
            mp1_vb: val[2].Vb,
            mp1_io: val[2].Io,
            mp1_vm: 299,
        }).then(val => {
            console.log('INSRTED VALUE ', new Date().toISOString());
        }).catch(console.log);
    });
}, function (err) {
    console.log(err);
});

app.use(bodyParser.json());

app.get('/excel', function (req, res) {
    // console.log(req.query);
    var workbook = new Excel.Workbook();

    var sheet = workbook.addWorksheet('Data');

    var fileName = 'SindhData.xlsx';

    sheet.columns = [
        { header: 'Date And Time', key: 'fortime', dateFormat: 'YYYY-MM-DD[T]HH:mm:ss', dateUTC: true },
        { header: 'UPS OpV', key: 'ups_opv' },
        { header: 'UPS Vb', key: 'ups_vb' },
        { header: 'UPS l1', key: 'ups_l1' },
        { header: 'UPS l2', key: 'ups_l2' },
        { header: 'UPS lt', key: 'ups_lt' },
        { header: 'PFC Vi', key: 'pfc_vi' },
        { header: 'PFC Ii', key: 'pfc_ii' },
        { header: 'PFC Vm', key: 'pfc_vm' },
        { header: 'PFC Vb', key: 'pfc_vb' },
        { header: 'PFC Io', key: 'pfc_io' },
        { header: 'MPPT Vi', key: 'mp1_vi' },
        { header: 'MPPT Ii', key: 'mp1_ii' },
        { header: 'MPPT Vm', key: 'mp1_vm' },
        { header: 'MPPT Vb', key: 'mp1_vb' },
        { header: 'MPPT Io', key: 'mp1_io' },
    ]

    const querybuilder = db('device3').select('*');

    if (req.query.startDate) {
        querybuilder.where('fortime', '>=', moment(req.query.startDate).startOf('day').toISOString());
    }

    if (req.query.endDate) {
        querybuilder.where('fortime', '<', moment(req.query.endDate).endOf('day').toISOString());
    }

    querybuilder.then(values => {
        values.forEach(val => {
            val.fortime = moment(val.fortime).utcOffset('+05:30').toISOString();
            sheet.addRow(val);
        });
        // console.log('ADDED values');
        // res.type('application/json');
        // res.send(values);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader("Content-Disposition", "attachment; filename=" + fileName);
        workbook.xlsx.write(res, { dateFormat: 'YYYY-MM-DD[T]HH:mm:ss', dateUTC: true }).then(function(){
            res.end();
        });
    });
    
});

app.listen(8080);
