const {Machine, State} = require('xstate');

const toggleMachine = Machine({
    initial: 'q1',
    states: {
        q1: {
            on: {
                ANSWER: [
                    {target: 'q6', cond: 'q1 = baz'},
                    {target: 'q2'}
                ] 
            }
        },
        q2: {
            on: {
                ANSWER: 'q3'
            }
        },
        q3: {
            on: {
                ANSWER: [
                    {target: 'q4', cond: 'q1 = foo q3 = bar'},
                    {target: 'q5', cond: 'q1 = bar q3 = foo'},
                    {target: 'q6'}
                ]
            }
        },
        q4: {
            on: {
                ANSWER: 'q6'
            }
        },
        q5: {
            on: {
                ANSWER: 'q6'
            }
        },
        q6: {}
    }
}, {
    guards: {
        'q1 = baz': function(answers, event, currentQuestion) {
            return answers.q1 === 'baz';
        },
        'q1 = foo q3 = bar': function(answers) {
            return answers.q1 === 'foo' && answers.q3 === 'bar';

        },
        'q1 = bar q3 = foo': function(answers) {
            return answers.q1 === 'bar' && answers.q3 === 'foo';
        }
    }
});



const routeHistory = [];
const answers = {};

let currentState = toggleMachine.initialState;
routeHistory.push(currentState);



function next(event, answer) {

    answers[currentState] = answer;

    //console.log(currentState.value, ': ', currentState.history, '\n\n\n');
    currentState = toggleMachine.transition(currentState, event, answers);

    routeHistory.push(currentState);

    console.log('currentState: ', currentState.value);

}


function back() {
    const previousState = routeHistory.pop();

    const initialState = previousState
        ? State.from(previousState, answers)
        : machine.initialState;

    currentState = initialState;

    console.log(currentState.value);
}

next('ANSWER', 'foo'); //q1
next('ANSWER', 'q2-ans'); //q2
next('ANSWER', 'bar'); //q3
next('ANSWER', 'q4-ans'); //q4


console.log(routeHistory);
// back();
// back();
// back();
// back();
// next('ANSWER', 'bar'); //q1
// next('ANSWER', 'q2-ans'); //q2
// next('ANSWER', 'foo'); //q3
// next('ANSWER', 'q4-ans'); //q4




//console.log(answers);
//console.log(routeHistory);


// const paymentMachine = Machine({
//     initial: 'method',
//     states: {
//       method: {
//         initial: 'cash',
//         states: {
//           cash: { on: { SWITCH_CHECK: 'check' } },
//           check: { on: { SWITCH_CASH: 'cash' } },
//           hist: { history: true }
//         },
//         on: { NEXT: 'review' }
//       },
//       review: {
//         on: { PREVIOUS: 'method.hist' }
//       }
//     }
//   });
  
//   const checkState = paymentMachine
//     .transition('method.cash', 'SWITCH_CHECK');

// console.log("checkState:",checkState.history);
// console.log('############################################\n\n');
  
//   // => State {
//   //   value: { method: 'check' },
//   //   history: State { ... }
//   // }
  
//   const reviewState = paymentMachine
//     .transition(checkState, 'NEXT');

// console.log("reviewState:",reviewState.history);
// console.log('############################################\n\n');
  
//   // => State {
//   //   value: 'review',
//   //   history: State { ... }
//   // }
  
//   const previousState = paymentMachine
//     .transition(reviewState, 'PREVIOUS')
//     .value;

// console.log("previousState:",previousState.history);
// console.log('############################################\n\n');
  
//   // => { method: 'check' }
  



