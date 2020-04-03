var Particle = require('particle-api-js');
var rxjs = require('rxjs');
var operators = require('rxjs/operators');
var knex = require('knex');
var moment = require('moment');
var logFile = require('./logfile');

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

function device1Transform(v) {
    // console.log('DEVICE DATA', v);
    if (v) {
        // var line1 = v.substring(0, 16).split(' ');
        // var line2 = v.substring(16, 32).split(' ');
        // var l1 = parseInt(line1[2].replace(/[^\d.-]/g, ''));
        // var l2 = parseInt(line1[3].replace(/[^\d.-]/g, ''));
        // var lt = parseInt(line1[1].replace(/[^\d.-]/g, ''));
        // return { OpV: parseInt(line1[0].replace(/[^\d.-]/g, '')), Vb: parseInt(line2[0].replace(/[^\d.-]/g, '')), l1, l2, lt }
        // console.log('VALUEE ', v);
        var arr = v.split(' ');
        return {
            OpV: parseInt(arr[1].replace(/[^\d.-]/g, ''), 10),
            Vb: parseInt(arr[3].replace(/[^\d.-]/g, ''), 10),
            l1: 0,
            l2: 0,
            lt: parseInt(arr[2].replace(/[^\d.-]/g, ''), 10) * 2
        }
    } else {
        return { OpV: 0, l1: 0, l2: 0, lt: 0,  Vb: 0 };
    }
}

function device3Transform(v) {
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
}

function fetchDeviceData(deviceId, auth, dbDevice) {
  var particle = new Particle();

//   console.log('DbDevice', dbDevice);

  particle.getEventStream({ deviceId, auth }).then(function(stream) {
    const source = rxjs.fromEvent(stream, 'event').pipe(
        operators.tap(val => {
            logFile(JSON.stringify(val), `${dbDevice}_${moment().format('DD_MM_YYYY')}.log`);
        }),
        operators.share(),
        operators.catchError(err => {
            logFile(`Error - \t ${JSON.stringify(err)}`, `${deviceId}.log`);
        }));

    // emit on diff
    // source.pipe(
    //     operators.tap(val => {

    //     })
    // ).subscribe();
    const inv = rxjs.interval(30000);

    const upsSource = source.pipe(
        operators.filter(val => val.name.includes('UPS')),
        operators.share()
    );

    const upsChange = upsSource.pipe(
        operators.filter(val => val.data.includes('UPS')),
        operators.distinctUntilChanged((prev, curr) => prev.data ===  curr.data)
    );

    upsChange.subscribe(val => {
        logFile(JSON.stringify(val), `${dbDevice}_change_${moment().format('DD_MM_YYYY')}.log`);
    });

    const ups = upsSource.pipe(
        operators.tap(val => console.log('UPS', val)),
        operators.buffer(inv),
        operators.map(values => values.map(d => d.data).filter(d => {
            // dbDevice === 'device1' ? d.includes('O/p') : d.includes('OpV'))
            if (dbDevice === 'device1') {
                return d.includes('O/p');
            } else if (dbDevice === 'device3' || dbDevice === 'device2') {
                return d.includes('OpV');
            }
        })),
        operators.map(a => {
        //   console.log('Device VALUES', a);
          if (a.length === 0) {
            return [{ OpV: 0, l1: 0, l2: 0, lt: 0,  Vb: 0 }];
          }
          return a.map(v => {
            // if (v) {
            //     var line1 = v.substring(0, 16).split(' ');
            //     var line2 = v.substring(16, 32).split(' ');
            //     var l1 = parseInt(line1[2].replace(/[^\d.-]/g, ''));
            //     var l2 = parseInt(line1[3].replace(/[^\d.-]/g, ''));
            //     var lt = parseInt(line1[1].replace(/[^\d.-]/g, ''));
            //     return { OpV: parseInt(line1[0].replace(/[^\d.-]/g, '')), Vb: parseInt(line2[0].replace(/[^\d.-]/g, '')), l1, l2, lt }
            // } else {
            //     return { OpV: 0, l1: 0, l2: 0, lt: 0,  Vb: 0 };
            // }
            if (dbDevice === 'device1') {
                return device1Transform(v);
            } else if (dbDevice === 'device3' || dbDevice === 'device2') {
                return device3Transform(v);
            }
         })
        }),
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

    const pfcSource = source.pipe(
        operators.filter(val => val.name.includes('PFC')),
        operators.share()
    );

    const pfcChange = pfcSource.pipe(
        // operators.filter(val => val.data.includes('Vi')),
        operators.distinctUntilChanged((prev, curr) => prev.data.substring(0, 15) ===  curr.data.substring(0, 15))
    );

    pfcChange.subscribe(val => {
        logFile(JSON.stringify(val), `${dbDevice}_change_${moment().format('DD_MM_YYYY')}.log`);
    });

    // const pfcOutputChange = pfcSource.pipe(
    //     operators.filter(val => val.data.includes('Vb')),
    //     operators.distinctUntilChanged((prev, curr) => prev.data.substring(0, 15) ===  curr.data.substring(0, 15))
    // );

    // pfcOutputChange.subscribe(val => {
    //     logFile(JSON.stringify(val), `${dbDevice}_change_${moment().format('DD_MM_YYYY')}.log`);
    // });

    const pfc = pfcSource.pipe(
        operators.tap(val => console.log('PFC', val)),
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

    const mp1Source = source.pipe(
        operators.filter(val => val.name.includes('MP1')),
        operators.share()
    );

    const mp1Change = mp1Source.pipe(
        // operators.filter(val => val.data.includes('Vi') && !val.data.includes('ILVb')),
        operators.distinctUntilChanged((prev, curr) => prev.data.substring(0, 15) ===  curr.data.substring(0, 15))
    );

    mp1Change.subscribe(val => {
        logFile(JSON.stringify(val), `${dbDevice}_change_${moment().format('DD_MM_YYYY')}.log`);
    });

    // const mp1OutputChange = mp1Source.pipe(
    //     operators.filter(val => val.data.includes('Vb') && !val.data.includes('ILVb')),
    //     operators.distinctUntilChanged((prev, curr) => prev.data.substring(0, 15) ===  curr.data.substring(0, 15))
    // );

    // mp1OutputChange.subscribe(val => {
    //     logFile(JSON.stringify(val), `${dbDevice}_change_${moment().format('DD_MM_YYYY')}.log`);
    // });

    const mp1 = mp1Source.pipe(
        operators.tap(val => console.log('MP1', val)),
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
        db(dbDevice).insert({
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
            console.log(`INSRTED VALUE ${dbDevice}`, new Date().toISOString());
        }).catch(console.log);
    });
  }, function (err) {
      console.log(err);
  });
}

module.exports = fetchDeviceData;
