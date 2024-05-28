'use strict';

const createParallelRouter = require('../lib/index');
const spec = require('./template');

const parallelRouter = createParallelRouter({spec});

function log(state) {
    console.log(
        `taskId: ${state.context.id}; progress: ${state.context.progress.join(
            ', '
        )}; answers: ${JSON.stringify(state.context.answers)}; status: ${JSON.stringify(
            state.context.status
        )}`
    );
}

log(parallelRouter.current());
log(parallelRouter.next());
log(parallelRouter.next({q: true}));
log(parallelRouter.next());
log(parallelRouter.next());
log(parallelRouter.next());
log(parallelRouter.next());
log(parallelRouter.next());
log(parallelRouter.next());
log(parallelRouter.next());
log(parallelRouter.next({q: false}, 'b'));
// log(parallelRouter.next());

// // complete t1
// log('t1', t1.current());
// t1.next();
// t1.next({q: true});
// log('t1', t1.next());

// // complete t2
// log('t2', t2.current());
// t2.next();
// log('t2', t2.next({q: true})); // g answer

// // complete t3
// log('t3', t3.current());
// t3.next();
// log('t3', t3.next());

// // complete t4
// log('t4', t4.current());
// t4.next();
// log('t4', t4.next());

// log('t1', t1.next({q: false}, 'b'));
// log('t1', t1.next());
// console.log('BREAKING CHANGE: ANSWERING D2 HAS IMPLICATIONS ON t2 WHICH HAS IMPLICATIONS ON t3');
// const d2AnswerResult = t1.next();

// processEvents(d2AnswerResult, [t1, t2, t3, t4]);

// log('t1', d2AnswerResult); // d2 answer should raise an event
// log('t2', t2.current());
// log('t3', t3.current());
// log('t4', t4.current());

// tasklist([t1, t2, t3, t4]);
// progress([t1, t2, t3, t4]);

// function tasklist(machines) {
//     const statuses = machines.map((machine, i) => {
//         const state = machine.first();

//         return {
//             id: state.id,
//             status: state.context.answers[`t${i + 1}-status`]
//         };
//     });

//     console.log(statuses);
// }

// function progress(machines) {
//     const statuses = machines.map(machine => {
//         const state = machine.current();

//         return state.context.progress;
//     });

//     console.log(statuses.flat());
// }

// function processEvents(thingWithEvents, machines) {
//     const newEvents = [];

//     if ('events' in thingWithEvents) {
//         thingWithEvents.events.forEach(event => {
//             const machinesToTarget = machines.slice(
//                 machines.findIndex(machine => machine.id === event.source) + 1
//             );

//             machinesToTarget.forEach(machine => {
//                 const cascadeIndex = machine.findCascadeIndex2(event.type);

//                 if (cascadeIndex > -1) {
//                     const removedIds = machine.removeProgress(cascadeIndex);
//                     const implicitEvents = removedIds.map(removedId => ({
//                         type: removedId,
//                         source: machine.id
//                     }));
//                     newEvents.push(...implicitEvents);
//                 }
//             });
//         });
//     }

//     if (newEvents.length >= 1) {
//         processEvents({events: newEvents}, machines);
//     }
// }

// const machines = parallelRouter(template);

// const t1 = machines[0];
// const t2 = machines[1];
// const t3 = machines[2];
// const t4 = machines[3];

// // complete t1
// log('t1', t1.current());
// t1.next();
// t1.next({q: true});
// log('t1', t1.next());

// // complete t2
// log('t2', t2.current());
// t2.next();
// log('t2', t2.next({q: true})); // g answer

// // complete t3
// log('t3', t3.current());
// t3.next();
// log('t3', t3.next());

// // complete t4
// log('t4', t4.current());
// t4.next();
// log('t4', t4.next());

// log('t1', t1.next({q: false}, 'b'));
// log('t1', t1.next());
// console.log('BREAKING CHANGE: ANSWERING D2 HAS IMPLICATIONS ON t2 WHICH HAS IMPLICATIONS ON t3');
// const d2AnswerResult = t1.next();

// processEvents(d2AnswerResult, [t1, t2, t3, t4]);

// log('t1', d2AnswerResult); // d2 answer should raise an event
// log('t2', t2.current());
// log('t3', t3.current());
// log('t4', t4.current());

// tasklist([t1, t2, t3, t4]);
// progress([t1, t2, t3, t4]);
